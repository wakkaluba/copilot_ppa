import axios from 'axios';
import { BaseLLMProvider, ProviderCapabilities, HealthCheckResult, ProviderState } from './BaseLLMProvider';
import {
    LLMModelInfo,
    LLMMessage,
    LLMRequestOptions,
    LLMResponse,
    LLMStreamEvent,
} from '../types';
import { ProviderConfig } from '../validators/ProviderConfigValidator';

// Define custom error classes since they're not exported from '../errors'
class ModelError extends Error {
    constructor(message: string, public providerId: string, public modelId: string) {
        super(message);
        this.name = 'ModelError';
    }
}

class ProviderError extends Error {
    constructor(message: string, public providerId: string, public details?: string) {
        super(message);
        this.name = 'ProviderError';
    }
}

class RequestError extends Error {
    constructor(message: string, public providerId: string, public originalError: Error) {
        super(message);
        this.name = 'RequestError';
    }
}

interface OllamaModelInfo {
    name: string;
    id: string;
    digest: string;
    size: number;
    details: {
        format: string;
        family: string;
        families?: string[];
        parameter_size?: string;
        quantization_level?: string;
        capabilities?: string[];
    };
    license?: string;
}

interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    system?: string | undefined;
    options?: {
        temperature?: number | null;
        num_predict?: number | null;
        top_k?: number | null;
        presence_penalty?: number | null;
        frequency_penalty?: number | null;
        stop?: string[] | null;
    } | undefined;
}

// Extend the LLMRequestOptions for Ollama-specific options
interface OllamaRequestOptions extends LLMRequestOptions {
    topK?: number;
    presenceBonus?: number;
    frequencyBonus?: number;
    stopSequences?: string[];
}

// Fix the OllamaStreamEvent interface to properly implement LLMStreamEvent
interface OllamaStreamEvent {
    content: string;
    done: boolean;
}

export class OllamaProvider extends BaseLLMProvider {
    private client: any; // Use any type instead of AxiosInstance
    private modelDetails = new Map<string, OllamaModelInfo>();

    constructor(config: ProviderConfig) {
        super(
            'ollama',
            'Ollama',
            config
        );
        this.client = axios.create({
            baseURL: config.apiEndpoint,
            timeout: config.requestTimeout || 30000
        });
    }

    protected async performHealthCheck(): Promise<HealthCheckResult> {
        try {
            const startTime = Date.now();
            await this.client.get('/api/health');
            const endTime = Date.now();
            return {
                isHealthy: true,
                latency: endTime - startTime,
                timestamp: endTime
            };
        } catch (error) {
            return {
                isHealthy: false,
                error: error instanceof Error ? error : new Error(String(error)),
                latency: 0,
                timestamp: Date.now() // Use Date.now() instead of new Date()
            };
        }
    }

    public async isAvailable(): Promise<boolean> {
        try {
            await this.client.get('/api/health');
            return true;
        } catch {
            return false;
        }
    }

    public async connect(): Promise<void> {
        this.validateConfig();
        this.setState(ProviderState.Initializing);

        try {
            const available = await this.isAvailable();
            if (!available) {
                throw new ProviderError('Ollama service is not available', this.id);
            }

            await this.refreshModels();
            this.setState(ProviderState.Active);
        } catch (error) {
            this.setError(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        this.setState(ProviderState.Deactivating);
        this.modelDetails.clear();
        this.setState(ProviderState.Inactive);
    }

    private async refreshModels(): Promise<void> {
        try {
            const response = await this.client.get('/api/tags');
            const models = response.data.models || [];
            
            this.modelDetails.clear();
            for (const model of models) {
                this.modelDetails.set(model.name, model);
            }
        } catch (error) {
            const errorString = error instanceof Error ? error.message : String(error);
            throw new ProviderError(
                'Failed to fetch models',
                this.id,
                errorString
            );
        }
    }

    public async getAvailableModels(): Promise<LLMModelInfo[]> {
        await this.refreshModels();
        return Array.from(this.modelDetails.entries()).map(([id, info]) => 
            this.convertModelInfo(id, info)
        );
    }

    public async getModelInfo(modelId: string): Promise<LLMModelInfo> {
        const info = this.modelDetails.get(modelId);
        if (!info) {
            throw new ModelError('Model not found', this.id, modelId);
        }
        return this.convertModelInfo(modelId, info);
    }

    public async getCapabilities(): Promise<ProviderCapabilities> {
        return {
            maxContextLength: 4096, // Add the required maxContextLength property
            supportsChatCompletion: true,
            supportsStreaming: true,
            supportsSystemPrompts: true
        };
    }

    public async generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse> {
        try {
            const ollamaOptions = options as OllamaRequestOptions;
            const request: OllamaGenerateRequest = {
                model,
                prompt,
                ...(systemPrompt && { system: systemPrompt }),
                ...(options && {
                    options: {
                        ...(options.temperature !== undefined && { temperature: options.temperature }),
                        ...(options.maxTokens !== undefined && { num_predict: options.maxTokens }),
                        ...(ollamaOptions?.topK !== undefined && { top_k: ollamaOptions.topK }),
                        ...(ollamaOptions?.presenceBonus !== undefined && { presence_penalty: ollamaOptions.presenceBonus }),
                        ...(ollamaOptions?.frequencyBonus !== undefined && { frequency_penalty: ollamaOptions.frequencyBonus }),
                        ...(ollamaOptions?.stopSequences !== undefined && { stop: ollamaOptions.stopSequences })
                    }
                })
            };

            const response = await this.client.post('/api/generate', request);
            
            // Create complete LLMResponse with all required fields
            const result: LLMResponse = {
                id: `ollama-${Date.now()}`, // Add required fields
                requestId: crypto.randomUUID?.() || `req-${Date.now()}`,
                model: model,
                prompt: prompt,
                timestamp: Date.now(),
                content: response.data.response,
                usage: {
                    promptTokens: response.data.prompt_eval_count || 0,
                    completionTokens: response.data.eval_count || 0,
                    totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
                }
            };

            return result;
        } catch (error) {
            throw new RequestError(
                'Generation failed',
                this.id,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    public async generateChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions
    ): Promise<LLMResponse> {
        const prompt = this.formatChatMessages(messages);
        return this.generateCompletion(model, prompt, undefined, options);
    }

    public async streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void> {
        try {
            const ollamaOptions = options as OllamaRequestOptions;
            const request: OllamaGenerateRequest = {
                model,
                prompt,
                ...(systemPrompt && { system: systemPrompt }),
                ...(options && {
                    options: {
                        ...(options.temperature !== undefined && { temperature: options.temperature }),
                        ...(options.maxTokens !== undefined && { num_predict: options.maxTokens }),
                        ...(ollamaOptions?.topK !== undefined && { top_k: ollamaOptions.topK }),
                        ...(ollamaOptions?.presenceBonus !== undefined && { presence_penalty: ollamaOptions.presenceBonus }),
                        ...(ollamaOptions?.frequencyBonus !== undefined && { frequency_penalty: ollamaOptions.frequencyBonus }),
                        ...(ollamaOptions?.stopSequences !== undefined && { stop: ollamaOptions.stopSequences })
                    }
                })
            };

            const response = await this.client.post('/api/generate', request, {
                responseType: 'stream'
            });

            for await (const chunk of response.data) {
                const data = JSON.parse(chunk.toString());
                if (callback) {
                    // Convert to standard LLMStreamEvent with required done property
                    callback({
                        content: data.response,
                        done: !!data.done // Ensure we provide the required 'done' property
                    });
                }
            }
        } catch (error) {
            throw new RequestError(
                'Streaming failed',
                this.id,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    public async streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void> {
        const prompt = this.formatChatMessages(messages);
        await this.streamCompletion(model, prompt, undefined, options, callback);
    }

    private convertModelInfo(modelId: string, info: OllamaModelInfo): LLMModelInfo {
        return {
            id: modelId,
            name: info.name,
            provider: this.id,
            maxContextLength: 4096, // Add required maxContextLength
            parameters: {
                format: info.details.format,
                family: info.details.family,
                size: this.parseParameterSize(info.details.parameter_size)
            },
            features: info.details.capabilities || [],
            metadata: {
                quantization: info.details.quantization_level,
                license: info.license
            }
        };
    }

    private parseParameterSize(size?: string): number | undefined {
        if (!size) return undefined;
        const match = size.match(/(\d+)([BM])/);
        if (!match) return undefined;
        const [, num, unit] = match;
        if (!num) return undefined;
        return unit === 'B' ? parseInt(num, 10) : parseInt(num, 10) / 1000;
    }

    private formatChatMessages(messages: LLMMessage[]): string {
        return messages.map(msg => 
            `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}`
        ).join('\n');
    }
}