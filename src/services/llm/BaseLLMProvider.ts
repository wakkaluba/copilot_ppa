import { EventEmitter } from 'events';
import {
    ILLMConnectionProvider,
    ConnectionStatus,
    ModelInfo,
    HealthCheckResponse,
    ConnectionErrorCode
} from './interfaces';
import { ConnectionState } from '../../types/llm';
import { ConnectionMetricsTracker } from './ConnectionMetricsTracker';
import { LLMConnectionError, ModelNotFoundError } from './errors';
import { formatProviderError } from './connectionUtils';

/**
 * Base class for LLM providers with common functionality
 */
export abstract class BaseLLMProvider extends EventEmitter implements ILLMConnectionProvider {
    protected connectionState: ConnectionState = ConnectionState.DISCONNECTED;
    protected currentModel?: ModelInfo;
    protected readonly metricsTracker: ConnectionMetricsTracker;
    protected lastError?: Error;

    constructor(protected readonly name: string) {
        super();
        this.metricsTracker = new ConnectionMetricsTracker();
    }

    /**
     * Connect to the provider
     */
    public async connect(options: Record<string, unknown>): Promise<void> {
        try {
            this.connectionState = ConnectionState.CONNECTING;
            this.emit('stateChanged', this.connectionState);

            const startTime = Date.now();
            await this.performConnect(options);
            const endTime = Date.now();

            this.metricsTracker.recordConnectionSuccess();
            this.metricsTracker.recordRequest(endTime - startTime);

            this.connectionState = ConnectionState.CONNECTED;
            this.emit('stateChanged', this.connectionState);
            this.emit('connected');
        } catch (error) {
            const formattedError = formatProviderError(error, this.name);
            this.handleError(formattedError);
            throw formattedError;
        }
    }

    /**
     * Disconnect from the provider
     */
    public async disconnect(): Promise<void> {
        try {
            await this.performDisconnect();
            this.connectionState = ConnectionState.DISCONNECTED;
            this.emit('stateChanged', this.connectionState);
            this.emit('disconnected');
        } catch (error) {
            const formattedError = formatProviderError(error, this.name);
            this.handleError(formattedError);
            throw formattedError;
        }
    }

    /**
     * Get current connection status
     */
    public getStatus(): ConnectionStatus {
        return {
            state: this.connectionState,
            error: this.lastError,
            modelInfo: this.currentModel,
            metadata: {
                metrics: this.metricsTracker.getMetrics()
            }
        };
    }

    /**
     * Check if provider is available
     */
    public async isAvailable(): Promise<boolean> {
        try {
            const health = await this.healthCheck();
            return health.status === 'ok';
        } catch {
            return false;
        }
    }

    /**
     * Get current model info
     */
    public async getModelInfo(): Promise<ModelInfo | undefined> {
        if (!this.currentModel) {
            try {
                this.currentModel = await this.loadModelInfo();
            } catch (error) {
                const formattedError = formatProviderError(error, this.name);
                this.handleError(formattedError);
                throw formattedError;
            }
        }
        return this.currentModel;
    }

    /**
     * Get list of available models
     */
    public abstract getAvailableModels(): Promise<ModelInfo[]>;

    /**
     * Perform health check
     */
    public abstract healthCheck(): Promise<HealthCheckResponse>;

    /**
     * Set active model
     */
    protected async setModel(modelId: string): Promise<void> {
        const models = await this.getAvailableModels();
        const model = models.find(m => m.id === modelId);
        
        if (!model) {
            throw new ModelNotFoundError(modelId);
        }

        await this.loadModel(model);
        this.currentModel = model;
    }

    /**
     * Handle provider error
     */
    protected handleError(error: Error): void {
        this.lastError = error;
        this.emit('error', error);
        
        if (error instanceof LLMConnectionError) {
            if (error.code === ConnectionErrorCode.PROVIDER_UNAVAILABLE) {
                this.connectionState = ConnectionState.DISCONNECTED;
            } else {
                this.connectionState = ConnectionState.ERROR;
            }
        } else {
            this.connectionState = ConnectionState.ERROR;
        }

        this.emit('stateChanged', this.connectionState);
        this.metricsTracker.recordRequestFailure(error);
    }

    /**
     * Provider-specific connect implementation
     */
    protected abstract performConnect(options: Record<string, unknown>): Promise<void>;

    /**
     * Provider-specific disconnect implementation
     */
    protected abstract performDisconnect(): Promise<void>;

    /**
     * Provider-specific model info loading
     */
    protected abstract loadModelInfo(): Promise<ModelInfo>;

    /**
     * Provider-specific model loading
     */
    protected abstract loadModel(model: ModelInfo): Promise<void>;

    /**
     * Dispose of provider resources
     */
    public dispose(): void {
        if (this.connectionState === ConnectionState.CONNECTED) {
            this.disconnect().catch(console.error);
        }
        this.removeAllListeners();
    }

    /**
     * Perform model load
     */
    protected async performModelLoad(modelInfo: ModelInfo): Promise<void> {
        try {
            await this.loadModel(modelInfo);
            this.currentModel = modelInfo;
            this.emit('modelLoaded', modelInfo);
        } catch (error) {
            const formattedError = formatProviderError(error, this.name);
            this.handleError(formattedError);
            throw formattedError;
        }
    }

    /**
     * Perform model unload
     */
    protected async performModelUnload(): Promise<void> {
        if (this.currentModel) {
            try {
                await this.performDisconnect();
                const previousModel = this.currentModel;
                this.currentModel = undefined;
                this.emit('modelUnloaded', previousModel);
            } catch (error) {
                const formattedError = formatProviderError(error, this.name);
                this.handleError(formattedError);
                throw formattedError;
            }
        }
    }
}