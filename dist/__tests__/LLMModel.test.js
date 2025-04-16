"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const llmModel_1 = require("../llmProviders/llmModel");
describe('LLMModel Interface', () => {
    // Test for required properties
    describe('Required Properties', () => {
        it('should create a valid model with required properties', () => {
            const model = {
                id: 'test-model',
                name: 'Test Model',
                provider: 'ollama',
                description: 'A model for testing',
            };
            expect(model.id).toBe('test-model');
            expect(model.name).toBe('Test Model');
            expect(model.provider).toBe('ollama');
            expect(model.description).toBe('A model for testing');
        });
        it('should error when missing required properties', () => {
            // @ts-expect-error - id is required
            const missingId = {
                name: 'Missing ID Model',
                provider: 'ollama',
                description: 'This model is missing an ID',
            };
            // @ts-expect-error - name is required
            const missingName = {
                id: 'missing-name',
                provider: 'ollama',
                description: 'This model is missing a name',
            };
            // @ts-expect-error - provider is required
            const missingProvider = {
                id: 'missing-provider',
                name: 'Missing Provider Model',
                description: 'This model is missing a provider',
            };
            // @ts-expect-error - description is required
            const missingDescription = {
                id: 'missing-description',
                name: 'Missing Description Model',
                provider: 'ollama',
            };
        });
        it('should error when provider has invalid value', () => {
            // @ts-expect-error - provider must be one of: 'ollama', 'lmstudio', 'huggingface'
            const invalidProvider = {
                id: 'invalid-provider',
                name: 'Invalid Provider Model',
                provider: 'invalid-provider',
                description: 'This model has an invalid provider',
            };
        });
    });
    // Test for optional properties
    describe('Optional Properties', () => {
        it('should handle optional properties correctly', () => {
            const model = {
                id: 'test-model-optional',
                name: 'Test Model with Options',
                provider: 'lmstudio',
                description: 'A model for testing optional properties',
                parameters: {
                    temperature: 0.7,
                    maxTokens: 2048
                },
                size: '7GB',
                license: 'MIT',
                tags: ['test', 'coding'],
                installed: true
            };
            expect(model.parameters).toEqual({
                temperature: 0.7,
                maxTokens: 2048
            });
            expect(model.size).toBe('7GB');
            expect(model.license).toBe('MIT');
            expect(model.tags).toEqual(['test', 'coding']);
            expect(model.installed).toBe(true);
        });
        it('should allow optional properties to be undefined', () => {
            const model = {
                id: 'test-model-undefined',
                name: 'Test Model with Undefined Options',
                provider: 'huggingface',
                description: 'A model for testing undefined optional properties'
            };
            expect(model.parameters).toBeUndefined();
            expect(model.size).toBeUndefined();
            expect(model.license).toBeUndefined();
            expect(model.tags).toBeUndefined();
            expect(model.installed).toBeUndefined();
        });
    });
    // Test provider types
    describe('Provider Types', () => {
        it('should accept all valid provider types', () => {
            const ollamaModel = {
                id: 'ollama-model',
                name: 'Ollama Model',
                provider: 'ollama',
                description: 'An Ollama model'
            };
            const lmStudioModel = {
                id: 'lmstudio-model',
                name: 'LM Studio Model',
                provider: 'lmstudio',
                description: 'An LM Studio model'
            };
            const huggingfaceModel = {
                id: 'huggingface-model',
                name: 'Hugging Face Model',
                provider: 'huggingface',
                description: 'A Hugging Face model'
            };
            expect(ollamaModel.provider).toBe('ollama');
            expect(lmStudioModel.provider).toBe('lmstudio');
            expect(huggingfaceModel.provider).toBe('huggingface');
        });
    });
    // Test for common use cases
    describe('Common Use Cases', () => {
        it('should handle a complete Ollama model', () => {
            const ollamaModel = {
                id: 'llama2',
                name: 'Llama 2 (7B)',
                provider: 'ollama',
                description: 'A 7B parameter model optimized for chat and general purpose tasks.',
                tags: ['chat', 'general'],
                size: '3.8GB',
                license: 'Llama 2 Community License',
                installed: true
            };
            expect(ollamaModel.id).toBe('llama2');
            expect(ollamaModel.provider).toBe('ollama');
            expect(ollamaModel.tags).toContain('chat');
            expect(ollamaModel.tags).toContain('general');
            expect(ollamaModel.installed).toBe(true);
        });
        it('should handle a complete LM Studio model', () => {
            const lmStudioModel = {
                id: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
                name: 'Mistral Instruct (7B) GGUF',
                provider: 'lmstudio',
                description: 'GGUF version of Mistral 7B optimized for instruction following.',
                tags: ['general', 'instruction'],
                size: '4.1GB',
                license: 'Apache 2.0',
                installed: false
            };
            expect(lmStudioModel.id).toBe('TheBloke/Mistral-7B-Instruct-v0.2-GGUF');
            expect(lmStudioModel.provider).toBe('lmstudio');
            expect(lmStudioModel.tags).toContain('general');
            expect(lmStudioModel.tags).toContain('instruction');
            expect(lmStudioModel.installed).toBe(false);
        });
        it('should handle a complete Hugging Face model', () => {
            const huggingfaceModel = {
                id: 'meta-llama/Llama-2-7b-chat-hf',
                name: 'Llama 2 Chat (7B)',
                provider: 'huggingface',
                description: 'Open foundation language model for chat use cases.',
                tags: ['chat', 'general'],
                size: '13GB',
                license: 'Llama 2 Community License',
                installed: false
            };
            expect(huggingfaceModel.id).toBe('meta-llama/Llama-2-7b-chat-hf');
            expect(huggingfaceModel.provider).toBe('huggingface');
            expect(huggingfaceModel.tags).toContain('chat');
            expect(huggingfaceModel.size).toBe('13GB');
        });
    });
});
describe('LLMModel', () => {
    describe('constructor', () => {
        it('should initialize with valid parameters', () => {
            const model = new llmModel_1.LLMModel({
                name: 'test-model',
                provider: 'ollama',
                baseUrl: 'http://localhost:11434',
                contextLength: 4096,
                supportedLanguages: ['javascript', 'typescript']
            });
            expect(model.name).toBe('test-model');
            expect(model.provider).toBe('ollama');
            expect(model.baseUrl).toBe('http://localhost:11434');
            expect(model.contextLength).toBe(4096);
            expect(model.supportedLanguages).toEqual(['javascript', 'typescript']);
        });
        it('should throw error for invalid provider', () => {
            expect(() => {
                new llmModel_1.LLMModel({
                    name: 'test-model',
                    provider: 'invalid',
                    baseUrl: 'http://localhost:11434',
                    contextLength: 4096,
                    supportedLanguages: ['javascript']
                });
            }).toThrow('Invalid provider specified');
        });
        it('should validate required parameters', () => {
            expect(() => {
                new llmModel_1.LLMModel({
                    name: '',
                    provider: 'ollama',
                    baseUrl: '',
                    contextLength: 0,
                    supportedLanguages: []
                });
            }).toThrow('Invalid model configuration');
        });
    });
    describe('validation', () => {
        it('should validate context length is positive', () => {
            expect(() => {
                new llmModel_1.LLMModel({
                    name: 'test-model',
                    provider: 'ollama',
                    baseUrl: 'http://localhost:11434',
                    contextLength: -1,
                    supportedLanguages: ['javascript']
                });
            }).toThrow('Context length must be positive');
        });
        it('should require at least one supported language', () => {
            expect(() => {
                new llmModel_1.LLMModel({
                    name: 'test-model',
                    provider: 'ollama',
                    baseUrl: 'http://localhost:11434',
                    contextLength: 4096,
                    supportedLanguages: []
                });
            }).toThrow('At least one supported language must be specified');
        });
        it('should require valid base URL', () => {
            expect(() => {
                new llmModel_1.LLMModel({
                    name: 'test-model',
                    provider: 'ollama',
                    baseUrl: 'invalid-url',
                    contextLength: 4096,
                    supportedLanguages: ['javascript']
                });
            }).toThrow('Invalid base URL');
        });
        it('should accept valid provider types', () => {
            const validProviders = ['ollama', 'lmstudio', 'huggingface'];
            validProviders.forEach(provider => {
                const model = {
                    id: 'test-model',
                    name: 'Test Model',
                    provider,
                    description: 'A test model',
                };
                expect(model.provider).toBe(provider);
            });
        });
        it('should include all required properties', () => {
            const model = {
                id: 'test-model',
                name: 'Test Model',
                provider: 'ollama',
                description: 'A test model'
            };
            expect(model).toHaveProperty('id');
            expect(model).toHaveProperty('name');
            expect(model).toHaveProperty('provider');
            expect(model).toHaveProperty('description');
        });
        it('should handle optional properties', () => {
            const model = {
                id: 'test-model',
                name: 'Test Model',
                provider: 'ollama',
                description: 'A test model',
                parameters: {
                    temperature: 0.7,
                    maxTokens: 2048
                },
                size: '7GB',
                license: 'MIT',
                tags: ['test', 'coding'],
                installed: true
            };
            expect(model.parameters).toEqual({
                temperature: 0.7,
                maxTokens: 2048
            });
            expect(model.size).toBe('7GB');
            expect(model.license).toBe('MIT');
            expect(model.tags).toEqual(['test', 'coding']);
            expect(model.installed).toBe(true);
        });
    });
    describe('provider specific tests', () => {
        it('should handle Ollama models', () => {
            const model = {
                id: 'llama2',
                name: 'Llama 2 (7B)',
                provider: 'ollama',
                description: 'Llama 2 model optimized for chat',
                size: '4GB',
                installed: true
            };
            expect(model.provider).toBe('ollama');
        });
        it('should handle LM Studio models', () => {
            const model = {
                id: 'mistral',
                name: 'Mistral 7B',
                provider: 'lmstudio',
                description: 'Mistral model for LM Studio',
                size: '4GB',
                installed: false
            };
            expect(model.provider).toBe('lmstudio');
        });
        it('should handle Hugging Face models', () => {
            const model = {
                id: 'meta-llama/Llama-2-7b-chat-hf',
                name: 'Llama 2 Chat (7B)',
                provider: 'huggingface',
                description: 'Hugging Face hosted Llama 2',
                license: 'Llama 2 Community License'
            };
            expect(model.provider).toBe('huggingface');
        });
    });
    describe('Model Validation', () => {
        it('should validate provider type', () => {
            expect(() => {
                new llmModel_1.LLMModel({
                    name: 'test-model',
                    provider: 'invalid-provider', // Type assertion for test
                    modelId: 'test-id',
                    contextWindow: 4096,
                    pricing: {
                        input: 0.0001,
                        output: 0.0002
                    }
                });
            }).toThrow();
        });
        it('should validate required fields', () => {
            expect(() => {
                new llmModel_1.LLMModel({
                    name: 'test-model',
                    provider: 'ollama',
                    // missing modelId
                    contextWindow: 4096,
                    pricing: {
                        input: 0.0001,
                        output: 0.0002
                    }
                }); // Type assertion for test
            }).toThrow();
        });
        it('should validate pricing values', () => {
            expect(() => {
                new llmModel_1.LLMModel({
                    name: 'test-model',
                    provider: 'ollama',
                    modelId: 'test-id',
                    contextWindow: 4096,
                    pricing: {
                        input: -1, // Invalid negative price
                        output: 0.0002
                    }
                });
            }).toThrow();
        });
        it('should create valid model instance', () => {
            const model = new llmModel_1.LLMModel({
                name: 'test-model',
                provider: 'ollama',
                modelId: 'test-id',
                contextWindow: 4096,
                pricing: {
                    input: 0.0001,
                    output: 0.0002
                }
            });
            expect(model).toBeDefined();
            expect(model.name).toBe('test-model');
            expect(model.provider).toBe('ollama');
        });
    });
    describe('Model Features', () => {
        it('should calculate token costs', () => {
            const model = new llmModel_1.LLMModel({
                name: 'test-model',
                provider: 'ollama',
                modelId: 'test-id',
                contextWindow: 4096,
                pricing: {
                    input: 0.0001,
                    output: 0.0002
                }
            });
            const inputTokens = 100;
            const outputTokens = 50;
            const cost = model.calculateCost(inputTokens, outputTokens);
            expect(cost).toBe(0.0001 * inputTokens + 0.0002 * outputTokens);
        });
        it('should validate context window size', () => {
            const model = new llmModel_1.LLMModel({
                name: 'test-model',
                provider: 'ollama',
                modelId: 'test-id',
                contextWindow: 4096,
                pricing: {
                    input: 0.0001,
                    output: 0.0002
                }
            });
            expect(model.validateContextSize(4000)).toBe(true);
            expect(model.validateContextSize(5000)).toBe(false);
        });
        it('should handle optional parameters', () => {
            const model = new llmModel_1.LLMModel({
                name: 'test-model',
                provider: 'ollama',
                modelId: 'test-id',
                contextWindow: 4096,
                pricing: {
                    input: 0.0001,
                    output: 0.0002
                },
                capabilities: {
                    streaming: true,
                    functionCalls: false
                }
            });
            expect(model.capabilities?.streaming).toBe(true);
            expect(model.capabilities?.functionCalls).toBe(false);
        });
    });
    describe('Provider Integration', () => {
        let mockProvider;
        beforeEach(() => {
            mockProvider = {
                name: 'mock-provider',
                getModels: jest.fn(),
                sendMessage: jest.fn(),
                getContext: jest.fn()
            };
        });
        it('should work with provider API', () => {
            const model = new llmModel_1.LLMModel({
                name: 'test-model',
                provider: 'ollama',
                modelId: 'test-id',
                contextWindow: 4096,
                pricing: {
                    input: 0.0001,
                    output: 0.0002
                }
            });
            expect(() => model.setProvider(mockProvider)).not.toThrow();
        });
        it('should validate provider compatibility', () => {
            const model = new llmModel_1.LLMModel({
                name: 'test-model',
                provider: 'lmstudio',
                modelId: 'test-id',
                contextWindow: 4096,
                pricing: {
                    input: 0.0001,
                    output: 0.0002
                }
            });
            mockProvider.name = 'ollama';
            expect(() => model.setProvider(mockProvider)).toThrow();
        });
    });
});
//# sourceMappingURL=LLMModel.test.js.map