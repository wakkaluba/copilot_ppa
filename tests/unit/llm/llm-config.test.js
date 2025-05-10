const { afterEach, beforeEach, describe, expect, jest, test } = require('@jest/globals');
const vscode = require('vscode');
const { ConfigManager } = require('../../../src/config');

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

describe('LLM Configuration Tests', () => {
  let configManager;
  let mockContext;
  let mockConfig;
  let mockWorkspaceConfig;
  let mockConfigGet;
  let mockConfigUpdate;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock context
    mockContext = {
      subscriptions: [],
    };

    // Mock config get and update methods
    mockConfigGet = jest.fn().mockImplementation((key, defaultValue) => {
      if (key === 'llm.provider') return 'ollama';
      if (key === 'llm.modelId') return 'llama2';
      if (key === 'llm.endpoint') return 'http://localhost:11434';
      if (key === 'llm.maxTokens') return 2048;
      if (key === 'llm.temperature') return 0.7;
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

    vscode.workspace.getConfiguration.mockReturnValue(mockConfig);

    // Create the ConfigManager instance
    configManager = new ConfigManager(mockContext);
  });

  afterEach(() => {
    configManager.dispose();
  });

  describe('LLM Provider Configuration', () => {
    test('should accept valid provider types', () => {
      // Test valid built-in providers
      mockConfigGet.mockImplementation((key, defaultValue) => {
        if (key === 'llm.provider') return 'ollama';
        return defaultValue;
      });
      let config = configManager.getConfig();
      expect(config.llm.provider).toBe('ollama');

      mockConfigGet.mockImplementation((key, defaultValue) => {
        if (key === 'llm.provider') return 'lmstudio';
        return defaultValue;
      });
      configManager = new ConfigManager(mockContext);
      config = configManager.getConfig();
      expect(config.llm.provider).toBe('lmstudio');

      mockConfigGet.mockImplementation((key, defaultValue) => {
        if (key === 'llm.provider') return 'huggingface';
        return defaultValue;
      });
      configManager = new ConfigManager(mockContext);
      config = configManager.getConfig();
      expect(config.llm.provider).toBe('huggingface');

      // Test custom provider string
      mockConfigGet.mockImplementation((key, defaultValue) => {
        if (key === 'llm.provider') return 'custom-provider';
        return defaultValue;
      });
      configManager = new ConfigManager(mockContext);
      config = configManager.getConfig();
      expect(config.llm.provider).toBe('custom-provider');
    });

    test('should handle default provider configuration', async () => {
      // Test default provider is synchronized
      mockConfigGet.mockImplementation((key, defaultValue) => {
        if (key === 'llm.provider') return 'ollama';
        if (key === 'defaultProvider') return undefined;
        return defaultValue;
      });
      mockWorkspaceConfig.has.mockReturnValue(false);

      configManager = new ConfigManager(mockContext);
      await configManager.initialize();

      expect(mockWorkspaceConfig.has).toHaveBeenCalledWith('defaultProvider');
      expect(mockConfigUpdate).toHaveBeenCalledWith('defaultProvider', 'ollama', vscode.ConfigurationTarget.Global);
    });
  });

  describe('LLM Endpoint Configuration', () => {
    test('should accept valid URL endpoints', () => {
      const validEndpoints = [
        'http://localhost:11434',
        'https://api.example.com/v1',
        'http://127.0.0.1:8080/api',
        'https://subdomain.example.com:8443/llm'
      ];

      for (const endpoint of validEndpoints) {
        expect(configManager.validateEndpoint(endpoint)).toBe(endpoint);
      }
    });

    test('should reject and replace invalid URL endpoints', () => {
      const invalidEndpoints = [
        'not-a-url',
        'ftp://invalid-protocol.com',
        '://missing-protocol.com',
        'http:/missing-slash.com'
      ];

      for (const endpoint of invalidEndpoints) {
        expect(configManager.validateEndpoint(endpoint)).toBe('http://localhost:11434');
      }
    });

    test('should update endpoint in configuration when invalid', async () => {
      // Set up a scenario with an invalid endpoint
      const originalGetConfig = configManager.getConfig;
      configManager.getConfig = jest.fn().mockReturnValue({
        ...configManager._currentConfig,
        llm: {
          ...configManager._currentConfig.llm,
          endpoint: 'invalid-url'
        }
      });

      // Mock current config to have a valid endpoint
      configManager._currentConfig = {
        ...configManager._currentConfig,
        llm: {
          ...configManager._currentConfig.llm,
          endpoint: 'http://localhost:11434'
        }
      };

      await configManager.validateAndUpdateConfig();

      // Restore original method
      configManager.getConfig = originalGetConfig;

      // Verify the endpoint was updated
      expect(mockConfigUpdate).toHaveBeenCalledWith('llm.endpoint', 'http://localhost:11434', expect.any(Number));
    });
  });

  describe('LLM Parameter Validation', () => {
    test('should clamp maxTokens to valid range', () => {
      const testCases = [
        { input: 0, expected: 1 },       // Below min
        { input: -100, expected: 1 },    // Negative
        { input: 2048, expected: 2048 }, // Within range
        { input: 9000, expected: 8192 }  // Above max
      ];

      for (const { input, expected } of testCases) {
        const result = configManager.validateLLMConfig({
          provider: 'test',
          modelId: 'model',
          endpoint: 'http://localhost:11434',
          maxTokens: input,
          temperature: 0.7
        });
        expect(result.maxTokens).toBe(expected);
      }
    });

    test('should clamp temperature to valid range', () => {
      const testCases = [
        { input: -0.5, expected: 0 },    // Below min
        { input: 0, expected: 0 },       // Min boundary
        { input: 0.7, expected: 0.7 },   // Within range
        { input: 2, expected: 2 },       // Max boundary
        { input: 3.5, expected: 2 }      // Above max
      ];

      for (const { input, expected } of testCases) {
        const result = configManager.validateLLMConfig({
          provider: 'test',
          modelId: 'model',
          endpoint: 'http://localhost:11434',
          maxTokens: 2048,
          temperature: input
        });
        expect(result.temperature).toBe(expected);
      }
    });

    test('should validate the complete LLM configuration object', () => {
      const invalidConfig = {
        provider: 'test-provider',
        modelId: 'invalid-model',
        endpoint: 'not-a-url',
        maxTokens: 10000,
        temperature: 3.0
      };

      const validatedConfig = configManager.validateLLMConfig(invalidConfig);

      // All invalid values should be corrected
      expect(validatedConfig).toEqual({
        provider: 'test-provider',      // Unchanged
        modelId: 'invalid-model',       // Unchanged
        endpoint: 'http://localhost:11434', // Corrected
        maxTokens: 8192,                // Clamped
        temperature: 2.0                // Clamped
      });
    });

    test('should update all invalid LLM parameters in configuration', async () => {
      // Set up a scenario with invalid LLM parameters
      const originalGetConfig = configManager.getConfig;
      configManager.getConfig = jest.fn().mockReturnValue({
        ...configManager._currentConfig,
        llm: {
          provider: 'test',
          modelId: 'model',
          endpoint: 'invalid-url',
          maxTokens: 10000,
          temperature: 3.0
        }
      });

      // Set valid values in current config
      configManager._currentConfig = {
        ...configManager._currentConfig,
        llm: {
          provider: 'test',
          modelId: 'model',
          endpoint: 'http://localhost:11434',
          maxTokens: 8192,
          temperature: 2.0
        }
      };

      await configManager.validateAndUpdateConfig();

      // Restore original method
      configManager.getConfig = originalGetConfig;

      // Verify all invalid parameters were updated
      expect(mockConfigUpdate).toHaveBeenCalledWith('llm.maxTokens', 8192, expect.any(Number));
      expect(mockConfigUpdate).toHaveBeenCalledWith('llm.temperature', 2.0, expect.any(Number));
      expect(mockConfigUpdate).toHaveBeenCalledWith('llm.endpoint', 'http://localhost:11434', expect.any(Number));
    });
  });

  describe('LLM Configuration Changes', () => {
    test('should emit events when LLM configuration changes', () => {
      const mockFire = jest.fn();
      configManager._configChangeEmitter.fire = mockFire;

      const oldConfig = {
        ...configManager._currentConfig,
        llm: {
          provider: 'ollama',
          modelId: 'llama2',
          endpoint: 'http://localhost:11434',
          maxTokens: 2048,
          temperature: 0.7
        }
      };

      const newConfig = {
        ...oldConfig,
        llm: {
          ...oldConfig.llm,
          provider: 'lmstudio',
          modelId: 'vicuna',
          temperature: 0.9
        }
      };

      configManager.emitConfigChanges(oldConfig, newConfig);

      // Should emit an event for the llm property
      expect(mockFire).toHaveBeenCalledWith(expect.objectContaining({
        key: 'llm',
        value: newConfig.llm,
        source: vscode.ConfigurationTarget.Global
      }));
    });

    test('should react to LLM configuration updates made through VS Code', async () => {
      const mockFire = jest.fn();
      configManager._configChangeEmitter.fire = mockFire;

      // Save original config
      const originalConfig = configManager._currentConfig;

      // Create a modified config
      const modifiedConfig = {
        ...originalConfig,
        llm: {
          ...originalConfig.llm,
          provider: 'lmstudio',
          modelId: 'mistral'
        }
      };

      // Mock the loadConfig method to return our modified config
      const originalLoadConfig = configManager.loadConfig;
      configManager.loadConfig = jest.fn().mockReturnValue(modifiedConfig);

      // Simulate configuration change
      const mockEvent = { affectsConfiguration: jest.fn().mockReturnValue(true) };
      const changeListener = vscode.workspace.onDidChangeConfiguration.mock.calls[0][0];
      changeListener(mockEvent);

      // Restore original method
      configManager.loadConfig = originalLoadConfig;

      // Verify event was fired with the changed property
      expect(mockFire).toHaveBeenCalledWith(expect.objectContaining({
        key: 'llm',
        value: modifiedConfig.llm,
        source: vscode.ConfigurationTarget.Global
      }));

      // Also test direct updating
      await configManager.updateConfig('llm.provider', 'huggingface');
      expect(mockConfigUpdate).toHaveBeenCalledWith('llm.provider', 'huggingface', vscode.ConfigurationTarget.Global);
    });
  });

  // JavaScript-specific tests
  describe('JavaScript-specific LLM Configuration Handling', () => {
    test('should handle null or undefined LLM configuration values', () => {
      const nullConfig = {
        provider: null,
        modelId: undefined,
        endpoint: null,
        maxTokens: null,
        temperature: undefined
      };

      const validatedConfig = configManager.validateLLMConfig(nullConfig);

      // Should substitute default values for null/undefined
      expect(validatedConfig.endpoint).toBe('http://localhost:11434');
      expect(validatedConfig.maxTokens).toBe(1);  // Min value
      expect(validatedConfig.temperature).toBe(0);  // Min value
      expect(validatedConfig.provider).toBe(null);  // Unchanged
      expect(validatedConfig.modelId).toBe(undefined);  // Unchanged
    });

    test('should handle non-numeric temperature and maxTokens values', () => {
      const nonNumericConfig = {
        provider: 'test',
        modelId: 'model',
        endpoint: 'http://localhost:11434',
        maxTokens: '1000',  // String instead of number
        temperature: '0.5'  // String instead of number
      };

      const validatedConfig = configManager.validateLLMConfig(nonNumericConfig);

      // Should convert string values to numbers
      expect(validatedConfig.maxTokens).toBe(1000);
      expect(validatedConfig.temperature).toBe(0.5);
    });

    test('should handle missing properties in LLM configuration', () => {
      const incompleteConfig = {
        provider: 'test',
        modelId: 'model',
        // Missing endpoint, maxTokens, and temperature
      };

      const validatedConfig = configManager.validateLLMConfig(incompleteConfig);

      // Should set default values for missing properties
      expect(validatedConfig.endpoint).toBe('http://localhost:11434');
      expect(validatedConfig.maxTokens).toBe(1);  // Min value when missing
      expect(validatedConfig.temperature).toBe(0);  // Min value when missing
    });
  });
});
