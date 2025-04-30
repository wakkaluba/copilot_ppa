import { BaseLLMProvider, ProviderCapabilities, HealthCheckResult } from './BaseLLMProvider';
import { LLMModelInfo, LLMMessage, LLMRequestOptions, LLMResponse, LLMStreamEvent } from '../types';
import { ProviderConfig } from '../validators/ProviderConfigValidator';
export declare class OllamaProvider extends BaseLLMProvider {
    private client;
    private modelDetails;
    constructor(config: ProviderConfig);
    protected performHealthCheck(): Promise<HealthCheckResult>;
    isAvailable(): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private refreshModels;
    getAvailableModels(): Promise<LLMModelInfo[]>;
    getModelInfo(modelId: string): Promise<LLMModelInfo>;
    getCapabilities(): Promise<ProviderCapabilities>;
    generateCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions): Promise<LLMResponse>;
    generateChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse>;
    streamCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
    streamChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
    private convertModelInfo;
    private parseParameterSize;
    private formatChatMessages;
}
