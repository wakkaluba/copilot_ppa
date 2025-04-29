import { EventEmitter } from 'events';
import { LLMProvider, LLMProviderOptions } from './llmProvider';
import { ConnectionMetricsTracker } from './ConnectionMetricsTracker';
import { formatProviderError } from './connectionUtils';
import { LLMConnectionError, ModelNotFoundError } from './errors';
import { ConnectionState } from '../../types/llm';

export abstract class BaseLLMProvider extends EventEmitter implements LLMProvider {
    protected connectionState: ConnectionState = ConnectionState.DISCONNECTED;
    protected metricsTracker: ConnectionMetricsTracker;
    protected lastError?: Error;
    protected currentModel?: string;

    constructor(
        public readonly id: string,
        public readonly name: string
    ) {
        super();
        this.metricsTracker = new ConnectionMetricsTracker();
    }

    abstract generateCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMProviderOptions): Promise<{ 
        content: string; 
        model: string;
        usage?: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
    }>;

    abstract streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMProviderOptions,
        callback?: (event: { content: string; done: boolean }) => void
    ): Promise<void>;

    abstract isAvailable(): Promise<boolean>;
    
    abstract listModels(): Promise<Array<{name: string, modified_at: string, size: number}>>;

    isConnected(): boolean {
        return this.connectionState === ConnectionState.CONNECTED;
    }

    async connect(): Promise<void> {
        try {
            this.connectionState = ConnectionState.CONNECTING;
            this.emit('stateChanged', this.connectionState);

            const startTime = Date.now();
            await this.performConnect();
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

    async disconnect(): Promise<void> {
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

    protected abstract performConnect(): Promise<void>;
    protected abstract performDisconnect(): Promise<void>;

    protected handleError(error: Error): void {
        this.lastError = error;
        this.emit('error', error);
        
        if (error instanceof LLMConnectionError) {
            if (error.code === 'PROVIDER_UNAVAILABLE') {
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

    public dispose(): void {
        if (this.connectionState === ConnectionState.CONNECTED) {
            this.disconnect().catch(console.error);
        }
        this.removeAllListeners();
    }
}