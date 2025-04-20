"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LMStudioProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
/**
 * Implementation of LLMProvider for LM Studio's OpenAI-compatible API
 */
class LMStudioProvider {
    name = 'LM Studio';
    baseUrl;
    constructor(baseUrl = config_1.Config.lmStudioApiUrl) {
        this.baseUrl = baseUrl;
    }
    /**
     * Check if LM Studio is available
     */
    async isAvailable() {
        try {
            await axios_1.default.get(`${this.baseUrl}/models`);
            return true;
        }
        catch (error) {
            console.error('LM Studio not available:', error);
            return false;
        }
    }
    /**
     * Get available models from LM Studio
     */
    async getAvailableModels() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/models`);
            if (response.data && response.data.data) {
                return response.data.data.map((model) => model.id);
            }
            return ['local-model']; // Default fallback if no models reported
        }
        catch (error) {
            console.error('Failed to get LM Studio models:', error);
            return ['local-model']; // Default fallback on error
        }
    }
    /**
     * Generate text completion using LM Studio
     */
    async generateCompletion(model, prompt, systemPrompt, options) {
        // For LM Studio, we'll use chat completions API with system+user messages
        // as it provides better control than the plain completions API
        if (systemPrompt) {
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ];
            return this.generateChatCompletion(model, messages.map(m => ({
                role: m.role,
                content: m.content
            })), options);
        }
        // If no system prompt is provided, use completions API
        const request = {
            model,
            prompt,
            temperature: options?.temperature,
            max_tokens: options?.maxTokens,
            stream: false
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/completions`, request, { headers: { 'Content-Type': 'application/json' } });
            const openAIResponse = response.data;
            return {
                content: openAIResponse.choices[0].text,
                usage: {
                    promptTokens: openAIResponse.usage?.prompt_tokens,
                    completionTokens: openAIResponse.usage?.completion_tokens,
                    totalTokens: openAIResponse.usage?.total_tokens
                }
            };
        }
        catch (error) {
            console.error('LM Studio completion error:', error);
            throw new Error(`Failed to generate completion: ${error}`);
        }
    }
    /**
     * Generate chat completion using LM Studio
     */
    async generateChatCompletion(model, messages, options) {
        const openAIMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        const request = {
            model,
            messages: openAIMessages,
            temperature: options?.temperature,
            max_tokens: options?.maxTokens,
            stream: false
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, request, { headers: { 'Content-Type': 'application/json' } });
            const openAIResponse = response.data;
            return {
                content: openAIResponse.choices[0].message.content,
                usage: {
                    promptTokens: openAIResponse.usage?.prompt_tokens,
                    completionTokens: openAIResponse.usage?.completion_tokens,
                    totalTokens: openAIResponse.usage?.total_tokens
                }
            };
        }
        catch (error) {
            console.error('LM Studio chat completion error:', error);
            throw new Error(`Failed to generate chat completion: ${error}`);
        }
    }
    /**
     * Stream a text completion from LM Studio
     */
    async streamCompletion(model, prompt, systemPrompt, options, callback) {
        // For system prompts, use the chat API
        if (systemPrompt) {
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ];
            return this.streamChatCompletion(model, messages, options, callback);
        }
        const request = {
            model,
            prompt,
            temperature: options?.temperature,
            max_tokens: options?.maxTokens,
            stream: true
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/completions`, request, {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'stream'
            });
            const stream = response.data;
            let buffer = '';
            let contentSoFar = '';
            stream.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                buffer += chunkStr;
                // Process complete lines from the stream
                while (true) {
                    const lineEndIndex = buffer.indexOf('\n');
                    if (lineEndIndex === -1)
                        break;
                    const line = buffer.substring(0, lineEndIndex).trim();
                    buffer = buffer.substring(lineEndIndex + 1);
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6);
                        if (data === '[DONE]') {
                            if (callback) {
                                callback({ content: contentSoFar, done: true });
                            }
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const text = parsed.choices[0]?.text || '';
                            contentSoFar += text;
                            if (callback) {
                                callback({ content: text, done: false });
                            }
                        }
                        catch (e) {
                            console.error('Failed to parse JSON:', e);
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
            console.error('LM Studio stream completion error:', error);
            throw new Error(`Failed to stream completion: ${error}`);
        }
    }
    /**
     * Stream a chat completion from LM Studio
     */
    async streamChatCompletion(model, messages, options, callback) {
        const openAIMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        const request = {
            model,
            messages: openAIMessages,
            temperature: options?.temperature,
            max_tokens: options?.maxTokens,
            stream: true
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, request, {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'stream'
            });
            const stream = response.data;
            let buffer = '';
            let contentSoFar = '';
            stream.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                buffer += chunkStr;
                // Process complete lines from the stream
                while (true) {
                    const lineEndIndex = buffer.indexOf('\n');
                    if (lineEndIndex === -1)
                        break;
                    const line = buffer.substring(0, lineEndIndex).trim();
                    buffer = buffer.substring(lineEndIndex + 1);
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6);
                        if (data === '[DONE]') {
                            if (callback) {
                                callback({ content: contentSoFar, done: true });
                            }
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content || '';
                            if (content) {
                                contentSoFar += content;
                                if (callback) {
                                    callback({ content, done: false });
                                }
                            }
                        }
                        catch (e) {
                            console.error('Failed to parse JSON:', e);
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
            console.error('LM Studio stream chat completion error:', error);
            throw new Error(`Failed to stream chat completion: ${error}`);
        }
    }
}
exports.LMStudioProvider = LMStudioProvider;
//# sourceMappingURL=lmstudio-provider.js.map