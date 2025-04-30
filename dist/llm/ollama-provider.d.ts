import { BaseLLMProvider, LLMMessage, LLMModelInfo, LLMRequestOptions, LLMResponse, LLMStreamEvent } from './llm-provider';
/**
 * Implementation of the LLMProvider interface for Ollama
 */
export declare class OllamaProvider extends BaseLLMProvider {
    readonly name = "Ollama";
    private client;
    private modelDetails;
    constructor(baseUrl?: any);
    isAvailable(): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getAvailableModels(): Promise<LLMModelInfo[]>;
    getModelInfo(modelId: string): Promise<LLMModelInfo>;
    generateCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions): Promise<LLMResponse>;
    generateChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse>;
    streamCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
    streamChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
    private convertModelInfo;
    private parseParameterSize;
}
