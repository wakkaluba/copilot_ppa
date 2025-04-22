import { EventEmitter } from 'events';
import {
    LLMProvider,
    LLMModelInfo,
    LLMMessage,
    LLMRequestOptions,
    LLMResponse,
    LLMStreamEvent,
    ProviderCapabilities,
    ProviderConfig,
    ProviderState,
    HealthCheckResult
} from '../types';
import { ProviderError, TimeoutError } from '../errors';

export abstract class BaseLLMProvider extends EventEmitter implements LLMProvider {
    protected state: ProviderState = ProviderState.Unknown;
    protected config: ProviderConfig;
    protected currentModel?: LLMModelInfo;
    protected lastError?: Error;
    private healthCheckTimer?: NodeJS.Timer;

    constructor(
        public readonly id: string,
        public readonly name: string,
        config: ProviderConfig
    ) {
        super();
        this.config = config;
        this.setupHealthCheck();
    }

    private setupHealthCheck(): void {
        if (this.config.healthCheck?.interval) {
            this.healthCheckTimer = setInterval(
                async () => {
                    try {
                        const result = await this.healthCheck();
                        if (!result.isHealthy) {
                            this.handleHealthCheckFailure(result);
                        }
                    } catch (error) {
                        console.error(`Health check failed for provider ${this.id}:`, error);
                    }
                },
                this.config.healthCheck.interval
            );
        }
    }

    protected abstract performHealthCheck(): Promise<HealthCheckResult>;

    public async healthCheck(): Promise<HealthCheckResult> {
        const timeout = this.config.healthCheck?.timeout || 5000;
        try {
            const result = await Promise.race([
                this.performHealthCheck(),
                new Promise<never>((_, reject) => {
                    setTimeout(() => {
                        reject(new TimeoutError(
                            'Health check timed out',
                            this.id,
                            'healthCheck',
                            timeout
                        ));
                    }, timeout);
                })
            ]);
            return result;
        } catch (error) {
            return {
                isHealthy: false,
                latency: -1,
                timestamp: Date.now(),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    protected handleHealthCheckFailure(result: HealthCheckResult): void {
        this.lastError = result.error;
        this.emit('healthCheck', {
            providerId: this.id,
            result
        });
    }

    abstract isAvailable(): Promise<boolean>;
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;

    public getStatus(): ProviderState {
        return this.state;
    }

    abstract getAvailableModels(): Promise<LLMModelInfo[]>;
    abstract getModelInfo(modelId: string): Promise<LLMModelInfo>;

    abstract getCapabilities(): Promise<ProviderCapabilities>;

    abstract generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;

    abstract generateChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;

    abstract streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;

    abstract streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;

    protected validateConfig(): void {
        if (!this.config.apiEndpoint) {
            throw new ProviderError('API endpoint is required', this.id);
        }
    }

    protected setState(state: ProviderState): void {
        this.state = state;
        this.emit('stateChanged', {
            providerId: this.id,
            state,
            timestamp: Date.now()
        });
    }

    protected setError(error: Error): void {
        this.lastError = error;
        this.setState(ProviderState.Error);
        this.emit('error', {
            providerId: this.id,
            error,
            timestamp: Date.now()
        });
    }

    public async dispose(): Promise<void> {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        await this.disconnect();
        this.removeAllListeners();
    }
}