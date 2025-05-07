import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as vscode from 'vscode';
import { ConfigManager, CopilotPPAConfig } from '../../../src/config';

jest.mock('vscode', () => ({
  workspace: {
    getConfiguration: jest.fn(),
    onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() }),
  },
  EventEmitter: jest.fn().mockImplementation(() => ({
    event: jest.fn(),
    fire: jest.fn(),
    dispose: jest.fn(),
  })),
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3,
  },
}));

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let mockContext: vscode.ExtensionContext;
  let mockConfig: any;
  let mockWorkspaceConfig: any;
  let mockConfigGet: jest.Mock;
  let mockConfigUpdate: jest.Mock;
  let mockEventEmitter: jest.Mock;
  let mockFire: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock context
    mockContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    // Mock config get and update methods
    mockConfigGet = jest.fn().mockImplementation((key: string, defaultValue: any) => {
      if (key === 'llm.provider') return 'ollama';
      if (key === 'llm.modelId') return 'llama2';
      if (key === 'llm.endpoint') return 'http://localhost:11434';
      if (key === 'llm.maxTokens') return 2048;
      if (key === 'llm.temperature') return 0.7;
      if (key === 'enableTelemetry') return true;
      if (key === 'debugLogging') return false;
      if (key === 'showStatusBar') return true;
      if (key === 'analysisThreshold') return 500;
      if (key === 'integrationFeatures.copilotEnabled') return true;
      if (key === 'integrationFeatures.vscodeProfileEnabled') return false;
      if (key === 'integrationFeatures.perfDataCollection') return true;
      if (key === 'defaultProvider') return 'ollama';
      return defaultValue;
    });

    mockConfigUpdate = jest.fn().mockResolvedValue(undefined);

    mockWorkspaceConfig = {
      get: mockConfigGet,
      update: mockConfigUpdate,
      has: jest.fn().mockReturnValue(true),
    };

    mockConfig = mockWorkspaceConfig;

    (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

    // Mock EventEmitter
    mockFire = jest.fn();
    mockEventEmitter = jest.fn().mockImplementation(() => ({
      event: jest.fn(),
      fire: mockFire,
      dispose: jest.fn(),
    }));

    (vscode.EventEmitter as unknown as jest.Mock) = mockEventEmitter;

    // Create the ConfigManager instance
    configManager = new ConfigManager(mockContext);
  });

  afterEach(() => {
    configManager.dispose();
  });

  test('initialize() should validate and register default configuration', async () => {
    await configManager.initialize();

    expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('copilot-ppa');
    expect(mockWorkspaceConfig.has).toHaveBeenCalledWith('defaultProvider');
  });

  test('getConfig() should return a copy of the current configuration', () => {
    const config = configManager.getConfig();

    expect(config).not.toBe(configManager['_currentConfig']);
    expect(config).toEqual(configManager['_currentConfig']);

    // Verify all expected properties are present in the config
    expect(config.llm.provider).toBe('ollama');
    expect(config.llm.modelId).toBe('llama2');
    expect(config.llm.endpoint).toBe('http://localhost:11434');
    expect(config.llm.maxTokens).toBe(2048);
    expect(config.llm.temperature).toBe(0.7);
    expect(config.enableTelemetry).toBe(true);
    expect(config.debugLogging).toBe(false);
    expect(config.showStatusBar).toBe(true);
    expect(config.analysisThreshold).toBe(500);
    expect(config.integrationFeatures.copilotEnabled).toBe(true);
    expect(config.integrationFeatures.vscodeProfileEnabled).toBe(false);
    expect(config.integrationFeatures.perfDataCollection).toBe(true);
    expect(config.defaultProvider).toBe('ollama');
  });

  test('updateConfig() should update configuration value', async () => {
    await configManager.updateConfig('llm.provider', 'newProvider');

    expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('copilot-ppa');
    expect(mockConfigUpdate).toHaveBeenCalledWith('llm.provider', 'newProvider', vscode.ConfigurationTarget.Global);
  });

  test('validateAnalysisThreshold() should clamp values to valid range', () => {
    expect(configManager['validateAnalysisThreshold'](50)).toBe(100);  // Below min
    expect(configManager['validateAnalysisThreshold'](500)).toBe(500);  // Within range
    expect(configManager['validateAnalysisThreshold'](15000)).toBe(10000);  // Above max
  });

  test('validateLLMConfig() should normalize LLM configuration', () => {
    const invalidConfig = {
      provider: 'test',
      modelId: 'model',
      endpoint: 'invalid-url',
      maxTokens: 10000,  // Above max
      temperature: 3.0,  // Above max
    };

    const validatedConfig = configManager['validateLLMConfig'](invalidConfig);

    expect(validatedConfig.maxTokens).toBe(8192);  // Clamped to max
    expect(validatedConfig.temperature).toBe(2.0);  // Clamped to max
    expect(validatedConfig.endpoint).toBe('http://localhost:11434');  // Fallback to default
  });

  test('validateEndpoint() should return valid URL or fallback to default', () => {
    expect(configManager['validateEndpoint']('http://valid-url.com')).toBe('http://valid-url.com');
    expect(configManager['validateEndpoint']('invalid-url')).toBe('http://localhost:11434');
  });

  test('mergeWithDefaults() should combine user config with defaults', () => {
    // Mock partial configuration
    mockConfigGet.mockImplementation((key: string, defaultValue: any) => {
      if (key === 'llm.provider') return 'custom-provider';
      if (key === 'debugLogging') return true;
      return defaultValue;
    });

    const mergedConfig = configManager['mergeWithDefaults'](mockWorkspaceConfig);

    // Check custom values
    expect(mergedConfig.llm.provider).toBe('custom-provider');
    expect(mergedConfig.debugLogging).toBe(true);

    // Check default values for properties not in user config
    expect(mergedConfig.llm.modelId).toBe('llama2');
    expect(mergedConfig.enableTelemetry).toBe(true);
  });

  test('setupConfigChangeListener() should listen for configuration changes', () => {
    // This method is called in the constructor, so we verify it was set up correctly
    expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalled();
    expect(mockContext.subscriptions.length).toBe(1);

    // Simulate configuration change event
    const mockEvent = {
      affectsConfiguration: jest.fn().mockReturnValue(true)
    };

    const changeListener = (vscode.workspace.onDidChangeConfiguration as jest.Mock).mock.calls[0][0];

    // Temporarily replace loadConfig to return a modified config
    const originalLoadConfig = configManager['loadConfig'];
    configManager['loadConfig'] = jest.fn().mockReturnValue({
      ...configManager['_currentConfig'],
      debugLogging: !configManager['_currentConfig'].debugLogging
    });

    // Trigger the listener
    changeListener(mockEvent);

    // Restore original method
    configManager['loadConfig'] = originalLoadConfig;

    // Verify event was fired with the changed property
    expect(mockFire).toHaveBeenCalledWith(expect.objectContaining({
      key: 'debugLogging',
      source: vscode.ConfigurationTarget.Global
    }));
  });

  test('validateAndUpdateConfig() should update invalid configuration values', async () => {
    // Set up a scenario where the user has invalid config values
    const originalGetConfig = configManager.getConfig;
    configManager.getConfig = jest.fn().mockReturnValue({
      ...configManager['_currentConfig'],
      analysisThreshold: 50,  // Below minimum
      llm: {
        ...configManager['_currentConfig'].llm,
        maxTokens: 10000,  // Above maximum
        temperature: 3.0,  // Above maximum
        endpoint: 'invalid-url'
      }
    });

    await configManager['validateAndUpdateConfig']();

    // Restore original method
    configManager.getConfig = originalGetConfig;

    // Verify all invalid values were updated
    expect(mockConfigUpdate).toHaveBeenCalledWith('analysisThreshold', expect.any(Number), expect.any(Number));
    expect(mockConfigUpdate).toHaveBeenCalledWith('llm.maxTokens', expect.any(Number), expect.any(Number));
    expect(mockConfigUpdate).toHaveBeenCalledWith('llm.temperature', expect.any(Number), expect.any(Number));
    expect(mockConfigUpdate).toHaveBeenCalledWith('llm.endpoint', expect.any(String), expect.any(Number));
  });

  test('registerConfigurationDefaults() should register defaults for missing properties', async () => {
    // Mock has() to return false to simulate a missing property
    mockWorkspaceConfig.has.mockReturnValueOnce(false);

    await configManager['registerConfigurationDefaults']();

    expect(mockWorkspaceConfig.has).toHaveBeenCalledWith('defaultProvider');
    expect(mockConfigUpdate).toHaveBeenCalledWith('defaultProvider', 'ollama', vscode.ConfigurationTarget.Global);
  });

  test('emitConfigChanges() should fire events for changed properties', () => {
    const oldConfig: CopilotPPAConfig = {
      ...configManager['_currentConfig'],
      debugLogging: false,
      llm: {
        ...configManager['_currentConfig'].llm,
        provider: 'old-provider'
      }
    };

    const newConfig: CopilotPPAConfig = {
      ...oldConfig,
      debugLogging: true,
      llm: {
        ...oldConfig.llm,
        provider: 'new-provider'
      }
    };

    configManager['emitConfigChanges'](oldConfig, newConfig);

    // Expect two events to be fired for the two changed properties
    expect(mockFire).toHaveBeenCalledTimes(2);
    expect(mockFire).toHaveBeenCalledWith(expect.objectContaining({
      key: 'debugLogging',
      value: true,
      source: vscode.ConfigurationTarget.Global
    }));
    expect(mockFire).toHaveBeenCalledWith(expect.objectContaining({
      key: 'llm',
      source: vscode.ConfigurationTarget.Global
    }));
  });

  test('dispose() should clean up resources', () => {
    const disposeMock = jest.fn();
    configManager['_configChangeHandler'] = { dispose: disposeMock } as unknown as vscode.Disposable;

    configManager.dispose();

    expect(disposeMock).toHaveBeenCalled();
    expect(configManager['_configChangeEmitter'].dispose).toHaveBeenCalled();
  });
});
