import axios, { AxiosInstance } from 'axios';
import { Config } from '../config';
import {
    BaseLLMProvider,
    LLMMessage,
    LLMModelInfo,
    LLMProviderError,
    LLMRequestOptions,
    LLMResponse,
    LLMStreamEvent
} from './llm-provider';

interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    system?: string;
    stream?: boolean;
    options?: {
        temperature?: number;
        num_predict?: number;
        top_p?: number;
        frequency_penalty?: number;
        presence_penalty?: number;
        stop?: string[];
    };
}

interface OllamaChatRequest {
    model: string;
    messages: { role: string; content: string }[];
    stream?: boolean;
    options?: {
        temperature?: number;
        num_predict?: number;
        top_p?: number;
        frequency_penalty?: number;
        presence_penalty?: number;
        stop?: string[];
    };
}

interface OllamaModelInfo {
    name: string;
    size: number;
    digest: string;
    details: {
        parameter_size?: string;
        quantization_level?: string;
        format?: string;
        families?: string[];
        capabilities?: string[];
    };
    license?: string;
}

/**
 * Implementation of the LLMProvider interface for Ollama
 */
export class OllamaProvider extends BaseLLMProvider {
    readonly name = 'Ollama';
    private client: AxiosInstance;
    private modelDetails: Map<string, OllamaModelInfo> = new Map();

    constructor(baseUrl = Config.ollamaApiUrl) {
        super();
        this.client = axios.create({
            baseURL: baseUrl,
            timeout: 30000
        });
    }

    async isAvailable(): Promise<boolean> {
        try {
            await this.client.get('/api/tags');
            this.updateStatus({ isAvailable: true });
            return true;
        } catch (error) {
            this.updateStatus({ 
                isAvailable: false,
                error: 'Failed to connect to Ollama service'
            });
            return false;
        }
    }

    async connect(): Promise<void> {
        const available = await this.isAvailable();
        if (!available) {
            throw new LLMProviderError(
                'CONNECTION_FAILED',
                'Failed to connect to Ollama service'
            );
        }
        this.updateStatus({ isConnected: true });
    }

    async disconnect(): Promise<void> {
        this.updateStatus({ isConnected: false });
    }

    async getAvailableModels(): Promise<LLMModelInfo[]> {
        try {
            const response = await this.client.get('/api/tags');
            const models = response.data.models || [];
            return Promise.all(models.map(async (model: { name: string }) => {
                const info = await this.getModelInfo(model.name);
                return info;
            }));
        } catch (error) {
            return this.handleError(error, 'FETCH_MODELS_FAILED');
        }
    }

    async getModelInfo(modelId: string): Promise<LLMModelInfo> {
        try {
            // Check cache first
            if (this.modelDetails.has(modelId)) {
                const cached = this.modelDetails.get(modelId)!;
                return this.convertModelInfo(modelId, cached);
            }

            const response = await this.client.post('/api/show', { name: modelId });
            const modelInfo: OllamaModelInfo = response.data;
            
            // Cache the response
            this.modelDetails.set(modelId, modelInfo);
            
            return this.convertModelInfo(modelId, modelInfo);
        } catch (error) {
            return this.handleError(error, 'FETCH_MODEL_INFO_FAILED');
        }
    }

    async generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse> {
        try {
            if (this.offlineMode) {
                const cached = await this.useCachedResponse(prompt);
                if (cached) return { content: cached };
            }

            const request: OllamaGenerateRequest = {
                model,
                prompt,
                system: systemPrompt,
                options: {
                    temperature: options?.temperature,
                    num_predict: options?.maxTokens,
                    top_p: options?.topP,
                    frequency_penalty: options?.frequencyPenalty,
                    presence_penalty: options?.presencePenalty,
                    stop: options?.stop
                }
            };

            const response = await this.client.post('/api/generate', request);
            const result: LLMResponse = {
                content: response.data.response,
                usage: {
                    promptTokens: response.data.prompt_eval_count || 0,
                    completionTokens: response.data.eval_count || 0,
                    totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
                }
            };

            if (this.offlineMode) {
                await this.cacheResponse(prompt, result.content);
            }

            return result;
        } catch (error) {
            return this.handleError(error, 'GENERATE_FAILED');
        }
    }

    async generateChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions
    ): Promise<LLMResponse> {
        try {
            const request: OllamaChatRequest = {
                model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                options: {
                    temperature: options?.temperature,
                    num_predict: options?.maxTokens,
                    top_p: options?.topP,
                    frequency_penalty: options?.frequencyPenalty,
                    presence_penalty: options?.presencePenalty,
                    stop: options?.stop
                }
            };

            const response = await this.client.post('/api/chat', request);
            return {
                content: response.data.message.content,
                usage: {
                    promptTokens: response.data.prompt_eval_count || 0,
                    completionTokens: response.data.eval_count || 0,
                    totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
                }
            };
        } catch (error) {
            return this.handleError(error, 'CHAT_FAILED');
        }
    }

    async streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void> {
        try {
            const request: OllamaGenerateRequest = {
                model,
                prompt,
                system: systemPrompt,
                stream: true,
                options: {
                    temperature: options?.temperature,
                    num_predict: options?.maxTokens,
                    top_p: options?.topP,
                    frequency_penalty: options?.frequencyPenalty,
                    presence_penalty: options?.presencePenalty,
                    stop: options?.stop
                }
            };

            const response = await this.client.post('/api/generate', request, {
                responseType: 'stream'
            });

            for await (const chunk of response.data) {
                const data = JSON.parse(chunk.toString());
                if (callback) {
                    callback({
                        content: data.response,
                        isComplete: data.done || false
                    });
                }
            }
        } catch (error) {
            this.handleError(error, 'STREAM_FAILED');
        }
    }

    async streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void> {
        try {
            const request: OllamaChatRequest = {
                model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                stream: true,
                options: {
                    temperature: options?.temperature,
                    num_predict: options?.maxTokens,
                    top_p: options?.topP,
                    frequency_penalty: options?.frequencyPenalty,
                    presence_penalty: options?.presencePenalty,
                    stop: options?.stop
                }
            };

            const response = await this.client.post('/api/chat', request, {
                responseType: 'stream'
            });

            for await (const chunk of response.data) {
                const data = JSON.parse(chunk.toString());
                if (callback) {
                    callback({
                        content: data.message?.content || '',
                        isComplete: data.done || false
                    });
                }
            }
        } catch (error) {
            this.handleError(error, 'STREAM_CHAT_FAILED');
        }
    }

    private convertModelInfo(modelId: string, info: OllamaModelInfo): LLMModelInfo {
        return {
            id: modelId,
            name: info.name,
            provider: 'ollama',
            capabilities: info.details?.capabilities || [],
            parameters: this.parseParameterSize(info.details?.parameter_size),
            contextLength: 4096, // Default for most Ollama models
            quantization: info.details?.quantization_level,
            license: info.license
        };
    }

    private parseParameterSize(size?: string): number | undefined {
        if (!size) return undefined;
        const match = size.match(/(\d+)([BM])/);
        if (!match) return undefined;
        const [, num, unit] = match;
        return unit === 'B' ? parseInt(num) : parseInt(num) / 1000;
    }
}
