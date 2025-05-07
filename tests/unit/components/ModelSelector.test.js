const { beforeEach, describe, expect, jest, test, afterEach } = require('@jest/globals');
const vscode = require('vscode');
const { ModelSelector } = require('../../../../src/components/ModelSelector');
const { LLMConnectionManager } = require('../../../../src/services/LLMConnectionManager');

jest.mock('vscode', () => ({
  window: {
    createStatusBarItem: jest.fn().mockReturnValue({
      show: jest.fn(),
      hide: jest.fn(),
      text: '',
      command: null
    }),
    showQuickPick: jest.fn()
  },
  StatusBarAlignment: {
    Right: 1
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined)
    })
  }
}));

jest.mock('../../../../src/services/LLMConnectionManager', () => ({
  LLMConnectionManager: {
    getInstance: jest.fn().mockReturnValue({
      reconnect: jest.fn().mockResolvedValue(undefined)
    })
  }
}));

// Mock global fetch
global.fetch = jest.fn();

describe('ModelSelector', () => {
  let modelSelector;
  let mockStatusBarItem;
  let mockConfiguration;
  let mockConfigurationGet;
  let mockConfigurationUpdate;
  let mockShowQuickPick;
  let mockReconnect;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock returns
    mockStatusBarItem = {
      show: jest.fn(),
      hide: jest.fn(),
      text: '',
      command: null
    };

    vscode.window.createStatusBarItem.mockReturnValue(mockStatusBarItem);

    mockConfigurationGet = jest.fn().mockReturnValue('');
    mockConfigurationUpdate = jest.fn().mockResolvedValue(undefined);
    mockConfiguration = {
      get: mockConfigurationGet,
      update: mockConfigurationUpdate
    };
    vscode.workspace.getConfiguration.mockReturnValue(mockConfiguration);

    mockShowQuickPick = jest.fn();
    vscode.window.showQuickPick = mockShowQuickPick;

    mockReconnect = jest.fn().mockResolvedValue(undefined);
    LLMConnectionManager.getInstance.mockReturnValue({
      reconnect: mockReconnect
    });

    // Reset fetch mock
    global.fetch.mockReset();

    // Get the ModelSelector instance
    // We need to use the getInstance method since it's a singleton
    ModelSelector.instance = undefined; // Reset singleton
    modelSelector = ModelSelector.getInstance();
  });

  afterEach(() => {
    // Cleanup
    ModelSelector.instance = undefined;
  });

  test('should create a status bar item when instantiated', () => {
    expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
      vscode.StatusBarAlignment.Right,
      98
    );
    expect(mockStatusBarItem.command).toBe('copilot-ppa.selectModel');
  });

  test('getInstance should return the same instance on multiple calls', () => {
    const instance1 = ModelSelector.getInstance();
    const instance2 = ModelSelector.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(modelSelector);
  });

  test('initialize should load model from configuration', async () => {
    mockConfigurationGet.mockReturnValue('testModel');

    await modelSelector.initialize();

    expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('copilot-ppa');
    expect(mockConfigurationGet).toHaveBeenCalledWith('model', '');
    expect(mockStatusBarItem.text).toBe('$(symbol-enum) Model: testModel');
    expect(mockStatusBarItem.show).toHaveBeenCalled();
  });

  test('initialize should handle empty model name', async () => {
    mockConfigurationGet.mockReturnValue('');

    await modelSelector.initialize();

    expect(mockStatusBarItem.text).toBe('$(symbol-enum) Model: Not Selected');
  });

  test('promptModelSelection should show quick pick with available models', async () => {
    const mockModels = ['model1', 'model2', 'model3'];
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ models: mockModels })
    };
    global.fetch.mockResolvedValue(mockResponse);
    mockShowQuickPick.mockResolvedValue('model2');

    await modelSelector.promptModelSelection();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    expect(mockShowQuickPick).toHaveBeenCalledWith(mockModels, {
      placeHolder: 'Select an LLM model',
      title: 'Model Selection'
    });

    // Should call setModel with selected model
    expect(mockConfigurationUpdate).toHaveBeenCalledWith('model', 'model2', true);
    expect(mockStatusBarItem.text).toBe('$(symbol-enum) Model: model2');
    expect(LLMConnectionManager.getInstance).toHaveBeenCalled();
    expect(mockReconnect).toHaveBeenCalled();
  });

  test('promptModelSelection should do nothing when no model is selected', async () => {
    const mockModels = ['model1', 'model2', 'model3'];
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ models: mockModels })
    };
    global.fetch.mockResolvedValue(mockResponse);
    mockShowQuickPick.mockResolvedValue(undefined);

    await modelSelector.promptModelSelection();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    expect(mockShowQuickPick).toHaveBeenCalledWith(mockModels, {
      placeHolder: 'Select an LLM model',
      title: 'Model Selection'
    });

    // Should not call setModel when no model selected
    expect(mockConfigurationUpdate).not.toHaveBeenCalled();
    expect(LLMConnectionManager.getInstance).not.toHaveBeenCalled();
    expect(mockReconnect).not.toHaveBeenCalled();
  });

  test('getAvailableModels should fetch models from Ollama API', async () => {
    const mockModels = ['model1', 'model2', 'model3'];
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ models: mockModels })
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await modelSelector.getAvailableModels();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    expect(result).toEqual(mockModels);
  });

  test('getAvailableModels should handle API errors with fallback models', async () => {
    global.fetch.mockRejectedValue(new Error('Failed to connect'));

    const result = await modelSelector.getAvailableModels();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    expect(result).toEqual(['codellama', 'llama2', 'mistral']);
  });

  test('setModel should update configuration and reconnect', async () => {
    await modelSelector.setModel('testModel');

    expect(mockConfigurationUpdate).toHaveBeenCalledWith('model', 'testModel', true);
    expect(mockStatusBarItem.text).toBe('$(symbol-enum) Model: testModel');
    expect(LLMConnectionManager.getInstance).toHaveBeenCalled();
    expect(mockReconnect).toHaveBeenCalled();
  });

  test('updateStatusBarItem should display current model', () => {
    modelSelector.currentModel = 'currentTestModel';

    modelSelector.updateStatusBarItem();

    expect(mockStatusBarItem.text).toBe('$(symbol-enum) Model: currentTestModel');
    expect(mockStatusBarItem.show).toHaveBeenCalled();
  });

  test('updateStatusBarItem should handle empty model name', () => {
    modelSelector.currentModel = '';

    modelSelector.updateStatusBarItem();

    expect(mockStatusBarItem.text).toBe('$(symbol-enum) Model: Not Selected');
    expect(mockStatusBarItem.show).toHaveBeenCalled();
  });
});
