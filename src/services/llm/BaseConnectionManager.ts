import { EventEmitter } from 'events';
import { LLMProvider, LLMProviderStatus } from '../../llm/llm-provider';
import { LLMProviderRegistryService } from './services/LLMProviderRegistryService';
import { 
    ConnectionEventData, 
    ConnectionEvent, 
    HealthCheckResponse,
    ConnectionState,
    ModelInfo,
    RetryConfig,
    LLMConnectionError,
    LLMConnectionErrorCode
} from './types';

/**
 * Base class for LLM connection management
 * Provides common functionality for connection handling, health monitoring, and error management
 */
export abstract class BaseConnectionManager extends EventEmitter {
    protected activeProvider: LLMProvider | null = null;
    protected readonly providerRegistry: LLMProviderRegistryService;
    protected currentStatus: LLMProviderStatus = { isConnected: false, isAvailable: false, error: '' };
    private healthCheckInterval: NodeJS.Timer | null = null;
    
    protected readonly retryConfig: RetryConfig = {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffFactor: 2,
        currentAttempt: 0,
        timeout: 10000
    };

    constructor(config?: Partial<RetryConfig>) {
        super();
        this.providerRegistry = new LLMProviderRegistryService();
        if (config) {
            this.retryConfig = { ...this.retryConfig, ...config };
        }
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.providerRegistry.on('providerStatusChanged', this.handleProviderStatusChange.bind(this));
    }

    protected registerProvider(name: string, provider: LLMProvider): void {
        this.providerRegistry.registerProvider(name, provider);
    }

    public async configureProvider(name: string, options?: Record<string, unknown>): Promise<void> {
        try {
            const provider = await this.providerRegistry.configureProvider(name, options);
            this.activeProvider = provider;
            this.emit(ConnectionEvent.StateChanged, this.createConnectionEventData());
        } catch (error) {
            this.handleConnectionError(error);
        }
    }

    protected async connect(): Promise<void> {
        this.retryConfig.currentAttempt = 0;
        while (this.retryConfig.currentAttempt < this.retryConfig.maxAttempts) {
            try {
                await this.establishConnection();
                this.startHealthChecks();
                this.emit(ConnectionEvent.Connected);
                return;
            } catch (error) {
                this.retryConfig.currentAttempt++;
                if (this.retryConfig.currentAttempt === this.retryConfig.maxAttempts) {
                    throw new LLMConnectionError(
                        LLMConnectionErrorCode.ConnectionFailed,
                        `Failed to connect after ${this.retryConfig.maxAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`
                    );
                }
                const delay = Math.min(
                    this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, this.retryConfig.currentAttempt),
                    this.retryConfig.maxDelay
                );
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    protected async disconnect(): Promise<void> {
        this.stopHealthChecks();
        await this.terminateConnection();
        this.currentStatus = { isConnected: false, isAvailable: false, error: '' };
        this.emit(ConnectionEvent.Disconnected);
    }

    protected abstract establishConnection(): Promise<void>;
    protected abstract terminateConnection(): Promise<void>;
    protected abstract performHealthCheck(): Promise<HealthCheckResponse>;

    protected async handleConnectionError(error: unknown): Promise<void> {
        const formattedError = error instanceof Error ? error : new Error(String(error));
        this.currentStatus = {
            ...this.currentStatus,
            isConnected: false,
            error: formattedError.message
        };
        
        this.emit(ConnectionEvent.Error, formattedError);
        this.emit(ConnectionEvent.StateChanged, this.createConnectionEventData());
        
        if (this.shouldAttemptReconnect(error)) {
            await this.reconnect();
        }
    }

    protected startHealthChecks(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.performHealthCheck();
                if (health.status === 'error') {
                    await this.handleHealthCheckFailure(health);
                } else {
                    // Reset retry counter on successful health check
                    this.retryConfig.currentAttempt = 0;
                    // Update model info if available
                    if (health.models?.length) {
                        this.currentStatus.metadata = {
                            ...this.currentStatus.metadata,
                            modelInfo: health.models[0]
                        };
                    }
                }
            } catch (error) {
                await this.handleConnectionError(error);
            }
        }, 30000); // 30 second interval
    }

    protected stopHealthChecks(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    protected async handleHealthCheckFailure(health: HealthCheckResponse): Promise<void> {
        const error = new LLMConnectionError(
            LLMConnectionErrorCode.HealthCheckFailed,
            health.message || 'Health check failed'
        );
        await this.handleConnectionError(error);
    }

    private handleProviderStatusChange(data: { name: string; status: LLMProviderStatus }): void {
        if (this.activeProvider?.name === data.name) {
            this.currentStatus = data.status;
            this.emit(ConnectionEvent.StateChanged, this.createConnectionEventData());
        }
    }

    private async reconnect(): Promise<void> {
        try {
            this.emit(ConnectionEvent.Reconnecting);
            await this.connect();
        } catch (error) {
            console.error('Reconnection failed:', error);
            await this.handleConnectionError(error);
        }
    }

    private shouldAttemptReconnect(error: unknown): boolean {
        if (this.retryConfig.currentAttempt >= this.retryConfig.maxAttempts) {
            return false;
        }

        // Network-related errors are generally retryable
        if (error instanceof Error) {
            const networkErrors = [
                'ECONNREFUSED',
                'ECONNRESET',
                'ETIMEDOUT',
                'ENOTFOUND',
                'NETWORK_ERROR',
                'DISCONNECT'
            ];
            return networkErrors.some(code => error.message.includes(code));
        }

        return false;
    }

    protected createConnectionEventData(): ConnectionEventData {
        return {
            state: this.currentStatus.isConnected ? 'connected' : 'disconnected',
            timestamp: new Date(),
            error: this.currentStatus.error ? new Error(this.currentStatus.error) : undefined,
            modelInfo: this.currentStatus.metadata?.modelInfo
        };
    }

    public getStatus(): LLMProviderStatus {
        return this.currentStatus;
    }

    public dispose(): void {
        this.stopHealthChecks();
        this.disconnect().catch(console.error);
        this.removeAllListeners();
    }
}