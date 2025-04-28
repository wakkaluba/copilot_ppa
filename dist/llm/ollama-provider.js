"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const llm_provider_1 = require("./llm-provider");
/**
 * Implementation of the LLMProvider interface for Ollama
 */
class OllamaProvider extends llm_provider_1.BaseLLMProvider {
    constructor(baseUrl = config_1.Config.ollamaApiUrl) {
        super();
        this.name = 'Ollama';
        this.modelDetails = new Map();
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            timeout: 30000
        });
    }
    async isAvailable() {
        try {
            await this.client.get('/api/tags');
            this.updateStatus({ isAvailable: true });
            return true;
        }
        catch (error) {
            this.updateStatus({
                isAvailable: false,
                error: 'Failed to connect to Ollama service'
            });
            return false;
        }
    }
    async connect() {
        const available = await this.isAvailable();
        if (!available) {
            throw new llm_provider_1.LLMProviderError('CONNECTION_FAILED', 'Failed to connect to Ollama service');
        }
        this.updateStatus({ isConnected: true });
    }
    async disconnect() {
        this.updateStatus({ isConnected: false });
    }
    async getAvailableModels() {
        try {
            const response = await this.client.get('/api/tags');
            const models = response.data.models || [];
            return Promise.all(models.map(async (model) => {
                const info = await this.getModelInfo(model.name);
                return info;
            }));
        }
        catch (error) {
            return this.handleError(error, 'FETCH_MODELS_FAILED');
        }
    }
    async getModelInfo(modelId) {
        try {
            // Check cache first
            if (this.modelDetails.has(modelId)) {
                const cached = this.modelDetails.get(modelId);
                return this.convertModelInfo(modelId, cached);
            }
            const response = await this.client.post('/api/show', { name: modelId });
            const modelInfo = response.data;
            // Cache the response
            this.modelDetails.set(modelId, modelInfo);
            return this.convertModelInfo(modelId, modelInfo);
        }
        catch (error) {
            return this.handleError(error, 'FETCH_MODEL_INFO_FAILED');
        }
    }
    async generateCompletion(model, prompt, systemPrompt, options) {
        try {
            if (this.offlineMode) {
                const cached = await this.useCachedResponse(prompt);
                if (cached) {
                    return { content: cached };
                }
            }
            const request = {
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
            const result = {
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
        }
        catch (error) {
            return this.handleError(error, 'GENERATE_FAILED');
        }
    }
    async generateChatCompletion(model, messages, options) {
        try {
            const request = {
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
        }
        catch (error) {
            return this.handleError(error, 'CHAT_FAILED');
        }
    }
    async streamCompletion(model, prompt, systemPrompt, options, callback) {
        try {
            const request = {
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
        }
        catch (error) {
            this.handleError(error, 'STREAM_FAILED');
        }
    }
    async streamChatCompletion(model, messages, options, callback) {
        try {
            const request = {
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
        }
        catch (error) {
            this.handleError(error, 'STREAM_CHAT_FAILED');
        }
    }
    convertModelInfo(modelId, info) {
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
    parseParameterSize(size) {
        if (!size) {
            return undefined;
        }
        const match = size.match(/(\d+)([BM])/);
        if (!match) {
            return undefined;
        }
        const [, num, unit] = match;
        return unit === 'B' ? parseInt(num) : parseInt(num) / 1000;
    }
}
exports.OllamaProvider = OllamaProvider;
//# sourceMappingURL=ollama-provider.js.map