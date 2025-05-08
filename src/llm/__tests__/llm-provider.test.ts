import { EventEmitter } from 'events';
import {
    ILLMMessage,
    ILLMModelInfo,
    ILLMProvider,
    ILLMRequest,
    ILLMRequestOptions,
    ILLMResponse,
    ILLMStreamEvent
} from '../llm-provider';
import { IProviderCapabilities } from '../types';

// Mock implementation of ILLMProvider for testing
class MockLLMProvider extends EventEmitter implements ILLMProvider {
    readonly id: string = 'mock-provider';
    readonly name: string = 'Mock LLM Provider';

    private _isConnected: boolean = false;
    private _status: 'active' | 'inactive' | 'error' = 'inactive';
    private _offlineMode: boolean = false;
    private _cache: Map<string, ILLMResponse> = new Map();
    private _activeRequests: Set<string> = new Set();
    private _availableModels: ILLMModelInfo[] = [
        {
            id: 'mock-model-1',
            name: 'Mock Model 1',
            provider: 'mock',
            parameters: 7000000000,
            contextLength: 4096,
            supportedFeatures: ['completion', 'chat', 'embeddings'],
            quantization: '4bit',
            fileSize: 4000000000,
            license: 'MIT',
            supportsFinetuning: false
        },
        {
            id: 'mock-model-2',
            name: 'Mock Model 2',
            provider: 'mock',
            parameters: 13000000000,
            contextLength: 8192,
            supportedFeatures: ['completion', 'chat', 'embeddings', 'function-calling'],
            quantization: '8bit',
            fileSize: 8000000000,
            license: 'Apache-2.0',
            supportsFinetuning: true
        }
    ];

    constructor() {
        super();
    }

    getCapabilities(): IProviderCapabilities {
        return {
            supportsChat: true,
            supportsCompletion: true,
            supportsStreaming: true,
            supportsFunctionCalling: true,
            supportsEmbeddings: true
        };
    }

    async isAvailable(): Promise<boolean> {
        return this._status !== 'error';
    }

    getStatus(): 'active' | 'inactive' | 'error' {
        return this._status;
    }

    async connect(): Promise<void> {
        this._isConnected = true;
        this._status = 'active';
        this.emit('connected');
    }

    async disconnect(): Promise<void> {
        this._isConnected = false;
        this._status = 'inactive';
        this.emit('disconnected');
    }

    isConnected(): boolean {
        return this._isConnected;
    }

    async completePrompt(request: ILLMRequest): Promise<ILLMResponse> {
        if (!this._isConnected && !this._offlineMode) {
            throw new Error('Provider not connected');
        }

        const requestId = request.id || Date.now().toString();
        this._activeRequests.add(requestId);

        if (this._offlineMode) {
            const cachedResponse = await this.useCachedResponse(request.prompt);
            if (cachedResponse) {
                return cachedResponse;
            }
        }

        // Simulate a response
        const response: ILLMResponse = {
            content: `This is a mock response to: ${request.prompt}`,
            usage: {
                promptTokens: Math.floor(request.prompt.length / 4),
                completionTokens: 20,
                totalTokens: Math.floor(request.prompt.length / 4) + 20
            },
            model: request.model || 'mock-model-1',
            finishReason: 'stop'
        };

        this._activeRequests.delete(requestId);

        if (this._offlineMode) {
            await this.cacheResponse(request.prompt, response);
        }

        return response;
    }

    async streamPrompt(request: ILLMRequest): AsyncIterable<ILLMResponse> {
        if (!this._isConnected && !this._offlineMode) {
            throw new Error('Provider not connected');
        }

        const requestId = request.id || Date.now().toString();
        this._activeRequests.add(requestId);

        const response = await this.completePrompt(request);
        const chunks = response.content.split(' ');

        return {
            [Symbol.asyncIterator]: async function* () {
                for (const chunk of chunks) {
                    yield {
                        content: chunk + ' ',
                        model: response.model,
                        finishReason: undefined
                    };

                    // Simulate processing time
                    await new Promise(resolve => setTimeout(resolve, 10));
                }

                yield {
                    content: '',
                    model: response.model,
                    finishReason: 'stop',
                    usage: response.usage
                };
            }
        };
    }

    async cancelRequest(requestId: string): Promise<boolean> {
        const wasActive = this._activeRequests.has(requestId);
        this._activeRequests.delete(requestId);
        return wasActive;
    }

    async generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: ILLMRequestOptions
    ): Promise<ILLMResponse> {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

        return this.completePrompt({
            model,
            prompt: fullPrompt,
            options
        });
    }

    async streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: ILLMRequestOptions,
        callback?: (event: ILLMStreamEvent) => void
    ): Promise<void> {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

        const stream = await this.streamPrompt({
            model,
            prompt: fullPrompt,
            options: { ...options, stream: true }
        });

        for await (const chunk of stream) {
            if (callback) {
                callback({
                    content: chunk.content,
                    done: chunk.finishReason === 'stop'
                });
            }
        }
    }

    async generateChatCompletion(
        model: string,
        messages: ILLMMessage[],
        options?: ILLMRequestOptions
    ): Promise<ILLMResponse> {
        // Convert messages to a unified prompt
        const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

        return this.generateCompletion(model, prompt, undefined, options);
    }

    async streamChatCompletion(
        model: string,
        messages: ILLMMessage[],
        options?: ILLMRequestOptions,
        callback?: (event: ILLMStreamEvent) => void
    ): Promise<void> {
        // Convert messages to a unified prompt
        const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

        return this.streamCompletion(model, prompt, undefined, options, callback);
    }

    async getModelInfo(modelId: string): Promise<ILLMModelInfo> {
        const model = this._availableModels.find(m => m.id === modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        return model;
    }

    async getAvailableModels(): Promise<ILLMModelInfo[]> {
        return [...this._availableModels];
    }

    setOfflineMode(enabled: boolean): void {
        this._offlineMode = enabled;
        this.emit('offlineModeChanged', enabled);
    }

    async cacheResponse(prompt: string, response: ILLMResponse): Promise<void> {
        this._cache.set(prompt, response);
    }

    async useCachedResponse(prompt: string): Promise<ILLMResponse | null> {
        return this._cache.get(prompt) || null;
    }
}

describe('LLM Provider Interface', () => {
    let provider: ILLMProvider;

    beforeEach(() => {
        provider = new MockLLMProvider();
    });

    describe('Connection Management', () => {
        test('should initialize in disconnected state', () => {
            expect(provider.isConnected()).toBe(false);
            expect(provider.getStatus()).toBe('inactive');
        });

        test('should connect successfully', async () => {
            const connectPromise = provider.connect();

            // Test event emission
            const connectedListener = jest.fn();
            provider.on('connected', connectedListener);

            await connectPromise;

            expect(provider.isConnected()).toBe(true);
            expect(provider.getStatus()).toBe('active');
            expect(connectedListener).toHaveBeenCalled();
        });

        test('should disconnect successfully', async () => {
            await provider.connect();

            const disconnectPromise = provider.disconnect();

            // Test event emission
            const disconnectedListener = jest.fn();
            provider.on('disconnected', disconnectedListener);

            await disconnectPromise;

            expect(provider.isConnected()).toBe(false);
            expect(provider.getStatus()).toBe('inactive');
            expect(disconnectedListener).toHaveBeenCalled();
        });

        test('should report availability correctly', async () => {
            const isAvailable = await provider.isAvailable();
            expect(typeof isAvailable).toBe('boolean');
        });
    });

    describe('Capabilities and Model Information', () => {
        test('should provide capabilities', () => {
            const capabilities = provider.getCapabilities();
            expect(capabilities).toHaveProperty('supportsChat');
            expect(capabilities).toHaveProperty('supportsCompletion');
            expect(capabilities).toHaveProperty('supportsStreaming');
        });

        test('should list available models', async () => {
            const models = await provider.getAvailableModels();
            expect(Array.isArray(models)).toBe(true);
            expect(models.length).toBeGreaterThan(0);

            // Check model structure
            const model = models[0];
            expect(model).toHaveProperty('id');
            expect(model).toHaveProperty('name');
            expect(model).toHaveProperty('provider');
            expect(model).toHaveProperty('parameters');
            expect(model).toHaveProperty('contextLength');
            expect(model).toHaveProperty('supportedFeatures');
        });

        test('should get specific model info', async () => {
            // First get all models to find a valid ID
            const models = await provider.getAvailableModels();
            const modelId = models[0].id;

            // Get specific model info
            const modelInfo = await provider.getModelInfo(modelId);
            expect(modelInfo.id).toBe(modelId);
            expect(modelInfo).toHaveProperty('name');
            expect(modelInfo).toHaveProperty('provider');
        });

        test('should throw error for non-existent model', async () => {
            await expect(provider.getModelInfo('non-existent-model')).rejects.toThrow();
        });
    });

    describe('Text Completion', () => {
        beforeEach(async () => {
            await provider.connect();
        });

        test('should generate text completion', async () => {
            const response = await provider.generateCompletion(
                'mock-model-1',
                'Hello, world!'
            );

            expect(response).toHaveProperty('content');
            expect(typeof response.content).toBe('string');
            expect(response.content.length).toBeGreaterThan(0);
            expect(response).toHaveProperty('usage');
            expect(response).toHaveProperty('model');
            expect(response).toHaveProperty('finishReason');
        });

        test('should support system prompts', async () => {
            const response = await provider.generateCompletion(
                'mock-model-1',
                'Hello, world!',
                'You are a helpful assistant.'
            );

            expect(response.content).toContain('Hello, world!');
        });

        test('should handle request options', async () => {
            const options: ILLMRequestOptions = {
                temperature: 0.7,
                maxTokens: 100,
                topP: 0.9
            };

            const response = await provider.generateCompletion(
                'mock-model-1',
                'Hello, world!',
                undefined,
                options
            );

            expect(response).toHaveProperty('content');
        });

        test('should fail if not connected', async () => {
            await provider.disconnect();

            await expect(provider.generateCompletion(
                'mock-model-1',
                'Hello, world!'
            )).rejects.toThrow('Provider not connected');
        });
    });

    describe('Chat Completion', () => {
        beforeEach(async () => {
            await provider.connect();
        });

        test('should generate chat completion', async () => {
            const messages: ILLMMessage[] = [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello, how are you?' }
            ];

            const response = await provider.generateChatCompletion(
                'mock-model-1',
                messages
            );

            expect(response).toHaveProperty('content');
            expect(typeof response.content).toBe('string');
            expect(response.content.length).toBeGreaterThan(0);
        });

        test('should handle empty message array', async () => {
            const response = await provider.generateChatCompletion(
                'mock-model-1',
                []
            );

            expect(response).toHaveProperty('content');
        });
    });

    describe('Streaming', () => {
        beforeEach(async () => {
            await provider.connect();
        });

        test('should stream text completion', async () => {
            const events: ILLMStreamEvent[] = [];

            await provider.streamCompletion(
                'mock-model-1',
                'Hello, world!',
                undefined,
                undefined,
                (event) => {
                    events.push(event);
                }
            );

            expect(events.length).toBeGreaterThan(0);
            expect(events[events.length - 1].done).toBe(true);

            // Concatenate all content
            const fullContent = events.map(e => e.content).join('');
            expect(fullContent.length).toBeGreaterThan(0);
        });

        test('should stream chat completion', async () => {
            const messages: ILLMMessage[] = [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello, how are you?' }
            ];

            const events: ILLMStreamEvent[] = [];

            await provider.streamChatCompletion(
                'mock-model-1',
                messages,
                undefined,
                (event) => {
                    events.push(event);
                }
            );

            expect(events.length).toBeGreaterThan(0);
            expect(events[events.length - 1].done).toBe(true);
        });

        test('should handle streaming without a callback', async () => {
            // This should not throw
            await expect(provider.streamCompletion(
                'mock-model-1',
                'Hello, world!'
            )).resolves.not.toThrow();
        });
    });

    describe('Request Management', () => {
        beforeEach(async () => {
            await provider.connect();
        });

        test('should cancel active requests', async () => {
            // Start a request that we'll immediately cancel
            const request: ILLMRequest = {
                model: 'mock-model-1',
                prompt: 'This is a test prompt',
                id: 'test-request-id'
            };

            // Don't await, just start it
            const promiseCompletion = provider.completePrompt(request);

            // Cancel it
            const cancelled = await provider.cancelRequest('test-request-id');
            expect(cancelled).toBe(true);

            // Now await the completion and check the result
            await promiseCompletion;
        });

        test('should return false when canceling non-existent request', async () => {
            const cancelled = await provider.cancelRequest('non-existent-id');
            expect(cancelled).toBe(false);
        });
    });

    describe('Offline Mode', () => {
        beforeEach(async () => {
            await provider.connect();
        });

        test('should set offline mode', () => {
            // Spy on the event emission
            const eventSpy = jest.fn();
            provider.on('offlineModeChanged', eventSpy);

            provider.setOfflineMode(true);
            expect(eventSpy).toHaveBeenCalledWith(true);

            provider.setOfflineMode(false);
            expect(eventSpy).toHaveBeenCalledWith(false);
        });

        test('should use cached responses in offline mode', async () => {
            const prompt = 'This should be cached';
            const response: ILLMResponse = {
                content: 'Cached response',
                model: 'mock-model-1',
                finishReason: 'stop'
            };

            // Cache a response
            await provider.cacheResponse(prompt, response);

            // Enable offline mode
            provider.setOfflineMode(true);

            // Disconnect (to ensure we're really using the cache)
            await provider.disconnect();

            // This would normally fail because we're disconnected
            const result = await provider.generateCompletion(
                'mock-model-1',
                prompt
            );

            expect(result.content).toBe('Cached response');
        });

        test('should handle missing cached response in offline mode', async () => {
            // Enable offline mode
            provider.setOfflineMode(true);

            // Try to get a response for a prompt that's not cached
            const cachedResponse = await provider.useCachedResponse('not-cached');
            expect(cachedResponse).toBeNull();
        });
    });

    describe('Error Handling', () => {
        test('should handle connection errors', async () => {
            // Mock a connection error
            const mockProvider = provider as MockLLMProvider;
            mockProvider['_status'] = 'error';

            // Check availability
            const isAvailable = await provider.isAvailable();
            expect(isAvailable).toBe(false);
        });

        test('should handle completion errors when not connected', async () => {
            // Ensure disconnected
            await provider.disconnect();

            // Try to complete
            await expect(provider.generateCompletion(
                'mock-model-1',
                'This should fail'
            )).rejects.toThrow('Provider not connected');
        });
    });
});
