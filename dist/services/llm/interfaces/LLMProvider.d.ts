export interface LLMProviderOptions {
    context?: string;
    maxTokens?: number;
    temperature?: number;
}
export interface LLMProvider {
    isConnected(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    generateCompletion(prompt: string, options?: LLMProviderOptions): Promise<string>;
}
