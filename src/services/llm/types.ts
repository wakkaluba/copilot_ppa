import { EventEmitter } from 'events';

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMRequestOptions {
    temperature?: number;
    maxTokens?: number;
    topK?: number;
    presenceBonus?: number;
    frequencyBonus?: number;
    stopSequences?: string[];
}

export interface LLMResponse {
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface LLMStreamEvent {
    content: string;
    done: boolean;
}

export interface ProviderCapabilities {
    maxContextLength: number;
    supportsChatCompletion: boolean;
    supportsStreaming: boolean;
    supportsSystemPrompts: boolean;
}

export interface ProviderConfig {
    apiEndpoint: string;
    apiKey?: string;
    requestTimeout?: number;
    healthCheck?: {
        interval: number;
        timeout: number;
    };
}

export interface HealthCheckResult {
    isHealthy: boolean;
    latency: number;
    timestamp: number;
    error?: Error;
}

export interface LLMModelInfo {
    id: string;
    name: string;
    provider: string;
    maxContextLength: number;
    parameters: Record<string, any>;
    features: string[];
    metadata?: Record<string, any>;
}

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
    activeModel: string | undefined;
    error: Error | undefined;
    lastHealthCheck: HealthCheckResult | undefined;
}

export interface LLMProvider extends EventEmitter {
    readonly id: string;
    readonly name: string;
    
    isAvailable(): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getStatus(): ProviderStatus;
    getAvailableModels(): Promise<LLMModelInfo[]>;
    getModelInfo(modelId: string): Promise<LLMModelInfo>;
    getCapabilities(): Promise<ProviderCapabilities>;
    
    generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;
    
    generateChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;
    
    streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;
    
    streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;
}