import { ModelConfigService } from '../services/ModelConfigService';
import { ModelHealthMonitorService } from '../services/ModelHealthMonitorService';
import { ModelManager } from '../services/ModelManager';
import { LLMProvider } from '../types';

jest.mock('../services/ModelHealthMonitorService');
jest.mock('../services/ModelConfigService');

describe('ModelManager', () => {
    let modelManager: ModelManager;
    let mockHealthMonitor: jest.Mocked<ModelHealthMonitorService>;
    let mockConfigService: jest.Mocked<ModelConfigService>;
    let mockProvider: jest.Mocked<LLMProvider>;

    beforeEach(() => {
        mockHealthMonitor = new ModelHealthMonitorService() as jest.Mocked<ModelHealthMonitorService>;
        mockConfigService = new ModelConfigService() as jest.Mocked<ModelConfigService>;
        mockProvider = {
            getName: jest.fn().mockReturnValue('test-provider'),
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            isAvailable: jest.fn().mockResolvedValue(true),
            getConfig: jest.fn().mockReturnValue({ defaultModel: 'test-model' })
        } as unknown as jest.Mocked<LLMProvider>;

        modelManager = new ModelManager(mockHealthMonitor, mockConfigService);
    });

    describe('model registration', () => {
        it('should register a model successfully', async () => {
            const modelConfig = {
                name: 'test-model',
                provider: mockProvider,
                parameters: { temperature: 0.7 }
            };

            await modelManager.registerModel(modelConfig);
            expect(await modelManager.getModel('test-model')).toBeDefined();
        });

        it('should throw error when registering duplicate model', async () => {
            const modelConfig = {
                name: 'test-model',
                provider: mockProvider
            };

            await modelManager.registerModel(modelConfig);
            await expect(modelManager.registerModel(modelConfig))
                .rejects.toThrow('Model already registered');
        });

        it('should emit modelRegistered event', async () => {
            const listener = jest.fn();
            modelManager.on('modelRegistered', listener);

            const modelConfig = {
                name: 'test-model',
                provider: mockProvider
            };

            await modelManager.registerModel(modelConfig);
            expect(listener).toHaveBeenCalledWith('test-model');
        });
    });

    describe('model management', () => {
        const modelConfig = {
            name: 'test-model',
            provider: mockProvider
        };

        beforeEach(async () => {
            await modelManager.registerModel(modelConfig);
        });

        it('should get registered model', async () => {
            const model = await modelManager.getModel('test-model');
            expect(model).toBeDefined();
            expect(model?.name).toBe('test-model');
        });

        it('should return null for unregistered model', async () => {
            const model = await modelManager.getModel('non-existent');
            expect(model).toBeNull();
        });

        it('should list all registered models', async () => {
            const models = await modelManager.listModels();
            expect(models).toHaveLength(1);
            expect(models[0].name).toBe('test-model');
        });

        it('should unregister model', async () => {
            await modelManager.unregisterModel('test-model');
            expect(await modelManager.getModel('test-model')).toBeNull();
        });

        it('should emit modelUnregistered event', async () => {
            const listener = jest.fn();
            modelManager.on('modelUnregistered', listener);

            await modelManager.unregisterModel('test-model');
            expect(listener).toHaveBeenCalledWith('test-model');
        });
    });

    describe('model health monitoring', () => {
        const modelConfig = {
            name: 'test-model',
            provider: mockProvider
        };

        beforeEach(async () => {
            await modelManager.registerModel(modelConfig);
        });

        it('should start health monitoring on registration', () => {
            expect(mockHealthMonitor.startMonitoring)
                .toHaveBeenCalledWith('test-model', expect.any(Object));
        });

        it('should stop health monitoring on unregistration', async () => {
            await modelManager.unregisterModel('test-model');
            expect(mockHealthMonitor.stopMonitoring)
                .toHaveBeenCalledWith('test-model');
        });

        it('should handle health check failures', async () => {
            const errorListener = jest.fn();
            modelManager.on('modelError', errorListener);

            // Simulate health check failure
            const error = new Error('Health check failed');
            mockHealthMonitor.emit('modelUnhealthy', 'test-model', error);

            expect(errorListener).toHaveBeenCalledWith('test-model', error);
        });
    });

    describe('model configuration', () => {
        const modelConfig = {
            name: 'test-model',
            provider: mockProvider,
            parameters: { temperature: 0.7 }
        };

        beforeEach(async () => {
            await modelManager.registerModel(modelConfig);
        });

        it('should update model configuration', async () => {
            const newParams = { temperature: 0.8 };
            await modelManager.updateModelConfig('test-model', { parameters: newParams });

            const model = await modelManager.getModel('test-model');
            expect(model?.parameters).toEqual(newParams);
        });

        it('should persist configuration changes', async () => {
            const newParams = { temperature: 0.8 };
            await modelManager.updateModelConfig('test-model', { parameters: newParams });

            expect(mockConfigService.saveModelConfig).toHaveBeenCalledWith(
                'test-model',
                expect.objectContaining({ parameters: newParams })
            );
        });

        it('should emit configurationChanged event', async () => {
            const listener = jest.fn();
            modelManager.on('modelConfigChanged', listener);

            const newParams = { temperature: 0.8 };
            await modelManager.updateModelConfig('test-model', { parameters: newParams });

            expect(listener).toHaveBeenCalledWith('test-model', expect.any(Object));
        });
    });

    describe('cleanup', () => {
        it('should clean up resources on dispose', async () => {
            const modelConfig = {
                name: 'test-model',
                provider: mockProvider
            };
            await modelManager.registerModel(modelConfig);

            await modelManager.dispose();

            expect(mockHealthMonitor.dispose).toHaveBeenCalled();
            expect(mockProvider.disconnect).toHaveBeenCalled();
            // @ts-ignore - accessing EventEmitter internals for testing
            expect(modelManager.listenerCount('modelRegistered')).toBe(0);
        });
    });
});
