import { EventEmitter } from 'events';
import {
    ILLMMessage,
    ILLMModelInfo,
    ILLMRequest,
    ILLMRequestOptions,
    ILLMResponse,
    ILLMStreamEvent,
    IProviderCapabilities
} from './types';

export interface ILLMProvider extends EventEmitter {
    readonly id: string;
    readonly name: string;

    getCapabilities(): IProviderCapabilities;
    isAvailable(): Promise<boolean>;
    getStatus(): 'active' | 'inactive' | 'error';

    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;

    completePrompt(request: ILLMRequest): Promise<ILLMResponse>;
    streamPrompt?(request: ILLMRequest): AsyncIterable<ILLMResponse>;
    cancelRequest(requestId: string): Promise<boolean>;

    generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: ILLMRequestOptions
    ): Promise<ILLMResponse>;

    streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: ILLMRequestOptions,
        callback?: (event: ILLMStreamEvent) => void
    ): Promise<void>;

    generateChatCompletion(
        model: string,
        messages: ILLMMessage[],
        options?: ILLMRequestOptions
    ): Promise<ILLMResponse>;

    streamChatCompletion(
        model: string,
        messages: ILLMMessage[],
        options?: ILLMRequestOptions,
        callback?: (event: ILLMStreamEvent) => void
    ): Promise<void>;

    getModelInfo(modelId: string): Promise<ILLMModelInfo>;
    getAvailableModels(): Promise<ILLMModelInfo[]>;

    setOfflineMode(enabled: boolean): void;
    cacheResponse?(prompt: string, response: ILLMResponse): Promise<void>;
    useCachedResponse?(prompt: string): Promise<ILLMResponse | null>;
}

export interface ILLMRequestOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
    stream?: boolean;
}

export interface ILLMResponse {
    content: string;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
    model?: string;
    finishReason?: string;
}

export interface ILLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ILLMStreamEvent {
    content: string;
    done: boolean;
}

/**
 * Hardware specifications for LLM models
 */
export interface HardwareSpecs {
    minRamGB: number;
    recommendedRamGB: number;
    minGpuMemoryGB?: number;
    recommendedGpuMemoryGB?: number;
    requiresCuda?: boolean;
    minCudaVersion?: string;
    cpuOnly?: boolean;
}

/**
 * Information about an LLM model
 */
export interface ILLMModelInfo {
    id: string;
    name: string;
    provider: string;
    parameters: number;
    contextLength: number;
    supportedFeatures: string[];
    quantization?: string;
    fileSize?: number;
    license?: string;
    supportsFinetuning?: boolean;
}
