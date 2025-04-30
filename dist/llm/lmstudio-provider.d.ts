import { LLMProvider, LLMMessage, LLMRequestOptions, LLMResponse, LLMStreamEvent } from './llm-provider';
/**
 * Implementation of LLMProvider for LM Studio's OpenAI-compatible API
 */
export declare class LMStudioProvider implements LLMProvider {
    readonly name = "LM Studio";
    private baseUrl;
    constructor(baseUrl?: any);
    /**
     * Check if LM Studio is available
     */
    isAvailable(): Promise<boolean>;
    /**
     * Get available models from LM Studio
     */
    getAvailableModels(): Promise<string[]>;
    /**
     * Generate text completion using LM Studio
     */
    generateCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions): Promise<LLMResponse>;
    /**
     * Generate chat completion using LM Studio
     */
    generateChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse>;
    /**
     * Stream a text completion from LM Studio
     */
    streamCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
    /**
     * Stream a chat completion from LM Studio
     */
    streamChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
}
