"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
/**
 * Implementation of the LLMProvider interface for Ollama
 */
class OllamaProvider {
    constructor(baseUrl = config_1.Config.ollamaApiUrl) {
        this.name = 'Ollama';
        this.baseUrl = baseUrl;
    }
    /**
     * Check if Ollama is available
     */
    async isAvailable() {
        try {
            await axios_1.default.get(`${this.baseUrl}/tags`);
            return true;
        }
        catch (error) {
            console.error('Ollama not available:', error);
            return false;
        }
    }
    /**
     * Get available models from Ollama
     */
    async getAvailableModels() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/tags`);
            if (response.data && response.data.models) {
                return response.data.models.map((model) => model.name);
            }
            return [];
        }
        catch (error) {
            console.error('Failed to get Ollama models:', error);
            return [];
        }
    }
    /**
     * Generate text completion using Ollama
     */
    async generateCompletion(model, prompt, systemPrompt, options) {
        const request = {
            model,
            prompt,
            system: systemPrompt,
            stream: false,
            options: {
                temperature: options?.temperature,
                num_predict: options?.maxTokens
            }
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/generate`, request);
            const ollamaResponse = response.data;
            return {
                content: ollamaResponse.response,
                usage: {
                    promptTokens: ollamaResponse.prompt_eval_duration ? Math.round(ollamaResponse.prompt_eval_duration) : undefined,
                    completionTokens: ollamaResponse.eval_count,
                    totalTokens: ollamaResponse.total_duration ? Math.round(ollamaResponse.total_duration) : undefined
                }
            };
        }
        catch (error) {
            console.error('Ollama completion error:', error);
            throw new Error(`Failed to generate completion: ${error}`);
        }
    }
    /**
     * Generate chat completion using Ollama
     */
    async generateChatCompletion(model, messages, options) {
        // Convert messages to Ollama format
        const ollamaMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        const request = {
            model,
            messages: ollamaMessages,
            stream: false,
            options: {
                temperature: options?.temperature,
                num_predict: options?.maxTokens
            }
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat`, request);
            const ollamaResponse = response.data;
            return {
                content: ollamaResponse.message?.content || ollamaResponse.response,
                usage: {
                    totalTokens: ollamaResponse.total_duration ? Math.round(ollamaResponse.total_duration) : undefined
                }
            };
        }
        catch (error) {
            console.error('Ollama chat completion error:', error);
            throw new Error(`Failed to generate chat completion: ${error}`);
        }
    }
    /**
     * Stream a text completion from Ollama
     */
    async streamCompletion(model, prompt, systemPrompt, options, callback) {
        const request = {
            model,
            prompt,
            system: systemPrompt,
            stream: true,
            options: {
                temperature: options?.temperature,
                num_predict: options?.maxTokens
            }
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/generate`, request, {
                responseType: 'stream'
            });
            const stream = response.data;
            let buffer = '';
            stream.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                buffer += chunkStr;
                // Process complete JSON objects
                let boundary = 0;
                while (boundary !== -1) {
                    boundary = buffer.indexOf('\n', boundary);
                    if (boundary !== -1) {
                        const jsonStr = buffer.substring(0, boundary).trim();
                        buffer = buffer.substring(boundary + 1);
                        boundary = 0;
                        if (jsonStr) {
                            try {
                                const data = JSON.parse(jsonStr);
                                if (callback) {
                                    callback({
                                        content: data.response,
                                        done: data.done
                                    });
                                }
                            }
                            catch (e) {
                                console.error('Failed to parse JSON:', e);
                            }
                        }
                    }
                }
            });
            return new Promise((resolve, reject) => {
                stream.on('end', () => resolve());
                stream.on('error', (err) => reject(err));
            });
        }
        catch (error) {
            console.error('Ollama stream completion error:', error);
            throw new Error(`Failed to stream completion: ${error}`);
        }
    }
    /**
     * Stream a chat completion from Ollama
     */
    async streamChatCompletion(model, messages, options, callback) {
        // Convert messages to Ollama format
        const ollamaMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        const request = {
            model,
            messages: ollamaMessages,
            stream: true,
            options: {
                temperature: options?.temperature,
                num_predict: options?.maxTokens
            }
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat`, request, {
                responseType: 'stream'
            });
            const stream = response.data;
            let buffer = '';
            stream.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                buffer += chunkStr;
                // Process complete JSON objects
                let boundary = 0;
                while (boundary !== -1) {
                    boundary = buffer.indexOf('\n', boundary);
                    if (boundary !== -1) {
                        const jsonStr = buffer.substring(0, boundary).trim();
                        buffer = buffer.substring(boundary + 1);
                        boundary = 0;
                        if (jsonStr) {
                            try {
                                const data = JSON.parse(jsonStr);
                                if (callback) {
                                    callback({
                                        content: data.message?.content || data.response,
                                        done: data.done
                                    });
                                }
                            }
                            catch (e) {
                                console.error('Failed to parse JSON:', e);
                            }
                        }
                    }
                }
            });
            return new Promise((resolve, reject) => {
                stream.on('end', () => resolve());
                stream.on('error', (err) => reject(err));
            });
        }
        catch (error) {
            console.error('Ollama stream chat completion error:', error);
            throw new Error(`Failed to stream chat completion: ${error}`);
        }
    }
}
exports.OllamaProvider = OllamaProvider;
//# sourceMappingURL=ollama-provider.js.map