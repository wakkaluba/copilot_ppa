const { EventEmitter } = require('events');
const {
    LLMProviderStatus
} = require('../../../src/llm/llm-provider');

/**
 * Mock implementation of the LLMProvider interface for testing
 */
class MockLLMProvider extends EventEmitter {
    constructor() {
        super();
        this.id = 'mock-provider';
        this.name = 'Mock Provider';
        this._status = 'inactive';
        this._connected = false;
        this._mockResponses = new Map();
        this._mockStreamingResponses = new Map();
        this._offlineMode = false;
        this._cachedResponses = new Map();
        this._models = new Map();

        // Add a default model
        this._models.set('mock-model', {
            id: 'mock-model',
            name: 'Mock Model',
            provider: 'mock-provider',
            parameters: 7,
            contextLength: 4096,
            supportedFeatures: ['text-generation', 'embeddings'],
        });
    }

    getCapabilities() {
        return {
            supportsStreaming: true,
            supportsChatCompletions: true,
            supportsTextCompletions: true,
            supportsEmbeddings: true,
            maxContextLength: 4096
        };
    }

    async isAvailable() {
        return this._status !== 'error';
    }

    getStatus() {
        return this._status;
    }

    async connect() {
        this._connected = true;
        this._status = 'active';
        this.emit('statusChanged', 'active');
    }

    async disconnect() {
        this._connected = false;
        this._status = 'inactive';
        this.emit('statusChanged', 'inactive');
    }

    isConnected() {
        return this._connected;
    }

    async completePrompt(request) {
        if (!this._connected && !this._offlineMode) {
            throw new Error('Provider not connected');
        }

        if (this._offlineMode) {
            const cached = this._cachedResponses.get(request.prompt);
            if (cached) {
                return cached;
            }
            throw new Error('No cached response available in offline mode');
        }

        const response = this._mockResponses.get(request.prompt) || {
            content: `Mock response for: ${request.prompt}`,
            usage: {
                promptTokens: request.prompt.split(' ').length,
                completionTokens: 10,
                totalTokens: request.prompt.split(' ').length + 10
            },
            model: 'mock-model',
            finishReason: 'stop'
        };

        return response;
    }

    async *streamPrompt(request) {
        if (!this._connected && !this._offlineMode) {
            throw new Error('Provider not connected');
        }

        const streamingResponses = this._mockStreamingResponses.get(request.prompt) || [
            'Mock', ' streaming', ' response', ' for:', ` ${request.prompt}`
        ];

        for (const chunk of streamingResponses) {
            yield {
                content: chunk,
                model: 'mock-model'
            };
            // Add a small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    async cancelRequest(requestId) {
        return true;
    }

    async generateCompletion(model, prompt, systemPrompt, options) {
        return this.completePrompt({
            prompt: systemPrompt ? `${systemPrompt}\n${prompt}` : prompt,
            options
        });
    }

    async streamCompletion(model, prompt, systemPrompt, options, callback) {
        if (!callback) return;

        const streamingResponses = this._mockStreamingResponses.get(prompt) || [
            'Mock', ' streaming', ' response', ' for:', ` ${prompt}`
        ];

        for (let i = 0; i < streamingResponses.length; i++) {
            const isLast = i === streamingResponses.length - 1;
            callback({
                content: streamingResponses[i],
                done: isLast
            });
            // Add a small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    async generateChatCompletion(model, messages, options) {
        // Convert messages to a prompt string
        const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        return this.completePrompt({ prompt, options });
    }

    async streamChatCompletion(model, messages, options, callback) {
        if (!callback) return;

        // Convert messages to a prompt string
        const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        const streamingResponses = this._mockStreamingResponses.get(prompt) || [
            'Mock', ' streaming', ' response', ' for', ' chat'
        ];

        for (let i = 0; i < streamingResponses.length; i++) {
            const isLast = i === streamingResponses.length - 1;
            callback({
                content: streamingResponses[i],
                done: isLast
            });
            // Add a small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    async getModelInfo(modelId) {
        const model = this._models.get(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        return {
            ...model,
            quantization: null,
            fileSize: 0
        };
    }

    async getAvailableModels() {
        return Array.from(this._models.values()).map(model => ({
            ...model,
            quantization: null,
            fileSize: 0
        }));
    }

    setOfflineMode(enabled) {
        this._offlineMode = enabled;
    }

    async cacheResponse(prompt, response) {
        this._cachedResponses.set(prompt, response);
    }

    async useCachedResponse(prompt) {
        return this._cachedResponses.get(prompt) || null;
    }

    // Mock helper methods for testing
    setMockResponse(prompt, response) {
        this._mockResponses.set(prompt, {
            content: response,
            usage: {
                promptTokens: prompt.split(' ').length,
                completionTokens: response.split(' ').length,
                totalTokens: prompt.split(' ').length + response.split(' ').length
            },
            model: 'mock-model',
            finishReason: 'stop'
        });
    }

    setMockStreamingResponse(prompt, chunks) {
        this._mockStreamingResponses.set(prompt, chunks);
    }

    addModel(modelId, modelInfo) {
        this._models.set(modelId, {
            id: modelId,
            name: modelInfo.name || modelId,
            provider: this.id,
            parameters: modelInfo.parameters || 7,
            contextLength: modelInfo.contextLength || 4096,
            supportedFeatures: modelInfo.supportedFeatures || ['text-generation'],
        });
    }

    setStatus(status) {
        this._status = status;
        this.emit('statusChanged', status);
    }
}

describe('LLMProvider Interface', () => {
    let provider;

    beforeEach(() => {
        provider = new MockLLMProvider();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Properties', () => {
        test('should have an id property', () => {
            expect(provider.id).toBe('mock-provider');
        });

        test('should have a name property', () => {
            expect(provider.name).toBe('Mock Provider');
        });
    });

    describe('Connection Management', () => {
        test('should initialize as disconnected', () => {
            expect(provider.isConnected()).toBe(false);
            expect(provider.getStatus()).toBe('inactive');
        });

        test('should connect successfully', async () => {
            await provider.connect();
            expect(provider.isConnected()).toBe(true);
            expect(provider.getStatus()).toBe('active');
        });

        test('should disconnect successfully', async () => {
            await provider.connect();
            await provider.disconnect();
            expect(provider.isConnected()).toBe(false);
            expect(provider.getStatus()).toBe('inactive');
        });

        test('should emit status change events', async () => {
            const statusChangeSpy = jest.fn();
            provider.on('statusChanged', statusChangeSpy);

            await provider.connect();
            expect(statusChangeSpy).toHaveBeenCalledWith('active');

            await provider.disconnect();
            expect(statusChangeSpy).toHaveBeenCalledWith('inactive');
        });
    });

    describe('Text Completion', () => {
        test('should generate text completions when connected', async () => {
            await provider.connect();
            const response = await provider.generateCompletion('mock-model', 'Hello, world!');

            expect(response.content).toContain('Mock response for: Hello, world!');
            expect(response.model).toBe('mock-model');
            expect(response.usage).toBeDefined();
        });

        test('should throw error when not connected', async () => {
            await expect(provider.generateCompletion('mock-model', 'Hello, world!'))
                .rejects.toThrow('Provider not connected');
        });

        test('should use custom mock responses when set', async () => {
            await provider.connect();
            provider.setMockResponse('Custom prompt', 'Custom response');

            const response = await provider.completePrompt({ prompt: 'Custom prompt' });
            expect(response.content).toBe('Custom response');
        });

        test('should include system prompt when provided', async () => {
            await provider.connect();
            const systemPrompt = 'You are a helpful assistant.';
            const userPrompt = 'Tell me about JavaScript';

            const spy = jest.spyOn(provider, 'completePrompt');
            await provider.generateCompletion('mock-model', userPrompt, systemPrompt);

            expect(spy).toHaveBeenCalledWith({
                prompt: expect.stringContaining(systemPrompt),
                options: undefined
            });
            expect(spy).toHaveBeenCalledWith({
                prompt: expect.stringContaining(userPrompt),
                options: undefined
            });
        });
    });

    describe('Streaming', () => {
        test('should stream completions', async () => {
            await provider.connect();
            const callbackSpy = jest.fn();

            await provider.streamCompletion('mock-model', 'Hello, streaming!', undefined, undefined, callbackSpy);

            expect(callbackSpy).toHaveBeenCalledTimes(5); // Default has 5 chunks
            expect(callbackSpy).toHaveBeenLastCalledWith({
                content: expect.any(String),
                done: true
            });
        });

        test('should stream custom responses', async () => {
            await provider.connect();
            const customChunks = ['First', ' chunk', ' last chunk'];
            provider.setMockStreamingResponse('Custom streaming', customChunks);

            const callbackSpy = jest.fn();
            await provider.streamCompletion('mock-model', 'Custom streaming', undefined, undefined, callbackSpy);

            expect(callbackSpy).toHaveBeenCalledTimes(3);
            expect(callbackSpy).toHaveBeenNthCalledWith(1, {
                content: 'First',
                done: false
            });
            expect(callbackSpy).toHaveBeenLastCalledWith({
                content: ' last chunk',
                done: true
            });
        });

        test('should implement AsyncIterable for streaming', async () => {
            await provider.connect();
            const chunks = [];

            for await (const chunk of provider.streamPrompt({ prompt: 'Testing AsyncIterable' })) {
                chunks.push(chunk.content);
            }

            expect(chunks.length).toBeGreaterThan(0);
            expect(chunks.join('')).toContain('Testing AsyncIterable');
        });
    });

    describe('Chat Completions', () => {
        test('should generate chat completions', async () => {
            await provider.connect();
            const messages = [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello, who are you?' }
            ];

            const response = await provider.generateChatCompletion('mock-model', messages);

            expect(response.content).toBeDefined();
            expect(response.model).toBe('mock-model');
        });

        test('should stream chat completions', async () => {
            await provider.connect();
            const messages = [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello, who are you?' }
            ];

            const callbackSpy = jest.fn();
            await provider.streamChatCompletion('mock-model', messages, undefined, callbackSpy);

            expect(callbackSpy).toHaveBeenCalled();
            expect(callbackSpy).toHaveBeenLastCalledWith({
                content: expect.any(String),
                done: true
            });
        });
    });

    describe('Model Information', () => {
        test('should return model information', async () => {
            const modelInfo = await provider.getModelInfo('mock-model');

            expect(modelInfo.id).toBe('mock-model');
            expect(modelInfo.name).toBe('Mock Model');
            expect(modelInfo.parameters).toBe(7);
            expect(modelInfo.contextLength).toBe(4096);
            expect(modelInfo.supportedFeatures).toContain('text-generation');
        });

        test('should throw error for invalid model', async () => {
            await expect(provider.getModelInfo('non-existent-model'))
                .rejects.toThrow('Model non-existent-model not found');
        });

        test('should list available models', async () => {
            const models = await provider.getAvailableModels();

            expect(models.length).toBeGreaterThan(0);
            expect(models[0].id).toBe('mock-model');
        });

        test('should add new models', async () => {
            provider.addModel('gpt-4', {
                name: 'GPT-4',
                parameters: 175e9,
                contextLength: 8192,
                supportedFeatures: ['text-generation', 'embeddings', 'function-calling']
            });

            const modelInfo = await provider.getModelInfo('gpt-4');
            expect(modelInfo.name).toBe('GPT-4');
            expect(modelInfo.parameters).toBe(175e9);

            const models = await provider.getAvailableModels();
            expect(models.length).toBe(2);
        });
    });

    describe('Offline Mode and Caching', () => {
        test('should use cached responses in offline mode', async () => {
            await provider.connect();
            const prompt = 'Cache me';
            const response = {
                content: 'Cached response',
                model: 'mock-model'
            };

            await provider.cacheResponse(prompt, response);
            provider.setOfflineMode(true);

            const result = await provider.completePrompt({ prompt });
            expect(result.content).toBe('Cached response');
        });

        test('should throw error in offline mode when no cached response exists', async () => {
            provider.setOfflineMode(true);

            await expect(provider.completePrompt({ prompt: 'Not cached' }))
                .rejects.toThrow('No cached response available in offline mode');
        });

        test('should retrieve cached responses', async () => {
            const prompt = 'Test caching';
            const response = {
                content: 'Cached response for testing',
                model: 'mock-model'
            };

            await provider.cacheResponse(prompt, response);
            const cached = await provider.useCachedResponse(prompt);

            expect(cached).toBeDefined();
            expect(cached.content).toBe('Cached response for testing');
        });

        test('should return null for non-existent cached responses', async () => {
            const cached = await provider.useCachedResponse('Not in cache');
            expect(cached).toBeNull();
        });
    });

    describe('Error Handling', () => {
        test('should handle connection errors', async () => {
            const errorProvider = new MockLLMProvider();
            errorProvider.setStatus('error');

            expect(errorProvider.getStatus()).toBe('error');
            expect(await errorProvider.isAvailable()).toBe(false);
        });

        test('should handle request cancellation', async () => {
            const result = await provider.cancelRequest('test-request-id');
            expect(result).toBe(true);
        });
    });

    describe('Capabilities', () => {
        test('should return provider capabilities', () => {
            const capabilities = provider.getCapabilities();

            expect(capabilities.supportsStreaming).toBe(true);
            expect(capabilities.supportsChatCompletions).toBe(true);
            expect(capabilities.supportsTextCompletions).toBe(true);
            expect(capabilities.supportsEmbeddings).toBe(true);
            expect(capabilities.maxContextLength).toBe(4096);
        });
    });
});
