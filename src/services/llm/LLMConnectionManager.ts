/**
 * LLM Connection Manager - Primary manager for LLM connections, integrating metrics, 
 * error handling, event management, and health monitoring.
 */
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { 
    ConnectionState, 
    LLMConnectionOptions, 
    ConnectionStateChangeEvent,
    ConnectionErrorEvent,
    ConnectionEvent,
    HealthCheckResponse,
    ConnectionEventData,
    ConnectionStatus,
    ModelInfo,
    LLMConnectionError,
    LLMConnectionErrorCode
} from './types';
import { LLMProvider, LLMProviderStatus } from '../../llm/llm-provider';
import { LLMProviderRegistryService } from './services/LLMProviderRegistryService';
import { LLMConnectionHandlerService } from './services/LLMConnectionHandlerService';
import { LLMRetryManagerService } from './services/LLMRetryManagerService';
import { LLMStatusReporterService } from './services/LLMStatusReporterService';
import { LLMHealthMonitorService } from './services/LLMHealthMonitorService';
import { LLMMetricsService } from './services/LLMMetricsService';
import { LLMErrorHandlerService } from './services/LLMErrorHandlerService';
import { LLMConnectionEventService } from './services/LLMConnectionEventService';
import { ConnectionMetricsTracker } from './ConnectionMetricsTracker';
import { ConnectionPoolManager } from './services/ConnectionPoolManager';

/**
 * Primary manager for LLM connections
 * Handles connection lifecycle, error handling, metrics, events, and health monitoring
 */
export class LLMConnectionManager extends EventEmitter implements vscode.Disposable {
    private static instance: LLMConnectionManager;
    private readonly providerRegistry: LLMProviderRegistryService;
    private readonly connectionHandler: LLMConnectionHandlerService;
    private readonly retryManager: LLMRetryManagerService;
    private readonly statusReporter: LLMStatusReporterService;
    private readonly healthMonitor: LLMHealthMonitorService;
    private readonly metricsService: LLMMetricsService;
    private readonly errorHandler: LLMErrorHandlerService;
    private readonly eventService: LLMConnectionEventService;
    private readonly metricsTracker: ConnectionMetricsTracker;
    private readonly connectionPool: ConnectionPoolManager;
    
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private activeProvider: LLMProvider | null = null;
    private connectionOptions: LLMConnectionOptions = {};
    private currentStatus: LLMProviderStatus = {
        isConnected: false,
        isAvailable: false,
        error: ''
    };

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
        this.metricsTracker = new ConnectionMetricsTracker();
        this.connectionPool = ConnectionPoolManager.getInstance({
            maxSize: options.maxConnections || 5,
            minSize: options.minConnections || 1,
            acquireTimeout: options.connectionTimeout || 30000
        });
        this.connectionOptions = options;
        
        this.setupEventListeners();
        this.startHealthMonitoring();
    }

    public static getInstance(options: Partial<LLMConnectionOptions> = {}): LLMConnectionManager {
        if (!LLMConnectionManager.instance) {
            LLMConnectionManager.instance = new LLMConnectionManager(options);
        }
        return LLMConnectionManager.instance;
    }

    private setupEventListeners(): void {
        this.providerRegistry.on('providerStatusChanged', 
            this.handleProviderStatusChange.bind(this));
    }

    private setupEventHandlers(): void {
        this.errorHandler.on('error', this.handleError.bind(this));
        this.errorHandler.on('retrying', this.handleRetry.bind(this));
        this.healthMonitor.on(ConnectionEvent.HealthCheckFailed, 
            this.handleHealthCheckFailure.bind(this));
        this.eventService.on(ConnectionEvent.StateChanged, 
            this.handleStateChange.bind(this));
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
            throw new LLMConnectionError(
                LLMConnectionErrorCode.ProviderNotFound,
                `Provider ${name} not found`
            );
        }

        await this.disconnect(); // Ensure clean disconnect from current provider
        await this.connectionHandler.setActiveProvider(provider);
        this.activeProvider = provider;
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
            const connection = await this.connectionPool.acquire(
                this.connectionHandler.activeProviderName || 'default'
            );
            
            await this.connectionHandler.connect(connection);
            this.metricsTracker.recordConnectionSuccess();
            this.metricsTracker.recordRequest(Date.now() - startTime);
            
            this.currentStatus.isConnected = true;
            this.currentStatus.isAvailable = true;
            this.currentStatus.error = '';

            this.emit(ConnectionEvent.Connected);
            this.emit(ConnectionEvent.StateChanged, this.createConnectionEventData());
            this.updateStatus();
            return true;
        } catch (error) {
            await this.handleConnectionError(error);
            return await this.retryManager.handleConnectionFailure(() => this.connectToLLM());
        }
    }

    public async disconnect(): Promise<void> {
        this.retryManager.clearRetryTimeout();
        this.stopHealthMonitoring();
        
        if (this.connectionHandler.activeProviderName) {
            await this.connectionPool.clear(this.connectionHandler.activeProviderName);
        }
        
        await this.connectionHandler.disconnect();
        this.currentStatus.isConnected = false;
        this.currentStatus.isAvailable = false;

        this.emit(ConnectionEvent.Disconnected);
        this.emit(ConnectionEvent.StateChanged, this.createConnectionEventData());
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
                    await this.handleHealthCheckFailure(health);
                } else {
                    this.metricsService.recordSuccessfulHealthCheck(
                        this.connectionHandler.activeProviderName || 'unknown'
                    );
                }
            } catch (error) {
                await this.handleConnectionError(error);
            }
        }, 30000); // 30 second interval
    }

    private stopHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    private handleProviderStatusChange(providerName: string, status: LLMProviderStatus): void {
        this.emit('providerStatusChanged', providerName, status);
        if (this.connectionHandler.activeProviderName === providerName) {
            this.updateStatus();
        }
        this.metricsService.recordProviderStatus(providerName, status);
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

    private createConnectionEventData(): ConnectionEventData {
        return {
            state: this.currentStatus.isConnected ? 'connected' : 'disconnected',
            timestamp: new Date(),
            error: this.currentStatus.error ? new Error(this.currentStatus.error) : undefined,
            modelInfo: this.currentStatus.metadata?.modelInfo
        };
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

    public getCurrentState(): ConnectionState {
        return this.eventService.getCurrentState();
    }

    public getActiveProvider(): LLMProvider | null {
        return this.activeProvider;
    }

    public getStatus(): LLMProviderStatus {
        return this.currentStatus;
    }

    public getMetrics(): Map<string, ConnectionMetrics> {
        return this.metricsService.getAllMetrics();
    }

    public getConnectionPoolStats(): Record<string, unknown> {
        return this.connectionHandler.activeProviderName ? 
            this.connectionPool.getStats(this.connectionHandler.activeProviderName) : 
            {};
    }

    public dispose(): void {
        this.retryManager.clearRetryTimeout();
        this.stopHealthMonitoring();
        this.disconnect().catch(console.error);
        this.connectionPool.dispose();
        this.statusReporter.dispose();
        this.metricsService.dispose();
        this.errorHandler.dispose();
        this.eventService.dispose();
        this.healthMonitor.dispose();
        this.removeAllListeners();
    }
}