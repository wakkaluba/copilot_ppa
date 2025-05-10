import { describe, expect, it } from '@jest/globals';
import { EventEmitter } from 'events';
import {
    ILLMProvider,
    ILLMProviderConfig,
    ILLMRequestOptions,
    ILLMResponse,
    IProviderCapabilities
} from '../../../src/llm-providers/llm-provider.interface';

// Helper function to create a mock implementation of ILLMProvider for testing
function createMockProvider(): ILLMProvider {
    class MockProvider extends EventEmitter implements ILLMProvider {
        readonly id: string = 'mock-provider-123';
        readonly name: string = 'MockProvider';
        readonly model: string = 'mock-model-v1';

        constructor() {
            super();
        }

        getCapabilities(): IProviderCapabilities {
            return {
                supportsStreaming: true,
                supportsMultipleModels: true,
                supportsSystemPrompts: true,
                maxTokens: 4096,
                supportedLanguages: ['en', 'es', 'fr']
            };
        }

        async isAvailable(): Promise<boolean> {
            return true;
        }

        getStatus(): 'active' | 'inactive' | 'error' {
            return 'active';
        }

        async initialize(config: ILLMProviderConfig): Promise<void> {
            // Mock implementation
        }

        async connect(): Promise<void> {
            // Mock implementation
        }

        async disconnect(): Promise<void> {
            // Mock implementation
        }

        async generateCompletion(
            model: string,
            prompt: string,
            systemPrompt?: string,
            options?: ILLMRequestOptions
        ): Promise<ILLMResponse> {
            return {
                text: `Response to: ${prompt}`,
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30
                },
                metadata: { source: 'mock' },
                requestId: '123',
                model: model,
                finishReason: 'stop'
            };
        }

        async *streamCompletion(
            model: string,
            prompt: string,
            systemPrompt?: string,
            options?: ILLMRequestOptions
        ): AsyncIterableIterator<ILLMResponse> {
            yield {
                text: `Streaming response to: ${prompt}`,
                requestId: '123',
                model: model
            };
        }

        async cancelCompletion(requestId: string): Promise<void> {
            // Mock implementation
        }

        async getAvailableModels(): Promise<string[]> {
            return ['mock-model-v1', 'mock-model-v2'];
        }

        async validateConfig(config: ILLMProviderConfig): Promise<boolean> {
            return true;
        }
    }

    return new MockProvider();
}

describe('ILLMProvider Interface', () => {
    let mockProvider: ILLMProvider;

    beforeEach(() => {
        mockProvider = createMockProvider();
    });

    describe('Basic properties', () => {
        it('should have required provider properties', () => {
            expect(mockProvider.id).toBeDefined();
            expect(typeof mockProvider.id).toBe('string');

            expect(mockProvider.name).toBeDefined();
            expect(typeof mockProvider.name).toBe('string');

            expect(mockProvider.model).toBeDefined();
            expect(typeof mockProvider.model).toBe('string');
        });

        it('should extend EventEmitter', () => {
            expect(mockProvider).toBeInstanceOf(EventEmitter);
            expect(typeof mockProvider.on).toBe('function');
            expect(typeof mockProvider.emit).toBe('function');
        });
    });

    describe('Provider capabilities', () => {
        it('should return valid capabilities object', () => {
            const capabilities = mockProvider.getCapabilities();

            expect(capabilities).toBeDefined();
            expect(typeof capabilities.supportsStreaming).toBe('boolean');
            expect(typeof capabilities.supportsMultipleModels).toBe('boolean');
            expect(typeof capabilities.supportsSystemPrompts).toBe('boolean');
            expect(typeof capabilities.maxTokens).toBe('number');
            expect(Array.isArray(capabilities.supportedLanguages)).toBe(true);

            // Optional validation of array contents
            if (capabilities.supportedLanguages.length > 0) {
                expect(typeof capabilities.supportedLanguages[0]).toBe('string');
            }
        });
    });

    describe('Provider lifecycle methods', () => {
        it('should implement availability check method', async () => {
            const isAvailable = await mockProvider.isAvailable();
            expect(typeof isAvailable).toBe('boolean');
        });

        it('should implement status reporting method', () => {
            const status = mockProvider.getStatus();
            expect(['active', 'inactive', 'error']).toContain(status);
        });

        it('should implement initialization method', async () => {
            const config: ILLMProviderConfig = {
                apiKey: 'test-key',
                model: 'test-model',
                baseUrl: 'https://api.example.com',
                maxTokens: 2048
            };

            await expect(mockProvider.initialize(config)).resolves.not.toThrow();
        });

        it('should implement connection methods', async () => {
            await expect(mockProvider.connect()).resolves.not.toThrow();
            await expect(mockProvider.disconnect()).resolves.not.toThrow();
        });
    });

    describe('Text generation methods', () => {
        it('should implement generateCompletion method', async () => {
            const response = await mockProvider.generateCompletion(
                'test-model',
                'Hello, world!'
            );

            expect(response).toBeDefined();
            expect(typeof response.text).toBe('string');

            // Optional properties validation
            if (response.usage) {
                expect(typeof response.usage.promptTokens).toBe('number');
                expect(typeof response.usage.completionTokens).toBe('number');
                expect(typeof response.usage.totalTokens).toBe('number');
            }

            if (response.metadata) {
                expect(typeof response.metadata).toBe('object');
            }

            if (response.requestId) {
                expect(typeof response.requestId).toBe('string');
            }

            if (response.model) {
                expect(typeof response.model).toBe('string');
            }

            if (response.finishReason) {
                expect(['stop', 'length', 'timeout', 'error']).toContain(response.finishReason);
            }
        });

        it('should implement streamCompletion method', async () => {
            const streamIterator = mockProvider.streamCompletion(
                'test-model',
                'Hello, world!'
            );

            // Verify it's an async iterator
            expect(streamIterator[Symbol.asyncIterator]).toBeDefined();

            // Test consuming the first value
            const firstValue = await streamIterator.next();
            expect(firstValue.done).toBeDefined();

            if (!firstValue.done) {
                const response = firstValue.value;
                expect(response).toBeDefined();
                expect(typeof response.text).toBe('string');
            }
        });

        it('should implement cancelCompletion method', async () => {
            await expect(mockProvider.cancelCompletion('123')).resolves.not.toThrow();
        });
    });

    describe('Model management methods', () => {
        it('should implement getAvailableModels method', async () => {
            const models = await mockProvider.getAvailableModels();

            expect(Array.isArray(models)).toBe(true);
            if (models.length > 0) {
                expect(typeof models[0]).toBe('string');
            }
        });

        it('should implement validateConfig method', async () => {
            const config: ILLMProviderConfig = {
                apiKey: 'test-key',
                model: 'test-model'
            };

            const isValid = await mockProvider.validateConfig(config);
            expect(typeof isValid).toBe('boolean');
        });
    });
});

describe('IProviderCapabilities Interface', () => {
    it('should validate the structure of capabilities object', () => {
        const capabilities: IProviderCapabilities = {
            supportsStreaming: true,
            supportsMultipleModels: false,
            supportsSystemPrompts: true,
            maxTokens: 2048,
            supportedLanguages: ['en', 'fr', 'de']
        };

        expect(capabilities.supportsStreaming).toBeDefined();
        expect(capabilities.supportsMultipleModels).toBeDefined();
        expect(capabilities.supportsSystemPrompts).toBeDefined();
        expect(capabilities.maxTokens).toBeDefined();
        expect(capabilities.supportedLanguages).toBeDefined();

        expect(typeof capabilities.supportsStreaming).toBe('boolean');
        expect(typeof capabilities.supportsMultipleModels).toBe('boolean');
        expect(typeof capabilities.supportsSystemPrompts).toBe('boolean');
        expect(typeof capabilities.maxTokens).toBe('number');
        expect(Array.isArray(capabilities.supportedLanguages)).toBe(true);
    });
});

describe('ILLMProviderConfig Interface', () => {
    it('should validate minimal valid config object', () => {
        const minimalConfig: ILLMProviderConfig = {
            apiKey: 'test-key'
        };

        expect(minimalConfig.apiKey).toBeDefined();
        expect(typeof minimalConfig.apiKey).toBe('string');
    });

    it('should validate complete config object with all properties', () => {
        const fullConfig: ILLMProviderConfig = {
            apiKey: 'test-key',
            model: 'gpt-4',
            baseUrl: 'https://api.example.com/v1',
            organizationId: 'org-123',
            maxTokens: 4096,
            temperature: 0.7,
            timeout: 30000
        };

        expect(fullConfig.apiKey).toBeDefined();
        expect(fullConfig.model).toBeDefined();
        expect(fullConfig.baseUrl).toBeDefined();
        expect(fullConfig.organizationId).toBeDefined();
        expect(fullConfig.maxTokens).toBeDefined();
        expect(fullConfig.temperature).toBeDefined();
        expect(fullConfig.timeout).toBeDefined();

        expect(typeof fullConfig.apiKey).toBe('string');
        expect(typeof fullConfig.model).toBe('string');
        expect(typeof fullConfig.baseUrl).toBe('string');
        expect(typeof fullConfig.organizationId).toBe('string');
        expect(typeof fullConfig.maxTokens).toBe('number');
        expect(typeof fullConfig.temperature).toBe('number');
        expect(typeof fullConfig.timeout).toBe('number');
    });
});

describe('ILLMRequestOptions Interface', () => {
    it('should validate minimal request options object', () => {
        const minimalOptions: ILLMRequestOptions = {};
        expect(minimalOptions).toBeDefined();
    });

    it('should validate complete request options object', () => {
        const fullOptions: ILLMRequestOptions = {
            temperature: 0.8,
            maxTokens: 2048,
            topP: 0.95,
            frequencyPenalty: 0.5,
            presencePenalty: 0.5,
            stop: ['\n', 'END'],
            timeout: 60000
        };

        expect(fullOptions.temperature).toBeDefined();
        expect(fullOptions.maxTokens).toBeDefined();
        expect(fullOptions.topP).toBeDefined();
        expect(fullOptions.frequencyPenalty).toBeDefined();
        expect(fullOptions.presencePenalty).toBeDefined();
        expect(fullOptions.stop).toBeDefined();
        expect(fullOptions.timeout).toBeDefined();

        expect(typeof fullOptions.temperature).toBe('number');
        expect(typeof fullOptions.maxTokens).toBe('number');
        expect(typeof fullOptions.topP).toBe('number');
        expect(typeof fullOptions.frequencyPenalty).toBe('number');
        expect(typeof fullOptions.presencePenalty).toBe('number');
        expect(Array.isArray(fullOptions.stop)).toBe(true);
        expect(typeof fullOptions.timeout).toBe('number');
    });
});

describe('ILLMResponse Interface', () => {
    it('should validate minimal response object', () => {
        const minimalResponse: ILLMResponse = {
            text: 'Hello, world!'
        };

        expect(minimalResponse.text).toBeDefined();
        expect(typeof minimalResponse.text).toBe('string');
    });

    it('should validate complete response object', () => {
        const fullResponse: ILLMResponse = {
            text: 'Hello, world!',
            usage: {
                promptTokens: 5,
                completionTokens: 3,
                totalTokens: 8
            },
            metadata: {
                timestamp: Date.now(),
                model: 'gpt-4'
            },
            requestId: 'req-abc-123',
            model: 'gpt-4',
            finishReason: 'stop'
        };

        expect(fullResponse.text).toBeDefined();
        expect(fullResponse.usage).toBeDefined();
        expect(fullResponse.metadata).toBeDefined();
        expect(fullResponse.requestId).toBeDefined();
        expect(fullResponse.model).toBeDefined();
        expect(fullResponse.finishReason).toBeDefined();

        expect(typeof fullResponse.text).toBe('string');
        expect(typeof fullResponse.usage?.promptTokens).toBe('number');
        expect(typeof fullResponse.usage?.completionTokens).toBe('number');
        expect(typeof fullResponse.usage?.totalTokens).toBe('number');
        expect(typeof fullResponse.metadata).toBe('object');
        expect(typeof fullResponse.requestId).toBe('string');
        expect(typeof fullResponse.model).toBe('string');
        expect(['stop', 'length', 'timeout', 'error']).toContain(fullResponse.finishReason!);
    });
});
