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

export interface IHealthCheckResult {
    isHealthy: boolean;
    timestamp: number;
    details?: Record<string, any>;
}

export interface ILLMModelInfo {
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

export interface IProviderStatus {
    state: ProviderState;
    activeModel?: string;
    error?: Error;
    lastHealthCheck?: IHealthCheckResult;
}

export interface LLMProvider extends EventEmitter {
    readonly id: string;
    readonly name: string;

    isAvailable(): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getStatus(): IProviderStatus;
    getAvailableModels(): Promise<ILLMModelInfo[]>;
    getModelInfo(modelId: string): Promise<ILLMModelInfo>;
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

export interface ModelInfo {
    version: string;
    provider: string;
    hardwareRequirements?: HardwareRequirements;
    capabilities: string[];
    supportedFormats: string[];
    parameters: Record<string, any>;
}

export interface ModelRequirements {
    minVersion?: string;
    hardware?: HardwareRequirements;
    capabilities?: string[];
    formats?: string[];
    parameters?: Record<string, any>;
}

export interface ModelValidationResult {
    isValid: boolean;
    errors: any[];
    warnings: string[];
}

export interface ModelCompatibilityResult {
    isCompatible: boolean;
    errors: any[];
    warnings: string[];
}

export interface HardwareRequirements {
    minMemoryGB?: number;
    minCPUCores?: number;
    gpuRequired?: boolean;
}

export type ModelCapabilities = string[];
