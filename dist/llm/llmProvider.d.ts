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
    testConnection(): Promise<{
        success: boolean;
    }>;
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
export declare abstract class BaseLLMProvider implements LLMProvider {
    protected offlineMode: boolean;
    protected cache: OfflineCache;
    constructor();
    setOfflineMode(enabled: boolean): void;
    useCachedResponse(prompt: string): Promise<string | null>;
    cacheResponse(prompt: string, response: string): Promise<void>;
    abstract initialize(): Promise<void>;
    abstract generateResponse(prompt: string, options?: LLMPromptOptions): Promise<string>;
    abstract getAvailableModels(): Promise<string[]>;
    testConnection(): Promise<{
        success: boolean;
    }>;
    getModelId(): string;
    sendPrompt(prompt: string, options?: LLMPromptOptions): Promise<string>;
    abstract generateCompletion(prompt: string, options?: CompletionOptions): Promise<string>;
    abstract isAvailable(): Promise<boolean>;
    abstract getModelName(): string;
}
