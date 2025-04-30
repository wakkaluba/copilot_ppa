"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseLLMProvider_1 = require("./BaseLLMProvider");
// Define custom error classes since they're not exported from '../errors'
class ModelError extends Error {
    providerId;
    modelId;
    constructor(message, providerId, modelId) {
        super(message);
        this.providerId = providerId;
        this.modelId = modelId;
        this.name = 'ModelError';
    }
}
class ProviderError extends Error {
    providerId;
    details;
    constructor(message, providerId, details) {
        super(message);
        this.providerId = providerId;
        this.details = details;
        this.name = 'ProviderError';
    }
}
class RequestError extends Error {
    providerId;
    originalError;
    constructor(message, providerId, originalError) {
        super(message);
        this.providerId = providerId;
        this.originalError = originalError;
        this.name = 'RequestError';
    }
}
class OllamaProvider extends BaseLLMProvider_1.BaseLLMProvider {
    client; // Use any type instead of AxiosInstance
    modelDetails = new Map();
    constructor(config) {
        super('ollama', 'Ollama', config);
        this.client = axios_1.default.create({
            baseURL: config.apiEndpoint,
            timeout: config.requestTimeout || 30000
        });
    }
    async performHealthCheck() {
        try {
            const startTime = Date.now();
            await this.client.get('/api/health');
            const endTime = Date.now();
            return {
                isHealthy: true,
                latency: endTime - startTime,
                timestamp: endTime
            };
        }
        catch (error) {
            return {
                isHealthy: false,
                error: error instanceof Error ? error : new Error(String(error)),
                latency: 0,
                timestamp: Date.now() // Use Date.now() instead of new Date()
            };
        }
    }
    async isAvailable() {
        try {
            await this.client.get('/api/health');
            return true;
        }
        catch {
            return false;
        }
    }
    async connect() {
        this.validateConfig();
        this.setState(BaseLLMProvider_1.ProviderState.Initializing);
        try {
            const available = await this.isAvailable();
            if (!available) {
                throw new ProviderError('Ollama service is not available', this.id);
            }
            await this.refreshModels();
            this.setState(BaseLLMProvider_1.ProviderState.Active);
        }
        catch (error) {
            this.setError(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    async disconnect() {
        this.setState(BaseLLMProvider_1.ProviderState.Deactivating);
        this.modelDetails.clear();
        this.setState(BaseLLMProvider_1.ProviderState.Inactive);
    }
    async refreshModels() {
        try {
            const response = await this.client.get('/api/tags');
            const models = response.data.models || [];
            this.modelDetails.clear();
            for (const model of models) {
                this.modelDetails.set(model.name, model);
            }
        }
        catch (error) {
            const errorString = error instanceof Error ? error.message : String(error);
            throw new ProviderError('Failed to fetch models', this.id, errorString);
        }
    }
    async getAvailableModels() {
        await this.refreshModels();
        return Array.from(this.modelDetails.entries()).map(([id, info]) => this.convertModelInfo(id, info));
    }
    async getModelInfo(modelId) {
        const info = this.modelDetails.get(modelId);
        if (!info) {
            throw new ModelError('Model not found', this.id, modelId);
        }
        return this.convertModelInfo(modelId, info);
    }
    async getCapabilities() {
        return {
            maxContextLength: 4096, // Add the required maxContextLength property
            supportsChatCompletion: true,
            supportsStreaming: true,
            supportsSystemPrompts: true
        };
    }
    async generateCompletion(model, prompt, systemPrompt, options) {
        try {
            const ollamaOptions = options;
            const request = {
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
            const result = {
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
        }
        catch (error) {
            throw new RequestError('Generation failed', this.id, error instanceof Error ? error : new Error(String(error)));
        }
    }
    async generateChatCompletion(model, messages, options) {
        const prompt = this.formatChatMessages(messages);
        return this.generateCompletion(model, prompt, undefined, options);
    }
    async streamCompletion(model, prompt, systemPrompt, options, callback) {
        try {
            const ollamaOptions = options;
            const request = {
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
        }
        catch (error) {
            throw new RequestError('Streaming failed', this.id, error instanceof Error ? error : new Error(String(error)));
        }
    }
    async streamChatCompletion(model, messages, options, callback) {
        const prompt = this.formatChatMessages(messages);
        await this.streamCompletion(model, prompt, undefined, options, callback);
    }
    convertModelInfo(modelId, info) {
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
    parseParameterSize(size) {
        if (!size)
            return undefined;
        const match = size.match(/(\d+)([BM])/);
        if (!match)
            return undefined;
        const [, num, unit] = match;
        if (!num)
            return undefined;
        return unit === 'B' ? parseInt(num, 10) : parseInt(num, 10) / 1000;
    }
    formatChatMessages(messages) {
        return messages.map(msg => `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}`).join('\n');
    }
}
exports.OllamaProvider = OllamaProvider;
//# sourceMappingURL=OllamaProvider.js.map