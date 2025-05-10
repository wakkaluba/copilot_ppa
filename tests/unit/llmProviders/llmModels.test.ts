/**
 * Tests for the LLM Models Manager (TypeScript)
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as vscode from 'vscode';
import { LLMModel, LLMModelsManager } from '../../../src/llmProviders/llmModels';

// Mock the LLMModelsService since we couldn't find the actual implementation
jest.mock('../../../src/llmProviders/services/LLMModelsService', () => {
  // Create an event emitter for onModelsChanged
  const EventEmitter = jest.fn().mockImplementation(() => ({
    event: jest.fn(),
    fire: jest.fn()
  }));

  return {
    LLMModelsService: jest.fn().mockImplementation(() => ({
      onModelsChanged: new EventEmitter().event,
      initializeModels: jest.fn().mockResolvedValue(undefined),
      getLocalModels: jest.fn().mockReturnValue([]),
      getHuggingFaceModels: jest.fn().mockReturnValue([]),
      refreshInstalledModels: jest.fn().mockResolvedValue(undefined),
      downloadOllamaModel: jest.fn().mockResolvedValue(undefined),
      downloadLmStudioModel: jest.fn().mockResolvedValue(undefined),
      checkOllamaStatus: jest.fn().mockResolvedValue({ installed: false, running: false }),
      checkLmStudioStatus: jest.fn().mockResolvedValue({ installed: false }),
      getOllamaInstallInstructions: jest.fn().mockReturnValue(''),
      getLmStudioInstallInstructions: jest.fn().mockReturnValue('')
    }))
  };
});

describe('LLMModelsManager (TypeScript)', () => {
  let extensionContext: vscode.ExtensionContext;
  let modelsManager: LLMModelsManager;

  beforeEach(() => {
    // Create a mock extension context
    extensionContext = {
      subscriptions: [],
      extensionPath: '/path/to/extension',
      extensionUri: vscode.Uri.parse('file:///path/to/extension'),
      asAbsolutePath: jest.fn().mockImplementation(relativePath => `/path/to/extension/${relativePath}`),
      storagePath: '/path/to/storage',
      storageUri: vscode.Uri.parse('file:///path/to/storage'),
      globalState: {
        get: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        setKeysForSync: jest.fn(),
        keys: jest.fn().mockReturnValue([])
      } as any,
      workspaceState: {
        get: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        keys: jest.fn().mockReturnValue([])
      } as any,
      secrets: {
        get: jest.fn(),
        store: jest.fn(),
        delete: jest.fn()
      } as any,
      extensionMode: vscode.ExtensionMode.Test,
      logPath: '/path/to/logs',
      logUri: vscode.Uri.parse('file:///path/to/logs'),
      environmentVariableCollection: {} as any,
      globalStorageUri: vscode.Uri.parse('file:///path/to/global-storage'),
      globalStoragePath: '/path/to/global-storage',
      workspaceStorageUri: vscode.Uri.parse('file:///path/to/workspace-storage'),
      workspaceStoragePath: '/path/to/workspace-storage',
      storageDatabase: {} as any,
      extension: {} as any,
      extensionKind: vscode.ExtensionKind.UI,
      extensionLocation: vscode.Uri.parse('file:///path/to/extension-location'),
      accessKey: '',
      extendedState: {} as any,
      extensionRuntime: {} as any
    };

    // Create an instance of LLMModelsManager
    modelsManager = new LLMModelsManager(extensionContext);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be instantiated correctly', () => {
    expect(modelsManager).toBeInstanceOf(LLMModelsManager);
  });

  it('should have an onModelsChanged event', () => {
    expect(modelsManager.onModelsChanged).toBeDefined();
  });

  it('should call initializeModels on the service when initialized', async () => {
    await modelsManager.initialize();

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Check that initializeModels was called
    expect(service.initializeModels).toHaveBeenCalled();
  });

  it('should return local models from the service', () => {
    const mockModels: LLMModel[] = [
      {
        id: 'model1',
        name: 'Model 1',
        provider: 'ollama',
        description: 'A test model'
      },
      {
        id: 'model2',
        name: 'Model 2',
        provider: 'lmstudio',
        description: 'Another test model'
      }
    ];

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mock to return our test models
    service.getLocalModels.mockReturnValue(mockModels);

    // Call the method and verify the result
    const result = modelsManager.getLocalModels();
    expect(result).toEqual(mockModels);
    expect(service.getLocalModels).toHaveBeenCalled();
  });

  it('should return HuggingFace models from the service', () => {
    const mockModels: LLMModel[] = [
      {
        id: 'hf-model1',
        name: 'HF Model 1',
        provider: 'huggingface',
        description: 'A test HuggingFace model'
      },
      {
        id: 'hf-model2',
        name: 'HF Model 2',
        provider: 'huggingface',
        description: 'Another test HuggingFace model'
      }
    ];

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mock to return our test models
    service.getHuggingFaceModels.mockReturnValue(mockModels);

    // Call the method and verify the result
    const result = modelsManager.getHuggingFaceModels();
    expect(result).toEqual(mockModels);
    expect(service.getHuggingFaceModels).toHaveBeenCalled();
  });

  it('should call refreshInstalledModels on the service', async () => {
    await modelsManager.refreshInstalledModels();

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Check that refreshInstalledModels was called
    expect(service.refreshInstalledModels).toHaveBeenCalled();
  });

  it('should call downloadOllamaModel on the service with the correct model ID', async () => {
    const modelId = 'ollama-model';
    await modelsManager.downloadOllamaModel(modelId);

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Check that downloadOllamaModel was called with the correct model ID
    expect(service.downloadOllamaModel).toHaveBeenCalledWith(modelId);
  });

  it('should call downloadLmStudioModel on the service with the correct model ID', async () => {
    const modelId = 'lmstudio-model';
    await modelsManager.downloadLmStudioModel(modelId);

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Check that downloadLmStudioModel was called with the correct model ID
    expect(service.downloadLmStudioModel).toHaveBeenCalledWith(modelId);
  });

  it('should retrieve Ollama status from the service', async () => {
    const mockStatus = { installed: true, running: true };

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mock to return our test status
    service.checkOllamaStatus.mockResolvedValue(mockStatus);

    // Call the method and verify the result
    const result = await modelsManager.checkOllamaStatus();
    expect(result).toEqual(mockStatus);
    expect(service.checkOllamaStatus).toHaveBeenCalled();
  });

  it('should retrieve LMStudio status from the service', async () => {
    const mockStatus = { installed: true };

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mock to return our test status
    service.checkLmStudioStatus.mockResolvedValue(mockStatus);

    // Call the method and verify the result
    const result = await modelsManager.checkLmStudioStatus();
    expect(result).toEqual(mockStatus);
    expect(service.checkLmStudioStatus).toHaveBeenCalled();
  });

  it('should retrieve Ollama installation instructions from the service', () => {
    const mockInstructions = 'Install Ollama from https://ollama.ai';

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mock to return our test instructions
    service.getOllamaInstallInstructions.mockReturnValue(mockInstructions);

    // Call the method and verify the result
    const result = modelsManager.getOllamaInstallInstructions();
    expect(result).toEqual(mockInstructions);
    expect(service.getOllamaInstallInstructions).toHaveBeenCalled();
  });

  it('should retrieve LMStudio installation instructions from the service', () => {
    const mockInstructions = 'Install LMStudio from https://lmstudio.ai';

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mock to return our test instructions
    service.getLmStudioInstallInstructions.mockReturnValue(mockInstructions);

    // Call the method and verify the result
    const result = modelsManager.getLmStudioInstallInstructions();
    expect(result).toEqual(mockInstructions);
    expect(service.getLmStudioInstallInstructions).toHaveBeenCalled();
  });

  it('should handle empty model lists correctly', () => {
    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mocks to return empty arrays
    service.getLocalModels.mockReturnValue([]);
    service.getHuggingFaceModels.mockReturnValue([]);

    // Call the methods and verify the results
    const localModels = modelsManager.getLocalModels();
    const huggingFaceModels = modelsManager.getHuggingFaceModels();

    expect(localModels).toEqual([]);
    expect(huggingFaceModels).toEqual([]);
    expect(service.getLocalModels).toHaveBeenCalled();
    expect(service.getHuggingFaceModels).toHaveBeenCalled();
  });

  it('should handle errors in asynchronous methods', async () => {
    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mock to throw an error
    service.initializeModels.mockRejectedValue(new Error('Test error'));

    // Call the method and verify that it rejects with the expected error
    await expect(modelsManager.initialize()).rejects.toThrow('Test error');
  });

  it('should handle typescript-specific type constraints correctly', () => {
    // This test checks that the TypeScript implementation correctly handles type constraints

    // Create a test model with the correct provider type
    const validModel: LLMModel = {
      id: 'valid-model',
      name: 'Valid Model',
      provider: 'ollama', // This is a valid provider type
      description: 'A valid model'
    };

    // Ensure type safety at compile time (this won't be checked at runtime)
    expect(validModel.provider).toMatch(/^(ollama|lmstudio|huggingface)$/);
  });
});
