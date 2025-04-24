import axios, { AxiosInstance } from 'axios';
import { BaseLLMProvider } from './BaseLLMProvider';
import {
    LLMModelInfo,
    LLMMessage,
    LLMRequestOptions,
    LLMResponse,
    LLMStreamEvent,
    ProviderCapabilities,
    ProviderConfig,
    ProviderState,
    HealthCheckResult
} from '../types';
import { ModelError, ProviderError, RequestError } from '../errors';

interface OllamaModelInfo {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
}

interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    system?: string;
    template?: string;
    context?: number[];
    options?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
        repeat_penalty?: number;
        seed?: number;
        stop?: string[];
        num_predict?: number;
    };
    stream?: boolean;
}

export class OllamaProvider extends BaseLLMProvider {
    private client: AxiosInstance;
    private modelDetails = new Map<string, OllamaModelInfo>();

    constructor(config: ProviderConfig) {
        super('ollama', 'Ollama', config);
        this.client = axios.create({
            baseURL: config.apiEndpoint,
            timeout: config.connection?.timeout || 30000
        });
    }

    protected async performHealthCheck(): Promise<HealthCheckResult> {
        const start = Date.now();
        try {
            await this.client.get('/api/tags');
            return {
                isHealthy: true,
                latency: Date.now() - start,
                timestamp: Date.now()
            };
        } catch (error) {
            return {
                isHealthy: false,
                latency: Date.now() - start,
                timestamp: Date.now(),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    public async isAvailable(): Promise<boolean> {
        try {
            const result = await this.healthCheck();
            return result.isHealthy;
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

            // Load initial model list
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
            throw new ProviderError(
                'Failed to fetch models',
                this.id,
                error instanceof Error ? error : undefined
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

    private convertModelInfo(modelId: string, info: OllamaModelInfo): LLMModelInfo {
        return {
            id: modelId,
            name: info.name,
            provider: this.id,
            contextLength: 4096, // Default, could be specified in model details
            parameters: {
                format: info.details.format,
                family: info.details.family,
                size: this.parseParameterSize(info.details.parameter_size)
            },
            version: info.digest
        };
    }

    private parseParameterSize(size?: string): number | undefined {
        if (!size) {return undefined;}
        const match = size.match(/(\d+)([BM])/);
        if (!match) {return undefined;}
        
        const [, num, unit] = match;
        const base = parseInt(num, 10);
        return unit === 'B' ? base * 1e9 : base * 1e6;
    }

    public async getCapabilities(): Promise<ProviderCapabilities> {
        return {
            supportsStreaming: true,
            supportsCancellation: false,
            supportsModelSwitch: true,
            maxContextLength: 4096,
            supportedModels: Array.from(this.modelDetails.keys()),
            supportedFeatures: ['chat', 'completion']
        };
    }

    public async generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse> {
        try {
            const request: OllamaGenerateRequest = {
                model,
                prompt,
                system: systemPrompt,
                options: {
                    temperature: options?.temperature,
                    num_predict: options?.maxTokens,
                    stop: options?.stop
                }
            };

            const response = await this.client.post('/api/generate', request);
            return {
                content: response.data.response,
                usage: {
                    promptTokens: response.data.prompt_eval_count,
                    completionTokens: response.data.eval_count,
                    totalTokens: response.data.prompt_eval_count + response.data.eval_count
                }
            };
        } catch (error) {
            throw new RequestError(
                'Generation failed',
                this.id,
                'completion',
                error?.response?.status,
                error instanceof Error ? error : undefined
            );
        }
    }

    public async generateChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions
    ): Promise<LLMResponse> {
        // Format messages into a prompt
        const formattedPrompt = messages.map(msg => 
            `${msg.role}: ${msg.content}`
        ).join('\n');

        // Extract system message if present
        const systemMessage = messages.find(msg => msg.role === 'system');

        return this.generateCompletion(
            model,
            formattedPrompt,
            systemMessage?.content,
            options
        );
    }

    public async streamCompletion(
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
                options: {
                    temperature: options?.temperature,
                    num_predict: options?.maxTokens,
                    stop: options?.stop
                },
                stream: true
            };

            const response = await this.client.post('/api/generate', request, {
                responseType: 'stream'
            });

            for await (const chunk of response.data) {
                const data = JSON.parse(chunk.toString());
                if (callback) {
                    callback({
                        content: data.response,
                        isComplete: data.done
                    });
                }
            }
        } catch (error) {
            throw new RequestError(
                'Stream generation failed',
                this.id,
                'stream',
                error?.response?.status,
                error instanceof Error ? error : undefined
            );
        }
    }

    public async streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void> {
        const formattedPrompt = messages.map(msg => 
            `${msg.role}: ${msg.content}`
        ).join('\n');

        const systemMessage = messages.find(msg => msg.role === 'system');

        return this.streamCompletion(
            model,
            formattedPrompt,
            systemMessage?.content,
            options,
            callback
        );
    }
}