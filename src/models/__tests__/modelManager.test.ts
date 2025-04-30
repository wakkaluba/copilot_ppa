import { LMStudioProvider } from '../../llm/lmStudioProvider';
import { OllamaProvider } from '../../llm/ollamaProvider';
import { ModelManager } from '../modelManager';

// Mock providers
jest.mock('../../llm/ollamaProvider');
jest.mock('../../llm/lmStudioProvider');

describe('ModelManager', () => {
    let modelManager: ModelManager;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Reset modelManager instance
        modelManager = new ModelManager();
    });

    describe('initialization', () => {
        test('initializes with default providers', () => {
            expect(OllamaProvider).toHaveBeenCalled();
            expect(LMStudioProvider).toHaveBeenCalled();
        });

        test('starts with no active model', () => {
            expect(() => modelManager.getActiveModel())
                .toThrow('No active model');
        });
    });

    describe('model management', () => {
        test('adds model configuration', async () => {
            const modelConfig = {
                name: 'test-model',
                provider: 'ollama',
                modelPath: '/path/to/model',
                parameters: {
                    temperature: 0.7,
                    maxTokens: 2048
                }
            };

            await modelManager.addModel(modelConfig);
            const models = modelManager.getAvailableModels();
            expect(models).toContain('test-model');
        });

        test('switches active model', async () => {
            const modelConfig = {
                name: 'test-model',
                provider: 'ollama',
                modelPath: '/path/to/model',
                parameters: {}
            };

            // Add and switch to model
            await modelManager.addModel(modelConfig);
            await modelManager.switchModel('test-model');

            // Verify provider initialization
            const mockOllamaProvider = OllamaProvider.mock.instances[0];
            expect(mockOllamaProvider.initialize).toHaveBeenCalledWith(modelConfig);

            // Verify active model is set
            const activeModel = modelManager.getActiveModel();
            expect(activeModel).toBeDefined();
        });

        test('throws error when switching to non-existent model', async () => {
            await expect(modelManager.switchModel('non-existent'))
                .rejects.toThrow('Model non-existent not found');
        });

        test('throws error when switching to model with invalid provider', async () => {
            const modelConfig = {
                name: 'invalid-provider-model',
                provider: 'invalid',
                modelPath: '/path',
                parameters: {}
            };

            await modelManager.addModel(modelConfig);
            await expect(modelManager.switchModel('invalid-provider-model'))
                .rejects.toThrow('Provider invalid not found');
        });
    });

    describe('provider management', () => {
        test('initializes default providers', () => {
            const models = modelManager.getAvailableModels();
            expect(models).toHaveLength(0); // No models added yet

            // Verify both default providers were initialized
            expect(OllamaProvider).toHaveBeenCalledTimes(1);
            expect(LMStudioProvider).toHaveBeenCalledTimes(1);
        });

        test('handles provider initialization errors gracefully', async () => {
            const mockProvider = OllamaProvider.mock.instances[0];
            mockProvider.initialize.mockRejectedValue(new Error('Init failed'));

            const modelConfig = {
                name: 'test-model',
                provider: 'ollama',
                modelPath: '/path/to/model',
                parameters: {}
            };

            await modelManager.addModel(modelConfig);
            await expect(modelManager.switchModel('test-model'))
                .rejects.toThrow('Init failed');
        });
    });

    describe('model configuration', () => {
        test('preserves model configurations', async () => {
            const configs = [
                {
                    name: 'model1',
                    provider: 'ollama',
                    modelPath: '/path/1',
                    parameters: { temperature: 0.8 }
                },
                {
                    name: 'model2',
                    provider: 'lmstudio',
                    modelPath: '/path/2',
                    parameters: { maxTokens: 4096 }
                }
            ];

            // Add multiple models
            for (const config of configs) {
                await modelManager.addModel(config);
            }

            // Verify all models are available
            const models = modelManager.getAvailableModels();
            expect(models).toHaveLength(configs.length);
            expect(models).toContain('model1');
            expect(models).toContain('model2');
        });

        test('allows switching between models', async () => {
            const configs = [
                {
                    name: 'model1',
                    provider: 'ollama',
                    modelPath: '/path/1',
                    parameters: {}
                },
                {
                    name: 'model2',
                    provider: 'ollama',
                    modelPath: '/path/2',
                    parameters: {}
                }
            ];

            // Add models
            for (const config of configs) {
                await modelManager.addModel(config);
            }

            // Switch between models
            await modelManager.switchModel('model1');
            expect(modelManager.getActiveModel()).toBeDefined();

            await modelManager.switchModel('model2');
            expect(modelManager.getActiveModel()).toBeDefined();

            // Verify provider initialization was called for each switch
            const mockProvider = OllamaProvider.mock.instances[0];
            expect(mockProvider.initialize).toHaveBeenCalledTimes(2);
        });
    });
});
