import { OfflineCache } from '../offline/offlineCache';

export interface LLMProvider {
    initialize(config: any): Promise<void>;
    generateResponse(prompt: string): Promise<string>;
    testConnection(): Promise<{ success: boolean }>;
    getAvailableModels(): Promise<string[]>;
    setOfflineMode(enabled: boolean): void;
    useCachedResponse(prompt: string): Promise<string | null>;
    cacheResponse(prompt: string, response: string): Promise<void>;
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
}