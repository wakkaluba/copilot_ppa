import { EventEmitter } from 'events';

/**
 * Options for LLM requests
 */
export interface LLMRequestOptions {
    /** Temperature for sampling (higher = more random) */
    temperature?: number;
    
    /** Maximum number of tokens to generate */
    maxTokens?: number;
    
    /** Whether to stream the response */
    stream?: boolean;
    
    /** Stop sequences to end generation */
    stopSequences?: string[];
    
    /** Any additional provider-specific options */
    [key: string]: any;
}

/**
 * Response from an LLM
 */
export interface LLMResponse {
    /** Content/text of the response */
    content: string;
    
    /** Optional token usage statistics */
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * Message for chat-based LLMs
 */
export interface LLMMessage {
    /** Role of the message sender (system, user, assistant) */
    role: 'system' | 'user' | 'assistant' | string;
    
    /** Content of the message */
    content: string;
}

/**
 * Event for streaming responses
 */
export interface LLMStreamEvent {
    /** Content chunk */
    content: string;
    
    /** Whether this is the final chunk */
    done: boolean;
}

/**
 * Model information
 */
export interface LLMModelInfo {
    /** Unique identifier for the model */
    id: string;
    
    /** Display name of the model */
    name: string;
    
    /** Provider name */
    provider: string;
    
    /** Model size in parameters (e.g., "7B", "13B") */
    parameter_size?: string;
    
    /** Model description */
    description?: string;
    
    /** Model license */
    license?: string;
    
    /** Model tags */
    tags?: string[];
    
    /** Whether the model is installed locally */
    installed?: boolean;
    
    /** Size of the model on disk */
    size?: string;
    
    /** Additional provider-specific model information */
    [key: string]: any;
}

/**
 * Status of an LLM provider
 */
export interface LLMProviderStatus {
    /** Whether the provider is connected */
    isConnected: boolean;
    
    /** Active model ID, if any */
    activeModel: string | null;
    
    /** Active model information, if any */
    modelInfo: LLMModelInfo | null;
    
    /** Error information, if any */
    error: Error | null;
}

/**
 * Error thrown by LLM providers
 */
export class LLMProviderError extends Error {
    code: string;
    
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        this.name = 'LLMProviderError';
    }
}

/**
 * Interface for LLM providers
 */
export interface LLMProvider extends EventEmitter {
    /** Name of the provider */
    readonly name: string;
    
    /** Check if the provider is available (e.g., API is reachable) */
    isAvailable(): Promise<boolean>;
    
    /** Connect to the provider */
    connect(): Promise<void>;
    
    /** Disconnect from the provider */
    disconnect(): Promise<void>;
    
    /** Get current status of the provider */
    getStatus(): LLMProviderStatus;
    
    /** Get information about a specific model */
    getModelInfo(modelId: string): Promise<LLMModelInfo>;
    
    /** Get available models from this provider */
    getAvailableModels(): Promise<LLMModelInfo[]>;

    /**
     * Generate a completion from a prompt
     * @param model Model ID to use
     * @param prompt Text prompt to complete
     * @param systemPrompt Optional system prompt
     * @param options Request options
     */
    generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;
    
    /**
     * Generate a chat completion from a series of messages
     * @param model Model ID to use
     * @param messages Chat messages
     * @param options Request options
     */
    generateChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;
    
    /**
     * Stream a completion from a prompt
     * @param model Model ID to use
     * @param prompt Text prompt to complete
     * @param systemPrompt Optional system prompt
     * @param options Request options
     * @param callback Callback for receiving streaming chunks
     */
    streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;
    
    /**
     * Stream a chat completion from a series of messages
     * @param model Model ID to use
     * @param messages Chat messages
     * @param options Request options
     * @param callback Callback for receiving streaming chunks
     */
    streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;

    /**
     * Optional: Set offline mode
     * @param enabled Whether offline mode should be enabled
     */
    setOfflineMode?(enabled: boolean): Promise<void>;
    
    /**
     * Optional: Get cached response for a prompt
     * @param prompt The prompt to look up in the cache
     */
    useCachedResponse?(prompt: string): Promise<string | null>;
    
    /**
     * Optional: Cache a response for a prompt
     * @param prompt The prompt to cache
     * @param response The response to cache
     */
    cacheResponse?(prompt: string, response: string): Promise<void>;
    
    /**
     * Optional: Get the last response generated
     */
    getLastResponse?(): string | null;
}

/**
 * Abstract base class for LLM providers
 * Provides basic implementation of the LLMProvider interface
 */
export abstract class BaseLLMProvider extends EventEmitter implements LLMProvider {
    readonly name: string;
    protected status: LLMProviderStatus = {
        isConnected: false,
        activeModel: null,
        modelInfo: null,
        error: null
    };
    
    constructor(name: string) {
        super();
        this.name = name;
    }
    
    abstract isAvailable(): Promise<boolean>;
    
    abstract connect(): Promise<void>;
    
    abstract disconnect(): Promise<void>;
    
    abstract getAvailableModels(): Promise<LLMModelInfo[]>;
    
    abstract getModelInfo(modelId: string): Promise<LLMModelInfo>;
    
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
    
    getStatus(): LLMProviderStatus {
        return { ...this.status };
    }
    
    protected updateStatus(partial: Partial<LLMProviderStatus>): void {
        this.status = { ...this.status, ...partial };
        this.emit('stateChanged', this.status);
    }
}
