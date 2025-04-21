/**
 * LLM Connection Manager - Responsible for managing connections to LLM services
 */
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ConnectionState, LLMConnectionOptions, ConnectionStateChangeEvent, ConnectionErrorEvent } from '../../types/llm';
import { LLMProviderRegistryService } from './services/LLMProviderRegistryService';
import { LLMConnectionHandlerService } from './services/LLMConnectionHandlerService';
import { LLMRetryManagerService } from './services/LLMRetryManagerService';
import { LLMStatusReporterService } from './services/LLMStatusReporterService';
import { LLMProvider, LLMProviderStatus } from '../../llm/llm-provider';
import { LLMHealthMonitorService } from './services/LLMHealthMonitorService';
import { LLMMetricsService } from './services/LLMMetricsService';
import { ConnectionEventData, HealthCheckResponse } from './types';
import { LLMErrorHandlerService } from './services/LLMErrorHandlerService';
import { LLMConnectionEventService } from './services/LLMConnectionEventService';

/**
 * Primary manager for LLM connections, integrating metrics, error handling,
 * event management, and health monitoring.
 */
export class LLMConnectionManager extends EventEmitter {
    private static instance: LLMConnectionManager;
    private readonly providerRegistry: LLMProviderRegistryService;
    private readonly connectionHandler: LLMConnectionHandlerService;
    private readonly retryManager: LLMRetryManagerService;
    private readonly statusReporter: LLMStatusReporterService;
    private readonly healthMonitor: LLMHealthMonitorService;
    private readonly metricsService: LLMMetricsService;
    private readonly errorHandler: LLMErrorHandlerService;
    private readonly eventService: LLMConnectionEventService;
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private activeProvider: LLMProvider | null = null;
    private connectionOptions: LLMConnectionOptions = {};

    private constructor(options: Partial<LLMConnectionOptions> = {}) {
        super();
        this.providerRegistry = new LLMProviderRegistryService();
        this.connectionHandler = new LLMConnectionHandlerService(options);
        this.retryManager = new LLMRetryManagerService(options);
        this.statusReporter = new LLMStatusReporterService();
        this.healthMonitor = new LLMHealthMonitorService();
        this.metricsService = new LLMMetricsService();
        this.errorHandler = new LLMErrorHandlerService();
        this.eventService = new LLMConnectionEventService(this.metricsService);
        
        this.setupEventListeners();
        this.startHealthMonitoring();
        this.setupEventHandlers();
    }

    public static getInstance(options: Partial<LLMConnectionOptions> = {}): LLMConnectionManager {
        if (!LLMConnectionManager.instance) {
            LLMConnectionManager.instance = new LLMConnectionManager(options);
        }
        return LLMConnectionManager.instance;
    }

    public get connectionState(): ConnectionState {
        return this.connectionHandler.currentState;
    }

    public registerProvider(name: string, provider: LLMProvider): void {
        this.providerRegistry.registerProvider(name, provider);
        this.metricsService.initializeMetrics(name);
        provider.on('statusChanged', (status) => {
            this.handleProviderStatusChange(name, status);
        });
    }

    public getProvider(name: string): LLMProvider | undefined {
        return this.providerRegistry.getProvider(name);
    }

    public async setActiveProvider(name: string): Promise<void> {
        const provider = this.providerRegistry.getProvider(name);
        if (!provider) {
            throw new Error(`Provider ${name} not found`);
        }

        await this.disconnect(); // Ensure clean disconnect from current provider
        await this.connectionHandler.setActiveProvider(provider);
        this.statusReporter.updateStatusBar(this.connectionState, provider.name);
        this.healthMonitor.setActiveProvider(provider);
        this.metricsService.setActiveProvider(name);
    }

    public async connectToLLM(): Promise<boolean> {
        try {
            if (this.connectionState === ConnectionState.CONNECTED) {
                return true;
            }

            const startTime = Date.now();
            await this.connectionHandler.connect();
            this.metricsService.recordConnectionTime(
                this.connectionHandler.activeProviderName || 'unknown',
                Date.now() - startTime
            );

            this.emit('connected');
            this.updateStatus();
            return true;
        } catch (error) {
            this.handleError(error);
            return await this.retryManager.handleConnectionFailure(() => this.connectToLLM());
        }
    }

    public async disconnect(): Promise<void> {
        this.retryManager.clearRetryTimeout();
        this.stopHealthMonitoring();
        await this.connectionHandler.disconnect();
        this.emit('disconnected');
        this.updateStatus();
    }

    private startHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.healthMonitor.performHealthCheck();
                if (health.status === 'error') {
                    this.handleHealthCheckFailure(health);
                } else {
                    this.metricsService.recordSuccessfulHealthCheck(
                        this.connectionHandler.activeProviderName || 'unknown'
                    );
                }
            } catch (error) {
                this.handleError(error);
            }
        }, 30000); // 30 second interval
    }

    private stopHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    private handleHealthCheckFailure(health: HealthCheckResponse): void {
        this.metricsService.recordFailedHealthCheck(
            this.connectionHandler.activeProviderName || 'unknown',
            health.message || 'Health check failed'
        );
        this.handleError(new Error(health.message || 'Health check failed'));
    }

    private handleProviderStatusChange(providerName: string, status: LLMProviderStatus): void {
        this.emit('providerStatusChanged', providerName, status);
        if (this.connectionHandler.activeProviderName === providerName) {
            this.updateStatus();
        }
        this.metricsService.recordProviderStatus(providerName, status);
    }

    private handleError(error: unknown): void {
        const errorEvent = this.connectionHandler.createErrorEvent(
            error,
            this.retryManager.retryCount
        );
        this.emit('error', errorEvent);
        this.metricsService.recordError(
            this.connectionHandler.activeProviderName || 'unknown',
            error
        );
    }

    private updateStatus(): void {
        const currentState = this.connectionState;
        const providerName = this.connectionHandler.activeProviderName;
        const eventData: ConnectionEventData = {
            state: currentState,
            timestamp: new Date(),
            error: this.connectionHandler.lastError,
            modelInfo: this.connectionHandler.activeProvider?.getModelInfo()
        };

        this.emit('stateChanged', eventData);
        this.statusReporter.updateStatusBar(currentState, providerName);
    }

    private setupEventHandlers(): void {
        this.errorHandler.on('error', this.handleError.bind(this));
        this.errorHandler.on('retrying', this.handleRetry.bind(this));
        this.healthMonitor.on(ConnectionEvent.HealthCheckFailed, this.handleHealthCheckFailure.bind(this));
        this.eventService.on(ConnectionEvent.StateChanged, this.handleStateChange.bind(this));
    }

    private async handleConnectionError(error: unknown): Promise<void> {
        const formattedError = error instanceof Error ? error : new Error(String(error));
        await this.eventService.transitionTo('error', { error: formattedError });
        await this.errorHandler.handleError(error);
    }

    private async handleError(event: { error: Error; retryCount: number }): Promise<void> {
        if (this.activeProvider) {
            this.metricsService.recordError(this.activeProvider.name, event.error);
        }
    }

    private async handleRetry(event: { error: Error; retryCount: number; delay: number }): Promise<void> {
        await this.eventService.transitionTo('reconnecting', { error: event.error });
        
        if (this.activeProvider) {
            try {
                await this.activeProvider.connect(this.connectionOptions);
                await this.eventService.transitionTo('connected', {
                    modelInfo: await this.activeProvider.getModelInfo()
                });
            } catch (error) {
                await this.handleConnectionError(error);
            }
        }
    }

    private async handleHealthCheckFailure(event: { error: Error }): Promise<void> {
        await this.handleConnectionError(event.error);
    }

    private handleStateChange(event: { currentState: ConnectionState }): void {
        this.emit(ConnectionEvent.StateChanged, event);
    }

    public getCurrentState(): ConnectionState {
        return this.eventService.getCurrentState();
    }

    public getActiveProvider(): LLMProvider | null {
        return this.activeProvider;
    }

    public getMetrics(): Map<string, ConnectionMetrics> {
        return this.metricsService.getAllMetrics();
    }

    public dispose(): void {
        this.retryManager.clearRetryTimeout();
        this.stopHealthMonitoring();
        this.disconnect().catch(console.error);
        this.statusReporter.dispose();
        this.metricsService.dispose();
        this.errorHandler.dispose();
        this.eventService.dispose();
        this.healthMonitor.dispose();
        this.removeAllListeners();
    }
}