import { EventEmitter } from 'events';
import { OfflineCache } from '../offline/offlineCache';

/**
 * Represents an error from an LLM provider
 */
export class LLMProviderError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public override readonly cause?: unknown
    ) {
        super(message);
        this.name = 'LLMProviderError';
    }
}

/**
 * Message role types for chat-based interactions
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Interface for message objects in chat-based interactions with LLMs
 */
export interface LLMMessage {
    role: MessageRole;
    content: string;
    timestamp?: number;
    metadata?: Record<string, unknown>;
}

/**
 * Common options for LLM requests
 */
export interface LLMRequestOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
    metadata?: Record<string, unknown>;
}

/**
 * Response structure from LLM providers
 */
export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    metadata?: Record<string, unknown>;
}

/**
 * Stream response event from LLM providers
 */
export interface LLMStreamEvent {
    content: string;
    isComplete: boolean;
    metadata?: Record<string, unknown>;
}

/**
 * Model capabilities and information
 */
export interface LLMModelInfo {
    id: string;
    name: string;
    provider: string;
    capabilities: string[];
    parameters?: number;
    contextLength?: number;
    quantization?: string;
    license?: string;
}

/**
 * Provider status information
 */
export interface LLMProviderStatus {
    isAvailable: boolean;
    isConnected: boolean;
    activeModel?: string;
    error?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Base interface for all LLM providers
 */
export interface LLMProvider extends EventEmitter {
    /**
     * Name of the provider
     */
    readonly name: string;

    /**
     * Check if the provider is available and ready to use
     */
    isAvailable(): Promise<boolean>;

    /**
     * Connect to the provider
     */
    connect(): Promise<void>;

    /**
     * Disconnect from the provider
     */
    disconnect(): Promise<void>;

    /**
     * Get current connection status
     */
    getStatus(): LLMProviderStatus;

    /**
     * Get available models from this provider
     */
    getAvailableModels(): Promise<LLMModelInfo[]>;

    /**
     * Get information about a specific model
     */
    getModelInfo(modelId: string): Promise<LLMModelInfo>;

    /**
     * Generate text completion based on a single prompt
     */
    generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;

    /**
     * Generate chat completion based on message history
     */
    generateChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;

    /**
     * Stream a text completion
     */
    streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;

    /**
     * Stream a chat completion
     */
    streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;
}

/**
 * Base implementation for LLM providers with common functionality
 */
export abstract class BaseLLMProvider extends EventEmitter implements LLMProvider {
    protected offlineMode: boolean = false;
    protected cache: OfflineCache;
    protected status: LLMProviderStatus;

    constructor() {
        super();
        this.cache = new OfflineCache();
        this.status = {
            isAvailable: false,
            isConnected: false
        };
    }

    abstract get name(): string;

    setOfflineMode(enabled: boolean): void {
        this.offlineMode = enabled;
        this.emit('offlineModeChanged', enabled);
    }

    protected async useCachedResponse(prompt: string): Promise<string | null> {
        if (!this.offlineMode) {return null;}
        return this.cache.get(prompt);
    }

    protected async cacheResponse(prompt: string, response: string): Promise<void> {
        await this.cache.set(prompt, response);
    }

    protected updateStatus(updates: Partial<LLMProviderStatus>): void {
        this.status = { ...this.status, ...updates };
        this.emit('statusChanged', this.status);
    }

    getStatus(): LLMProviderStatus {
        return { ...this.status };
    }

    protected handleError(error: unknown, code = 'UNKNOWN_ERROR'): never {
        if (error instanceof LLMProviderError) {
            throw error;
        }
        throw new LLMProviderError(
            code,
            error instanceof Error ? error.message : String(error),
            error
        );
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
}
