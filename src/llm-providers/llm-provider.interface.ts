import { EventEmitter } from 'events';

/**
 * Interface for all LLM providers
 */
export interface ILLMProvider extends EventEmitter {
    /**
     * Unique identifier for this provider instance
     */
    readonly id: string;

    /**
     * The name of the LLM provider
     */
    readonly name: string;

    /**
     * The active model for this provider
     */
    readonly model: string;

    /**
     * Get provider capabilities
     */
    getCapabilities(): IProviderCapabilities;

    /**
     * Check if the provider is available
     */
    isAvailable(): Promise<boolean>;

    /**
     * Get current provider status
     */
    getStatus(): 'active' | 'inactive' | 'error';

    /**
     * Initialize the provider with configuration
     */
    initialize(config: ILLMProviderConfig): Promise<void>;

    /**
     * Connect to the provider
     */
    connect(): Promise<void>;

    /**
     * Disconnect from the provider
     */
    disconnect(): Promise<void>;

    /**
     * Generate a completion from a prompt
     */
    generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: ILLMRequestOptions
    ): Promise<ILLMResponse>;

    /**
     * Stream a completion from a prompt
     */
    streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: ILLMRequestOptions
    ): AsyncIterableIterator<ILLMResponse>;

    /**
     * Cancel an ongoing completion request
     */
    cancelCompletion(requestId: string): Promise<void>;

    /**
     * Get available models for this provider
     */
    getAvailableModels(): Promise<string[]>;

    /**
     * Validate provider configuration
     */
    validateConfig(config: ILLMProviderConfig): Promise<boolean>;
}

/**
 * Provider capabilities interface
 */
export interface IProviderCapabilities {
    supportsStreaming: boolean;
    supportsMultipleModels: boolean;
    supportsSystemPrompts: boolean;
    maxTokens: number;
    supportedLanguages: string[];
}

/**
 * Configuration interface for LLM providers
 */
export interface ILLMProviderConfig {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    organizationId?: string;
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
}

/**
 * Options for LLM requests
 */
export interface ILLMRequestOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
    timeout?: number;
}

/**
 * Response from an LLM
 */
export interface ILLMResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    metadata?: Record<string, any>;
    requestId?: string;
    model?: string;
    finishReason?: 'stop' | 'length' | 'timeout' | 'error';
}
