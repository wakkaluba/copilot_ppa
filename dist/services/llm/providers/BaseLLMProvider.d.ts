import { EventEmitter } from 'events';
import { LLMProvider, LLMModelInfo, LLMMessage, LLMRequestOptions, LLMResponse, LLMStreamEvent } from '../../../llm/types';
import { ProviderConfig } from '../validators/ProviderConfigValidator';
export declare enum ProviderState {
    Unknown = "unknown",
    Registered = "registered",
    Initializing = "initializing",
    Active = "active",
    Deactivating = "deactivating",
    Inactive = "inactive",
    Error = "error"
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
export declare abstract class BaseLLMProvider extends EventEmitter implements LLMProvider {
    readonly id: string;
    readonly name: string;
    protected state: ProviderState;
    protected config: ProviderConfig;
    protected currentModel?: LLMModelInfo;
    protected lastError?: Error;
    protected lastHealthCheck?: HealthCheckResult;
    private healthCheckTimer?;
    constructor(id: string, name: string, config: ProviderConfig);
    protected abstract performHealthCheck(): Promise<HealthCheckResult>;
    healthCheck(): Promise<HealthCheckResult>;
    protected handleHealthCheckFailure(result: HealthCheckResult): void;
    abstract isAvailable(): Promise<boolean>;
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract getAvailableModels(): Promise<LLMModelInfo[]>;
    abstract getModelInfo(modelId: string): Promise<LLMModelInfo>;
    abstract getCapabilities(): Promise<ProviderCapabilities>;
    abstract generateCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions): Promise<LLMResponse>;
    abstract generateChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse>;
    abstract streamCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
    abstract streamChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
    protected validateConfig(): void;
    protected setState(state: ProviderState): void;
    protected setError(error: Error): void;
    getStatus(): ProviderStatus;
    dispose(): Promise<void>;
    private setupHealthCheck;
}
