import { EventEmitter } from 'events';
import {
    LLMProvider,
    LLMModelInfo,
    LLMMessage,
    LLMRequestOptions,
    LLMResponse,
    LLMStreamEvent
} from '../../../llm/types';
import { ProviderConfig } from '../validators/ProviderConfigValidator';
import { ProviderError } from '../errors';

// Define locally any types that aren't in the main types file
export enum ProviderState {
    Unknown = 'unknown',
    Registered = 'registered',
    Initializing = 'initializing',
    Active = 'active',
    Deactivating = 'deactivating',
    Inactive = 'inactive',
    Error = 'error'
}

export interface ProviderStatus {
    state: ProviderState;
    activeModel?: string;
    error?: Error;
    lastHealthCheck?: HealthCheckResult;
}

export interface HealthCheckResult {
    isHealthy: boolean;
    latency: number;
    timestamp: number;
    error?: Error;
}

export interface ProviderCapabilities {
    maxContextTokens: number;
    streamingSupport: boolean;
    supportedFormats: string[];
    multimodalSupport: boolean;
    supportsTemperature: boolean;
    supportsTopP: boolean;
    supportsPenalties: boolean;
    supportsRetries: boolean;
}

export abstract class BaseLLMProvider extends EventEmitter implements LLMProvider {
    protected state: ProviderState = ProviderState.Unknown;
    protected config: ProviderConfig;
    protected currentModel?: LLMModelInfo;
    protected lastError?: Error;
    protected lastHealthCheck?: HealthCheckResult;
    private healthCheckTimer?: NodeJS.Timeout;

    constructor(
        public readonly id: string,
        public readonly name: string,
        config: ProviderConfig
    ) {
        super();
        this.config = config;
        this.setupHealthCheck();
    }

    protected abstract performHealthCheck(): Promise<HealthCheckResult>;

    public async healthCheck(): Promise<HealthCheckResult> {
        try {
            const startTime = Date.now();
            const result = await this.performHealthCheck();
            const endTime = Date.now();
            
            this.lastHealthCheck = {
                ...result,
                latency: endTime - startTime,
                timestamp: endTime
            };
            
            return this.lastHealthCheck;
        } catch (error) {
            const result: HealthCheckResult = {
                isHealthy: false,
                error: error instanceof Error ? error : new Error(String(error)),
                latency: 0,
                timestamp: new Date()
            };
            this.handleHealthCheckFailure(result);
            return result;
        }
    }

    protected handleHealthCheckFailure(result: HealthCheckResult): void {
        this.setError(result.error || new Error('Health check failed'));
    }

    abstract isAvailable(): Promise<boolean>;
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
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
            timestamp: new Date()
        });
    }

    protected setError(error: Error): void {
        this.lastError = error;
        this.setState(ProviderState.Error);
        this.emit('error', {
            providerId: this.id,
            error,
            timestamp: new Date()
        });
    }

    public getStatus(): ProviderStatus {
        return {
            state: this.state,
            activeModel: this.currentModel?.id,
            error: this.lastError,
            lastHealthCheck: this.lastHealthCheck
        };
    }

    public async dispose(): Promise<void> {
        if (this.healthCheckTimer) {
            clearTimeout(this.healthCheckTimer);
        }
        await this.disconnect();
        this.removeAllListeners();
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
            ) as unknown as NodeJS.Timeout;
        }
    }
}