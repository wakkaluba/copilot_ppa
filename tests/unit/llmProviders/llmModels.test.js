/**
 * Tests for the LLM Models Manager (JavaScript)
 */

const { describe, expect, it, jest, beforeEach, afterEach } = require('@jest/globals');
const vscode = require('vscode');
const { LLMModelsManager } = require('../../../src/llmProviders/llmModels');

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

describe('LLMModelsManager (JavaScript)', () => {
  let extensionContext;
  let modelsManager;

  beforeEach(() => {
    // Create a mock extension context
    extensionContext = {
      subscriptions: [],
      extensionPath: '/path/to/extension',
      extensionUri: { fsPath: '/path/to/extension' },
      asAbsolutePath: jest.fn().mockImplementation(relativePath => `/path/to/extension/${relativePath}`),
      storagePath: '/path/to/storage',
      storageUri: { fsPath: '/path/to/storage' },
      globalState: {
        get: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        setKeysForSync: jest.fn(),
        keys: jest.fn().mockReturnValue([])
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        keys: jest.fn().mockReturnValue([])
      },
      secrets: {
        get: jest.fn(),
        store: jest.fn(),
        delete: jest.fn()
      },
      extensionMode: 1, // Test mode
      logPath: '/path/to/logs',
      logUri: { fsPath: '/path/to/logs' },
      environmentVariableCollection: {},
      globalStorageUri: { fsPath: '/path/to/global-storage' },
      globalStoragePath: '/path/to/global-storage',
      workspaceStorageUri: { fsPath: '/path/to/workspace-storage' },
      workspaceStoragePath: '/path/to/workspace-storage',
      storageDatabase: {},
      extension: {},
      extensionKind: 1, // UI
      extensionLocation: { fsPath: '/path/to/extension-location' },
      accessKey: '',
      extendedState: {},
      extensionRuntime: {}
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
    const mockModels = [
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
    const mockModels = [
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

  it('should handle dynamic properties and type coercion in JavaScript', () => {
    // This test checks JavaScript-specific behaviors like adding properties on the fly
    const manager = new LLMModelsManager(extensionContext);

    // In JavaScript, we can add properties dynamically
    manager.customProperty = 'custom value';
    expect(manager.customProperty).toBe('custom value');

    // Test type coercion (JavaScript specific)
    const mockModels = [
      {
        id: 123, // Number instead of string, should still work in JS
        name: 'Model 1',
        provider: 'ollama',
        description: 'A test model'
      }
    ];

    // Get the mock service instance
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mock to return our test model with number ID
    service.getLocalModels.mockReturnValue(mockModels);

    // Call the method and verify the result
    const result = modelsManager.getLocalModels();
    expect(result).toEqual(mockModels);
    expect(result[0].id).toBe(123); // In JS, this is fine
  });

  it('should handle null and undefined in JavaScript context', async () => {
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // Set up the mock to return null/undefined
    service.getLocalModels.mockReturnValue(null);
    service.getHuggingFaceModels.mockReturnValue(undefined);

    // In JavaScript, methods should handle null and undefined gracefully
    expect(() => modelsManager.getLocalModels()).not.toThrow();
    expect(() => modelsManager.getHuggingFaceModels()).not.toThrow();

    // JavaScript-specific: undefined vs null behavior
    expect(modelsManager.getLocalModels()).toBeNull();
    expect(modelsManager.getHuggingFaceModels()).toBeUndefined();
  });

  it('should support JavaScript prototypal inheritance', () => {
    // This test verifies JavaScript-specific prototypal inheritance

    // Add a method to the prototype
    LLMModelsManager.prototype.testMethod = function() {
      return 'test result';
    };

    // Create a new instance
    const newManager = new LLMModelsManager(extensionContext);

    // The method should be available on the instance
    expect(newManager.testMethod()).toBe('test result');

    // The method should also be available on our existing instance
    expect(modelsManager.testMethod()).toBe('test result');

    // Clean up to not affect other tests
    delete LLMModelsManager.prototype.testMethod;
  });

  it('should handle missing or unexpected parameters gracefully in JavaScript', async () => {
    // JavaScript is more forgiving with missing parameters

    // Call methods with missing parameters
    // This would fail in TypeScript but should not throw in JavaScript
    await expect(modelsManager.downloadOllamaModel()).resolves.not.toThrow();
    await expect(modelsManager.downloadLmStudioModel()).resolves.not.toThrow();

    // Get the mock service instance to verify calls
    const service = require('../../../src/llmProviders/services/LLMModelsService').LLMModelsService.mock.instances[0];

    // The methods should have been called with undefined
    expect(service.downloadOllamaModel).toHaveBeenCalledWith(undefined);
    expect(service.downloadLmStudioModel).toHaveBeenCalledWith(undefined);
  });
});
