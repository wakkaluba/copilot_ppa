import { ProviderCapabilities, LLMRequest, TokenUsage } from './types';

export interface LLMRequestOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
    stream?: boolean;
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
    model?: string;
    finishReason?: string;
}

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMStreamEvent {
    content: string;
    done: boolean;
}

/**
 * Hardware specifications for LLM models
 */
export interface HardwareSpecs {
    minRamGB: number;
    recommendedRamGB: number;
    minGpuMemoryGB?: number;
    recommendedGpuMemoryGB?: number;
    requiresCuda?: boolean;
    minCudaVersion?: string;
    cpuOnly?: boolean;
}

/**
 * Information about an LLM model
 */
export interface LLMModelInfo {
    id: string;
    name: string;
    provider: string;
    parameters: number;
    contextLength: number;
    supportedFeatures: string[];
    quantization?: string;
    fileSize?: number;
    license?: string;
    supportsFinetuning?: boolean;
}

/**
 * Base class for LLM providers
 */
export abstract class LLMProvider {
    /**
     * Name of the LLM provider
     */
    abstract readonly name: string;

    /**
     * Indicates if the provider is available on the system
     */
    abstract readonly isAvailable: boolean;

    /**
     * Connect to the LLM provider
     */
    abstract connect(): Promise<void>;
    
    /**
     * Disconnect from the LLM provider
     */
    abstract disconnect(): Promise<void>;
    
    /**
     * Check if the provider is connected
     */
    abstract isConnected(): boolean;
    
    /**
     * List available models from the provider
     */
    abstract listModels(): Promise<string[]>;
    
    /**
     * Get model info
     */
    abstract getModelInfo(modelId: string): Promise<LLMModelInfo>;
    
    /**
     * Generate a completion from the LLM
     */
    abstract generateCompletion(
        model: string, 
        prompt: string, 
        systemPrompt?: string, 
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;
    
    /**
     * Stream a completion from the LLM
     */
    abstract streamCompletion(
        model: string, 
        prompt: string, 
        systemPrompt?: string, 
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;
}

/**
 * LLM provider with cache capabilities
 */
export interface LLMProviderWithCache extends LLMProvider {
    useCachedResponse(prompt: string): Promise<string | null>;
    cacheResponse(prompt: string, response: string): Promise<void>;
    setOfflineMode(enabled: boolean): void;
}
