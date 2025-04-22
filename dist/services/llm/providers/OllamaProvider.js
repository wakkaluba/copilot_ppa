"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseLLMProvider_1 = require("./BaseLLMProvider");
const types_1 = require("../types");
const errors_1 = require("../errors");
class OllamaProvider extends BaseLLMProvider_1.BaseLLMProvider {
    client;
    modelDetails = new Map();
    constructor(config) {
        super('ollama', 'Ollama', config);
        this.client = axios_1.default.create({
            baseURL: config.apiEndpoint,
            timeout: config.connection?.timeout || 30000
        });
    }
    async performHealthCheck() {
        const start = Date.now();
        try {
            await this.client.get('/api/tags');
            return {
                isHealthy: true,
                latency: Date.now() - start,
                timestamp: Date.now()
            };
        }
        catch (error) {
            return {
                isHealthy: false,
                latency: Date.now() - start,
                timestamp: Date.now(),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
    async isAvailable() {
        try {
            const result = await this.healthCheck();
            return result.isHealthy;
        }
        catch {
            return false;
        }
    }
    async connect() {
        this.validateConfig();
        this.setState(types_1.ProviderState.Initializing);
        try {
            const available = await this.isAvailable();
            if (!available) {
                throw new errors_1.ProviderError('Ollama service is not available', this.id);
            }
            // Load initial model list
            await this.refreshModels();
            this.setState(types_1.ProviderState.Active);
        }
        catch (error) {
            this.setError(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    async disconnect() {
        this.setState(types_1.ProviderState.Deactivating);
        this.modelDetails.clear();
        this.setState(types_1.ProviderState.Inactive);
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
            throw new errors_1.ProviderError('Failed to fetch models', this.id, error instanceof Error ? error : undefined);
        }
    }
    async getAvailableModels() {
        await this.refreshModels();
        return Array.from(this.modelDetails.entries()).map(([id, info]) => this.convertModelInfo(id, info));
    }
    async getModelInfo(modelId) {
        const info = this.modelDetails.get(modelId);
        if (!info) {
            throw new errors_1.ModelError('Model not found', this.id, modelId);
        }
        return this.convertModelInfo(modelId, info);
    }
    convertModelInfo(modelId, info) {
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
    parseParameterSize(size) {
        if (!size)
            return undefined;
        const match = size.match(/(\d+)([BM])/);
        if (!match)
            return undefined;
        const [, num, unit] = match;
        const base = parseInt(num, 10);
        return unit === 'B' ? base * 1e9 : base * 1e6;
    }
    async getCapabilities() {
        return {
            supportsStreaming: true,
            supportsCancellation: false,
            supportsModelSwitch: true,
            maxContextLength: 4096,
            supportedModels: Array.from(this.modelDetails.keys()),
            supportedFeatures: ['chat', 'completion']
        };
    }
    async generateCompletion(model, prompt, systemPrompt, options) {
        try {
            const request = {
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
        }
        catch (error) {
            throw new errors_1.RequestError('Generation failed', this.id, 'completion', error?.response?.status, error instanceof Error ? error : undefined);
        }
    }
    async generateChatCompletion(model, messages, options) {
        // Format messages into a prompt
        const formattedPrompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        // Extract system message if present
        const systemMessage = messages.find(msg => msg.role === 'system');
        return this.generateCompletion(model, formattedPrompt, systemMessage?.content, options);
    }
    async streamCompletion(model, prompt, systemPrompt, options, callback) {
        try {
            const request = {
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
        }
        catch (error) {
            throw new errors_1.RequestError('Stream generation failed', this.id, 'stream', error?.response?.status, error instanceof Error ? error : undefined);
        }
    }
    async streamChatCompletion(model, messages, options, callback) {
        const formattedPrompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        const systemMessage = messages.find(msg => msg.role === 'system');
        return this.streamCompletion(model, formattedPrompt, systemMessage?.content, options, callback);
    }
}
exports.OllamaProvider = OllamaProvider;
//# sourceMappingURL=OllamaProvider.js.map