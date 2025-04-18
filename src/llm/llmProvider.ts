import { OfflineCache } from '../offline/offlineCache';
export { LLMPromptOptions } from './types';

export interface CompletionOptions {
    conversation?: Array<{
        role: string;
        content: string;
    }>;
    context?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface LLMProvider {
    initialize(): Promise<void>;
    generateResponse(prompt: string, options?: LLMPromptOptions): Promise<string>;
    testConnection(): Promise<{ success: boolean }>;
    getAvailableModels(): Promise<string[]>;
    getModelId(): string;
    sendPrompt(prompt: string, options?: LLMPromptOptions): Promise<string>;
    generateCompletion(prompt: string, options?: CompletionOptions): Promise<string>;
    isAvailable(): Promise<boolean>;
    getModelName(): string;
}

export interface LLMConfig {
    endpoint: string;
    model: string;
    parameters: Record<string, any>;
}

export abstract class BaseLLMProvider implements LLMProvider {
    protected offlineMode: boolean = false;
    protected cache: OfflineCache;

    constructor() {
        this.cache = new OfflineCache();
    }

    setOfflineMode(enabled: boolean): void {
        this.offlineMode = enabled;
    }

    async useCachedResponse(prompt: string): Promise<string | null> {
        return this.cache.get(prompt);
    }

    async cacheResponse(prompt: string, response: string): Promise<void> {
        await this.cache.set(prompt, response);
    }

    abstract initialize(): Promise<void>;
    abstract generateResponse(prompt: string, options?: LLMPromptOptions): Promise<string>;
    abstract getAvailableModels(): Promise<string[]>;

    async testConnection(): Promise<{ success: boolean }> {
        return { success: true }; // Default implementation
    }

    getModelId(): string {
        return 'default'; // Default implementation
    }

    async sendPrompt(prompt: string, options?: LLMPromptOptions): Promise<string> {
        return this.generateResponse(prompt, options);
    }

    abstract generateCompletion(prompt: string, options?: CompletionOptions): Promise<string>;
    abstract isAvailable(): Promise<boolean>;
    abstract getModelName(): string;
}