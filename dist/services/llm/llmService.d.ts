export declare class LLMService {
    private provider;
    private cacheService;
    constructor(provider: LLMProvider);
    generateResponse(prompt: string, options?: LLMRequestOptions): Promise<string>;
    clearCache(): void;
    clearExpiredCache(): void;
}
export interface LLMRequestOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    [key: string]: any;
}
export interface LLMProvider {
    generateText(prompt: string, model: string, params: any): Promise<string>;
    getDefaultModel(): string;
    getAvailableModels(): Promise<string[]>;
}
