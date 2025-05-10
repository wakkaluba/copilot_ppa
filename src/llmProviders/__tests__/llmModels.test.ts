import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { LLMModel, LLMModelsManager } from '../llmModels';

// Mock the LLMModelsService
jest.mock('../services/LLMModelsService', () => {
    return {
        LLMModelsService: jest.fn().mockImplementation(() => {
            const modelsChangedEmitter = new EventEmitter();

            return {
                onModelsChanged: modelsChangedEmitter.on.bind(modelsChangedEmitter, 'modelsChanged'),
                emitModelsChanged: () => modelsChangedEmitter.emit('modelsChanged'),

                initialize: jest.fn().mockResolvedValue(undefined),
                refreshInstalledModels: jest.fn().mockResolvedValue(undefined),
                getInstalledModels: jest.fn().mockResolvedValue([]),
                getAvailableModels: jest.fn().mockResolvedValue([]),
                getAllModels: jest.fn().mockResolvedValue([]),
                getModel: jest.fn().mockResolvedValue(null),
                downloadModel: jest.fn().mockResolvedValue(undefined),
                deleteModel: jest.fn().mockResolvedValue(undefined),
                checkOllamaStatus: jest.fn().mockResolvedValue({ running: false }),
                checkLMStudioStatus: jest.fn().mockResolvedValue({ running: false }),
                startOllama: jest.fn().mockResolvedValue(undefined),
                stopOllama: jest.fn().mockResolvedValue(undefined)
            };
        })
    };
});

describe('LLMModelsManager', () => {
    let manager: LLMModelsManager;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        // Create a mock vscode.ExtensionContext
        mockContext = {
            extensionPath: '/test/extension/path',
            subscriptions: [],
            workspaceState: {
                get: jest.fn(),
                update: jest.fn()
            } as any,
            globalState: {
                get: jest.fn(),
                update: jest.fn()
            } as any,
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn()
            },
            extensionUri: {} as any,
            environmentVariableCollection: {} as any,
            storageUri: null,
            globalStorageUri: {} as any,
            logUri: {} as any,
            extensionMode: 1,
            logPath: ''
        };

        manager = new LLMModelsManager(mockContext);
    });

    describe('Initialization', () => {
        it('should initialize correctly', async () => {
            await manager.initialize();

            // The initialize method should have been called on the service
            expect(manager['service'].initialize).toHaveBeenCalled();
        });
    });

    describe('Model Management', () => {
        it('should refresh installed models', async () => {
            await manager.refreshInstalledModels();

            expect(manager['service'].refreshInstalledModels).toHaveBeenCalled();
        });

        it('should get installed models', async () => {
            const mockModels: LLMModel[] = [
                {
                    id: 'test-model-1',
                    name: 'Test Model 1',
                    provider: 'ollama',
                    description: 'A test model',
                    installed: true
                },
                {
                    id: 'test-model-2',
                    name: 'Test Model 2',
                    provider: 'lmstudio',
                    description: 'Another test model',
                    installed: true
                }
            ];

            (manager['service'].getInstalledModels as jest.Mock).mockResolvedValueOnce(mockModels);

            const result = await manager.getInstalledModels();

            expect(result).toEqual(mockModels);
            expect(manager['service'].getInstalledModels).toHaveBeenCalled();
        });

        it('should get available models', async () => {
            const mockModels: LLMModel[] = [
                {
                    id: 'available-model-1',
                    name: 'Available Model 1',
                    provider: 'ollama',
                    description: 'An available model',
                    installed: false
                },
                {
                    id: 'available-model-2',
                    name: 'Available Model 2',
                    provider: 'huggingface',
                    description: 'Another available model',
                    installed: false
                }
            ];

            (manager['service'].getAvailableModels as jest.Mock).mockResolvedValueOnce(mockModels);

            const result = await manager.getAvailableModels();

            expect(result).toEqual(mockModels);
            expect(manager['service'].getAvailableModels).toHaveBeenCalled();
        });

        it('should get all models', async () => {
            const mockModels: LLMModel[] = [
                {
                    id: 'model-1',
                    name: 'Model 1',
                    provider: 'ollama',
                    description: 'A model',
                    installed: true
                },
                {
                    id: 'model-2',
                    name: 'Model 2',
                    provider: 'lmstudio',
                    description: 'Another model',
                    installed: false
                }
            ];

            (manager['service'].getAllModels as jest.Mock).mockResolvedValueOnce(mockModels);

            const result = await manager.getAllModels();

            expect(result).toEqual(mockModels);
            expect(manager['service'].getAllModels).toHaveBeenCalled();
        });

        it('should get a specific model', async () => {
            const mockModel: LLMModel = {
                id: 'test-model',
                name: 'Test Model',
                provider: 'ollama',
                description: 'A test model',
                installed: true
            };

            (manager['service'].getModel as jest.Mock).mockResolvedValueOnce(mockModel);

            const result = await manager.getModel('test-model');

            expect(result).toEqual(mockModel);
            expect(manager['service'].getModel).toHaveBeenCalledWith('test-model');
        });

        it('should download a model', async () => {
            await manager.downloadModel('test-model');

            expect(manager['service'].downloadModel).toHaveBeenCalledWith('test-model');
        });

        it('should delete a model', async () => {
            await manager.deleteModel('test-model');

            expect(manager['service'].deleteModel).toHaveBeenCalledWith('test-model');
        });
    });

    describe('Provider Status', () => {
        it('should check Ollama status', async () => {
            const mockStatus = { running: true, port: 11434 };

            (manager['service'].checkOllamaStatus as jest.Mock).mockResolvedValueOnce(mockStatus);

            const result = await manager.checkOllamaStatus();

            expect(result).toEqual(mockStatus);
            expect(manager['service'].checkOllamaStatus).toHaveBeenCalled();
        });

        it('should check LM Studio status', async () => {
            const mockStatus = { running: true, port: 1234 };

            (manager['service'].checkLMStudioStatus as jest.Mock).mockResolvedValueOnce(mockStatus);

            const result = await manager.checkLMStudioStatus();

            expect(result).toEqual(mockStatus);
            expect(manager['service'].checkLMStudioStatus).toHaveBeenCalled();
        });

        it('should start Ollama', async () => {
            await manager.startOllama();

            expect(manager['service'].startOllama).toHaveBeenCalled();
        });

        it('should stop Ollama', async () => {
            await manager.stopOllama();

            expect(manager['service'].stopOllama).toHaveBeenCalled();
        });
    });

    describe('Events', () => {
        it('should propagate model changed events', () => {
            const listener = jest.fn();

            // Register listener
            manager.onModelsChanged(listener);

            // Emit event from service
            (manager['service'] as any).emitModelsChanged();

            expect(listener).toHaveBeenCalled();
        });
    });
});
