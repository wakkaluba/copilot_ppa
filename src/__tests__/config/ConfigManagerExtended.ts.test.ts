import * as vscode from 'vscode';
import { ConfigChangeEvent, ConfigManager, CopilotPPAConfig } from '../../config';

// Mock VS Code API
jest.mock('vscode', () => {
    const mockEventEmitter = {
        event: jest.fn(),
        fire: jest.fn(),
        dispose: jest.fn()
    };

    const mockConfig = {
        get: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        has: jest.fn()
    };

    return {
        EventEmitter: jest.fn(() => mockEventEmitter),
        workspace: {
            getConfiguration: jest.fn().mockReturnValue(mockConfig),
            onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() })
        },
        ConfigurationTarget: {
            Global: 1,
            Workspace: 2,
            WorkspaceFolder: 3
        }
    };
});

describe('ConfigManager Extended TypeScript Tests', () => {
    let configManager: ConfigManager;
    let mockContext: vscode.ExtensionContext;
    let mockConfig: any;
    let mockEventEmitter: vscode.EventEmitter<ConfigChangeEvent>;
    let mockListener: jest.Mock;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock context
        mockContext = {
            subscriptions: [],
            workspaceState: {
                get: jest.fn(),
                update: jest.fn()
            } as any,
            globalState: {
                get: jest.fn(),
                update: jest.fn()
            } as any,
            extensionPath: '/test/extension/path',
            asAbsolutePath: jest.fn(path => `/absolute/${path}`),
            storagePath: '/test/storage/path',
            globalStoragePath: '/test/global/storage/path',
            logPath: '/test/log/path',
        } as unknown as vscode.ExtensionContext;

        // Setup mock configuration
        mockConfig = (vscode.workspace.getConfiguration as jest.Mock)();
        mockConfig.get.mockImplementation((key: string, defaultValue: any) => {
            if (key === 'enableTelemetry') return true;
            if (key === 'debugLogging') return false;
            if (key === 'showStatusBar') return true;
            if (key === 'analysisThreshold') return 500;
            if (key === 'integrationFeatures.copilotEnabled') return true;
            if (key === 'integrationFeatures.vscodeProfileEnabled') return false;
            if (key === 'integrationFeatures.perfDataCollection') return true;
            if (key === 'llm.provider') return 'ollama';
            if (key === 'llm.modelId') return 'llama2';
            if (key === 'llm.endpoint') return 'http://localhost:11434';
            if (key === 'llm.maxTokens') return 2048;
            if (key === 'llm.temperature') return 0.7;
            if (key === 'defaultProvider') return 'ollama';
            return defaultValue;
        });

        // Setup event emitter
        mockEventEmitter = new (vscode.EventEmitter as any)();

        // Create a mock listener for onConfigChanged events
        mockListener = jest.fn();

        // Create instance of ConfigManager
        configManager = new ConfigManager(mockContext);

        // Manually wire up the event emitter for testing
        (configManager as any)._configChangeEmitter = mockEventEmitter;
        configManager.onConfigChanged(mockListener);
    });

    describe('Configuration Change Detection', () => {
        test('should detect and react to configuration changes', () => {
            // Simulate VS Code firing a configuration change event
            const mockChangeEvent = {
                affectsConfiguration: jest.fn().mockReturnValue(true)
            };

            // Get the change handler callback
            const changeHandler = (vscode.workspace.onDidChangeConfiguration as jest.Mock).mock.calls[0][0];

            // Call the handler to simulate a change event
            changeHandler(mockChangeEvent);

            // Verify that workspace configuration was checked
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('copilot-ppa');
        });

        test('should ignore changes that do not affect our extension', () => {
            // Simulate VS Code firing a configuration change event for a different extension
            const mockChangeEvent = {
                affectsConfiguration: jest.fn().mockReturnValue(false)
            };

            // Get the change handler callback
            const changeHandler = (vscode.workspace.onDidChangeConfiguration as jest.Mock).mock.calls[0][0];

            // Call the handler to simulate a change event
            changeHandler(mockChangeEvent);

            // Verify the handler didn't attempt to reload configuration
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledTimes(1); // Only from constructor
        });
    });

    describe('Configuration Validation Edge Cases', () => {
        test('should handle invalid configuration values correctly', () => {
            // Setup mock to return invalid values
            mockConfig.get.mockImplementation((key: string, defaultValue: any) => {
                if (key === 'analysisThreshold') return -100; // Invalid negative value
                if (key === 'llm.maxTokens') return 0; // Invalid zero value
                if (key === 'llm.temperature') return -0.5; // Invalid negative temperature
                if (key === 'llm.endpoint') return ''; // Empty endpoint
                return defaultValue;
            });

            // Load config with invalid values
            const config = (configManager as any).loadConfig();

            // Check that values were corrected
            expect(config.analysisThreshold).toBe(100); // Should be set to minimum
            expect(config.llm.maxTokens).toBe(1); // Should be set to minimum
            expect(config.llm.temperature).toBe(0); // Should be set to minimum
            expect(config.llm.endpoint).toBe('http://localhost:11434'); // Should be set to default
        });

        test('should handle extremely large values', () => {
            // Setup mock to return extremely large values
            mockConfig.get.mockImplementation((key: string, defaultValue: any) => {
                if (key === 'analysisThreshold') return 1000000; // Very large value
                if (key === 'llm.maxTokens') return 100000; // Very large value
                if (key === 'llm.temperature') return 100; // Very large value
                return defaultValue;
            });

            // Load config with extremely large values
            const config = (configManager as any).loadConfig();

            // Check that values were constrained
            expect(config.analysisThreshold).toBe(10000); // Should be set to maximum
            expect(config.llm.maxTokens).toBe(8192); // Should be set to maximum
            expect(config.llm.temperature).toBe(2); // Should be set to maximum
        });
    });

    describe('validateAndUpdateConfig', () => {
        test('should update invalid configurations to valid values', async () => {
            // Create a configuration with invalid values
            const invalidConfig = {
                analysisThreshold: 50000, // Too high
                llm: {
                    maxTokens: 10000, // Too high
                    temperature: 3, // Too high
                    endpoint: 'invalid-url'
                }
            } as Partial<CopilotPPAConfig>;

            // Mock getConfig to return our invalid config
            configManager.getConfig = jest.fn().mockReturnValue(invalidConfig as CopilotPPAConfig);

            // Run validation
            await (configManager as any).validateAndUpdateConfig();

            // Check that update was called with corrected values
            expect(mockConfig.update).toHaveBeenCalledWith('analysisThreshold', expect.any(Number), vscode.ConfigurationTarget.Global);
            expect(mockConfig.update).toHaveBeenCalledWith('llm.maxTokens', expect.any(Number), vscode.ConfigurationTarget.Global);
            expect(mockConfig.update).toHaveBeenCalledWith('llm.temperature', expect.any(Number), vscode.ConfigurationTarget.Global);
            expect(mockConfig.update).toHaveBeenCalledWith('llm.endpoint', expect.any(String), vscode.ConfigurationTarget.Global);
        });
    });

    describe('Configuration Change Notification', () => {
        test('should notify listeners when configuration changes', () => {
            // Setup the current config
            const oldConfig = (configManager as any)._currentConfig;

            // Create a new config with changes
            const newConfig = {
                ...oldConfig,
                debugLogging: !oldConfig.debugLogging,
                llm: {
                    ...oldConfig.llm,
                    modelId: 'different-model'
                }
            };

            // Manually invoke emitConfigChanges
            (configManager as any).emitConfigChanges(oldConfig, newConfig);

            // Verify that events were fired for each changed property
            expect(mockEventEmitter.fire).toHaveBeenCalledWith(expect.objectContaining({
                key: 'debugLogging',
                value: newConfig.debugLogging,
                source: vscode.ConfigurationTarget.Global
            }));

            expect(mockEventEmitter.fire).toHaveBeenCalledWith(expect.objectContaining({
                key: 'llm',
                value: newConfig.llm,
                source: vscode.ConfigurationTarget.Global
            }));
        });
    });

    describe('Error Handling', () => {
        test('should handle errors during configuration update', async () => {
            // Mock update to throw an error
            mockConfig.update.mockRejectedValueOnce(new Error('Update failed'));

            // Call update
            await expect(configManager.updateConfig('debugLogging', true))
                .rejects
                .toThrow('Update failed');

            // Verify update was attempted
            expect(mockConfig.update).toHaveBeenCalledWith('debugLogging', true, vscode.ConfigurationTarget.Global);
        });

        test('should handle non-string endpoint values', () => {
            // Test with various non-string values
            const validateEndpoint = (configManager as any).validateEndpoint.bind(configManager);

            expect(validateEndpoint(null)).toBe('http://localhost:11434');
            expect(validateEndpoint(undefined)).toBe('http://localhost:11434');
            expect(validateEndpoint(123)).toBe('http://localhost:11434');
            expect(validateEndpoint({})).toBe('http://localhost:11434');
        });
    });

    describe('Resource Management', () => {
        test('should register and dispose event handlers correctly', () => {
            // Verify that the configuration change listener was registered
            expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalled();
            expect(mockContext.subscriptions.length).toBe(1);

            // Mock the handler with a test disposable
            const mockDisposable = { dispose: jest.fn() };
            (configManager as any)._configChangeHandler = mockDisposable;

            // Dispose the manager
            configManager.dispose();

            // Verify the handler was disposed
            expect(mockDisposable.dispose).toHaveBeenCalled();
            expect(mockEventEmitter.dispose).toHaveBeenCalled();
        });
    });

    describe('Configuration Default Registration', () => {
        test('should register defaults when they don\'t exist', async () => {
            // Mock has to return false (indicating setting doesn't exist)
            mockConfig.has.mockReturnValue(false);

            // Call the method
            await (configManager as any).registerConfigurationDefaults();

            // Verify that update was called
            expect(mockConfig.update).toHaveBeenCalledWith(
                'defaultProvider',
                expect.any(String),
                vscode.ConfigurationTarget.Global
            );
        });

        test('should not register defaults when they already exist', async () => {
            // Mock has to return true (indicating setting already exists)
            mockConfig.has.mockReturnValue(true);

            // Call the method
            await (configManager as any).registerConfigurationDefaults();

            // Verify that update was not called
            expect(mockConfig.update).not.toHaveBeenCalled();
        });
    });
});

import { LLMConfig } from '../../config';

// Mock VS Code API
jest.mock('vscode', () => {
    const mockEventEmitter = {
        event: jest.fn(),
        fire: jest.fn(),
        dispose: jest.fn()
    };

    const mockConfig = {
        get: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        has: jest.fn().mockReturnValue(true)
    };

    return {
        EventEmitter: jest.fn(() => mockEventEmitter),
        workspace: {
            getConfiguration: jest.fn().mockReturnValue(mockConfig),
            onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() })
        },
        ConfigurationTarget: {
            Global: 1,
            Workspace: 2,
            WorkspaceFolder: 3
        }
    };
});

describe('ConfigManager Extended Tests', () => {
    let configManager: ConfigManager;
    let mockContext: vscode.ExtensionContext;
    let mockConfig: any;
    let mockEventEmitter: any;
    let configChangeHandler: jest.Mock;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock context
        mockContext = {
            subscriptions: [],
            workspaceState: {
                get: jest.fn(),
                update: jest.fn()
            },
            globalState: {
                get: jest.fn(),
                update: jest.fn()
            },
            extensionPath: '/test/extension/path',
            asAbsolutePath: jest.fn(path => `/absolute/${path}`),
            storagePath: '/test/storage/path',
            globalStoragePath: '/test/global/storage/path',
            logPath: '/test/log/path',
        } as unknown as vscode.ExtensionContext;

        // Setup mock configuration
        mockConfig = (vscode.workspace.getConfiguration as jest.Mock)();
        mockConfig.get.mockImplementation((key: string, defaultValue: any) => {
            if (key === 'enableTelemetry') return true;
            if (key === 'debugLogging') return false;
            if (key === 'showStatusBar') return true;
            if (key === 'analysisThreshold') return 500;
            if (key === 'integrationFeatures.copilotEnabled') return true;
            if (key === 'integrationFeatures.vscodeProfileEnabled') return false;
            if (key === 'integrationFeatures.perfDataCollection') return true;
            if (key === 'llm.provider') return 'ollama';
            if (key === 'llm.modelId') return 'llama2';
            if (key === 'llm.endpoint') return 'http://localhost:11434';
            if (key === 'llm.maxTokens') return 2048;
            if (key === 'llm.temperature') return 0.7;
            if (key === 'defaultProvider') return 'ollama';
            return defaultValue;
        });

        // Setup event emitter
        mockEventEmitter = new (vscode.EventEmitter as jest.Mock)();
        configChangeHandler = jest.fn();
        mockEventEmitter.event.mockReturnValue(configChangeHandler);

        // Create instance of ConfigManager
        configManager = new ConfigManager(mockContext);
        (configManager as any)._configChangeEmitter = mockEventEmitter;
    });

    describe('Configuration change notifications', () => {
        test('should notify about deep nested changes in objects', () => {
            const oldConfig: CopilotPPAConfig = {
                enableTelemetry: true,
                debugLogging: false,
                showStatusBar: true,
                analysisThreshold: 500,
                integrationFeatures: {
                    copilotEnabled: true,
                    vscodeProfileEnabled: false,
                    perfDataCollection: true,
                },
                llm: {
                    provider: 'ollama',
                    modelId: 'llama2',
                    endpoint: 'http://localhost:11434',
                    maxTokens: 2048,
                    temperature: 0.7,
                },
                defaultProvider: 'ollama',
            };

            const newConfig: CopilotPPAConfig = {
                ...oldConfig,
                llm: {
                    ...oldConfig.llm,
                    modelId: 'codellama',
                }
            };

            // Call the private emitConfigChanges method
            const emitConfigChanges = (configManager as any).emitConfigChanges.bind(configManager);
            emitConfigChanges(oldConfig, newConfig);

            // Should fire a change event for the llm object
            expect(mockEventEmitter.fire).toHaveBeenCalledTimes(1);
            expect(mockEventEmitter.fire).toHaveBeenCalledWith({
                key: 'llm',
                value: newConfig.llm,
                source: vscode.ConfigurationTarget.Global
            });
        });

        test('should handle configuration changes from workspace event', () => {
            // Get the configuration change handler
            const onDidChangeConfigHandler = (vscode.workspace.onDidChangeConfiguration as jest.Mock).mock.calls[0][0];

            // Create a mock event that affects the copilot-ppa configuration
            const mockEvent = {
                affectsConfiguration: jest.fn().mockReturnValue(true)
            };

            // Mock the loadConfig method to return a changed configuration
            const originalConfig = configManager.getConfig();
            const newConfig = {
                ...originalConfig,
                debugLogging: true
            };

            (configManager as any).loadConfig = jest.fn().mockReturnValue(newConfig);
            (configManager as any).emitConfigChanges = jest.fn();

            // Trigger the configuration change event
            onDidChangeConfigHandler(mockEvent);

            // Verify that the emitConfigChanges method was called with the correct configs
            expect((configManager as any).emitConfigChanges).toHaveBeenCalledWith(
                originalConfig,
                newConfig
            );
        });

        test('should skip events that do not affect copilot-ppa', () => {
            // Get the configuration change handler
            const onDidChangeConfigHandler = (vscode.workspace.onDidChangeConfiguration as jest.Mock).mock.calls[0][0];

            // Create a mock event that does not affect the copilot-ppa configuration
            const mockEvent = {
                affectsConfiguration: jest.fn().mockReturnValue(false)
            };

            // Mock methods to verify they are not called
            (configManager as any).loadConfig = jest.fn();
            (configManager as any).emitConfigChanges = jest.fn();

            // Trigger the configuration change event
            onDidChangeConfigHandler(mockEvent);

            // Verify that the methods were not called
            expect((configManager as any).loadConfig).not.toHaveBeenCalled();
            expect((configManager as any).emitConfigChanges).not.toHaveBeenCalled();
        });
    });

    describe('Configuration validation', () => {
        test('should handle extremely large threshold values', () => {
            // Access private method for testing
            const validateAnalysisThreshold = (configManager as any).validateAnalysisThreshold.bind(configManager);

            // Test with a very large number
            expect(validateAnalysisThreshold(Number.MAX_SAFE_INTEGER)).toBe(10000);

            // Test with a negative number
            expect(validateAnalysisThreshold(-1000)).toBe(100);

            // Test with NaN
            expect(validateAnalysisThreshold(NaN)).toBe(100);
        });

        test('should handle invalid LLM configurations', () => {
            // Access private method for testing
            const validateLLMConfig = (configManager as any).validateLLMConfig.bind(configManager);

            // Test with missing properties
            const incompleteConfig = {
                provider: 'ollama',
                // Missing other required fields
            } as LLMConfig;

            const fixedConfig = validateLLMConfig(incompleteConfig);

            // Should provide default values for missing properties
            expect(fixedConfig.modelId).toBeDefined();
            expect(fixedConfig.endpoint).toBeDefined();
            expect(fixedConfig.maxTokens).toBeDefined();
            expect(fixedConfig.temperature).toBeDefined();
        });

        test('should validate endpoints with unusual formats', () => {
            // Access private method for testing
            const validateEndpoint = (configManager as any).validateEndpoint.bind(configManager);

            // Test unusual but valid URLs
            expect(validateEndpoint('http://localhost:8080')).toBe('http://localhost:8080');
            expect(validateEndpoint('https://127.0.0.1:3000')).toBe('https://127.0.0.1:3000');
            expect(validateEndpoint('http://[::1]:8080')).toBe('http://[::1]:8080'); // IPv6 localhost

            // Test invalid URLs
            expect(validateEndpoint('ftp://example.com')).toBe('http://localhost:11434'); // Non HTTP/HTTPS protocol
            expect(validateEndpoint('localhost:8080')).toBe('http://localhost:11434'); // Missing protocol
            expect(validateEndpoint('')).toBe('http://localhost:11434'); // Empty string
        });
    });

    describe('Error handling', () => {
        test('should handle errors when updating configuration', async () => {
            // Mock the VS Code update method to throw an error
            mockConfig.update.mockRejectedValueOnce(new Error('Update failed'));

            // Call updateConfig
            try {
                await configManager.updateConfig('debugLogging', true);
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error).toBeDefined();
                expect((error as Error).message).toBe('Update failed');
            }
        });

        test('should handle errors during validation and use safe defaults', async () => {
            // Create a mock validateLLMConfig that throws an error
            (configManager as any).validateLLMConfig = jest.fn().mockImplementation(() => {
                throw new Error('Validation error');
            });

            // Mock the current config to have an invalid LLM section
            mockConfig.get.mockImplementation((key: string) => {
                if (key === 'llm.provider') return null; // Invalid value
                return undefined;
            });

            // Call the private method that performs validation
            await (configManager as any).validateAndUpdateConfig();

            // Should call update with the default value to fix the configuration
            expect(mockConfig.update).toHaveBeenCalledWith(
                'llm.provider',
                'ollama',
                vscode.ConfigurationTarget.Global
            );
        });
    });

    describe('Configuration migrations and defaults', () => {
        test('should provide default configuration when workspace config is empty', () => {
            // Mock getConfiguration to return a config that returns undefined for all values
            mockConfig.get.mockReturnValue(undefined);

            const config = configManager.getConfig();

            // Should return default values
            expect(config.enableTelemetry).toBe(true);
            expect(config.debugLogging).toBe(false);
            expect(config.showStatusBar).toBe(true);
            expect(config.analysisThreshold).toBe(500);
            expect(config.integrationFeatures.copilotEnabled).toBe(true);
            expect(config.integrationFeatures.vscodeProfileEnabled).toBe(false);
            expect(config.integrationFeatures.perfDataCollection).toBe(true);
            expect(config.llm.provider).toBe('ollama');
            expect(config.llm.modelId).toBe('llama2');
            expect(config.llm.endpoint).toBe('http://localhost:11434');
            expect(config.llm.maxTokens).toBe(2048);
            expect(config.llm.temperature).toBe(0.7);
            expect(config.defaultProvider).toBe('ollama');
        });

        test('should register configuration defaults if missing', async () => {
            // Mock has to return false indicating the property doesn't exist
            mockConfig.has.mockReturnValue(false);

            await configManager.registerConfigurationDefaults();

            // Should call update to set the default provider
            expect(mockConfig.update).toHaveBeenCalledWith(
                'defaultProvider',
                'ollama',
                vscode.ConfigurationTarget.Global
            );
        });
    });

    describe('ConfigManager initialization behavior', () => {
        test('should call validate and register defaults during initialize', async () => {
            // Spy on internal methods
            const validateSpy = jest.spyOn(configManager as any, 'validateAndUpdateConfig');
            const registerSpy = jest.spyOn(configManager, 'registerConfigurationDefaults');

            await configManager.initialize();

            expect(validateSpy).toHaveBeenCalled();
            expect(registerSpy).toHaveBeenCalled();
        });

        test('should update invalid configurations during initialization', async () => {
            // Mock current config to have invalid values
            (configManager as any)._currentConfig = {
                analysisThreshold: 5, // Too low
                llm: {
                    temperature: 5, // Too high
                }
            };

            // Mock validation methods to use real implementation
            const originalValidateAnalysisThreshold = (configManager as any).validateAnalysisThreshold;
            const originalValidateLLMConfig = (configManager as any).validateLLMConfig;

            // Mock the loadConfig method to return the invalid config
            (configManager as any).loadConfig = jest.fn().mockReturnValue((configManager as any)._currentConfig);

            await configManager.initialize();

            // Should correct the invalid values
            expect(mockConfig.update).toHaveBeenCalledWith(
                'analysisThreshold',
                100, // Corrected minimum value
                vscode.ConfigurationTarget.Global
            );
        });
    });
});


// Mock vscode namespace
jest.mock('vscode', () => {
  const originalModule = jest.requireActual('vscode');

  // Create a mock event emitter for configuration changes
  const configChangeEmitter = new originalModule.EventEmitter<vscode.ConfigurationChangeEvent>();

  return {
    ...originalModule,
    workspace: {
      getConfiguration: jest.fn().mockImplementation((section) => ({
        get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
        has: jest.fn().mockReturnValue(false),
        update: jest.fn().mockResolvedValue(undefined)
      })),
      onDidChangeConfiguration: configChangeEmitter.event,
      triggerConfigurationChange: (e: vscode.ConfigurationChangeEvent) => configChangeEmitter.fire(e)
    },
    ConfigurationTarget: {
      Global: 1,
      Workspace: 2,
      WorkspaceFolder: 3
    },
    EventEmitter: originalModule.EventEmitter,
  };
});

describe('ConfigManager Extended Tests', () => {
  let configManager: ConfigManager;
  let mockContext: vscode.ExtensionContext;
  let configChangeListener: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock context
    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path',
      storagePath: '/test/storage',
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn().mockReturnValue([]),
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn().mockReturnValue([]),
      },
      logPath: '/test/logs',
      extensionUri: {} as vscode.Uri,
      environmentVariableCollection: {} as vscode.EnvironmentVariableCollection,
      extensionMode: vscode.ExtensionMode.Test,
      globalStorageUri: {} as vscode.Uri,
      logUri: {} as vscode.Uri,
      storageUri: {} as vscode.Uri,
      workspaceState: {} as vscode.Memento,
      globalState: {} as vscode.Memento & { setKeysForSync(keys: readonly string[]): void },
      secrets: {} as vscode.SecretStorage,
      asAbsolutePath: jest.fn(p => `/absolute/${p}`),
    };

    // Create the config manager
    configManager = new ConfigManager(mockContext);

    // Set up configuration change listener
    configChangeListener = jest.fn();
    configManager.onConfigChanged(configChangeListener);
  });

  describe('configuration loading', () => {
    it('should load with default values when configuration is empty', () => {
      const config = configManager.getConfig();

      expect(config.enableTelemetry).toBe(true);
      expect(config.debugLogging).toBe(false);
      expect(config.showStatusBar).toBe(true);
      expect(config.analysisThreshold).toBe(500);
      expect(config.integrationFeatures.copilotEnabled).toBe(true);
      expect(config.integrationFeatures.vscodeProfileEnabled).toBe(false);
      expect(config.integrationFeatures.perfDataCollection).toBe(true);
      expect(config.llm.provider).toBe('ollama');
      expect(config.llm.modelId).toBe('llama2');
      expect(config.llm.endpoint).toBe('http://localhost:11434');
      expect(config.llm.maxTokens).toBe(2048);
      expect(config.llm.temperature).toBe(0.7);
      expect(config.defaultProvider).toBe('ollama');
    });

    it('should merge user configuration with defaults', () => {
      // Set up mock to return custom values for specific settings
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          const customValues: Record<string, any> = {
            'debugLogging': true,
            'analysisThreshold': 1000,
            'llm.temperature': 0.9
          };

          return key in customValues ? customValues[key] : defaultValue;
        }),
        has: jest.fn().mockReturnValue(true),
        update: jest.fn().mockResolvedValue(undefined)
      });

      // Create new config manager with updated mock
      configManager = new ConfigManager(mockContext);
      const config = configManager.getConfig();

      expect(config.debugLogging).toBe(true);
      expect(config.analysisThreshold).toBe(1000);
      expect(config.llm.temperature).toBe(0.9);

      // Other values should still be defaults
      expect(config.enableTelemetry).toBe(true);
      expect(config.showStatusBar).toBe(true);
      expect(config.llm.provider).toBe('ollama');
    });
  });

  describe('validation', () => {
    it('should validate analysis threshold to be within limits', () => {
      // Set up mock to return out-of-range value
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          return key === 'analysisThreshold' ? 50 : defaultValue;
        }),
        has: jest.fn().mockReturnValue(true),
        update: jest.fn().mockResolvedValue(undefined)
      });

      // Create new config manager with updated mock
      configManager = new ConfigManager(mockContext);
      const config = configManager.getConfig();

      // Value should be clamped to minimum (100)
      expect(config.analysisThreshold).toBe(100);
    });

    it('should validate analysis threshold to not exceed maximum', () => {
      // Set up mock to return out-of-range value
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          return key === 'analysisThreshold' ? 20000 : defaultValue;
        }),
        has: jest.fn().mockReturnValue(true),
        update: jest.fn().mockResolvedValue(undefined)
      });

      // Create new config manager with updated mock
      configManager = new ConfigManager(mockContext);
      const config = configManager.getConfig();

      // Value should be clamped to maximum (10000)
      expect(config.analysisThreshold).toBe(10000);
    });

    it('should validate LLM maxTokens to be within limits', () => {
      // Set up mock to return out-of-range values
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          const customValues: Record<string, any> = {
            'llm.maxTokens': 10000, // Over maximum of 8192
          };

          return key in customValues ? customValues[key] : defaultValue;
        }),
        has: jest.fn().mockReturnValue(true),
        update: jest.fn().mockResolvedValue(undefined)
      });

      // Create new config manager with updated mock
      configManager = new ConfigManager(mockContext);
      const config = configManager.getConfig();

      // Value should be clamped to maximum
      expect(config.llm.maxTokens).toBe(8192);
    });

    it('should validate LLM temperature to be within limits', () => {
      // Set up mock to return out-of-range values
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          const customValues: Record<string, any> = {
            'llm.temperature': 3.5, // Over maximum of 2
          };

          return key in customValues ? customValues[key] : defaultValue;
        }),
        has: jest.fn().mockReturnValue(true),
        update: jest.fn().mockResolvedValue(undefined)
      });

      // Create new config manager with updated mock
      configManager = new ConfigManager(mockContext);
      const config = configManager.getConfig();

      // Value should be clamped to maximum
      expect(config.llm.temperature).toBe(2);
    });

    it('should validate endpoint URL format', () => {
      // Set up mock to return invalid URL
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          const customValues: Record<string, any> = {
            'llm.endpoint': 'invalid-url', // Not a valid URL
          };

          return key in customValues ? customValues[key] : defaultValue;
        }),
        has: jest.fn().mockReturnValue(true),
        update: jest.fn().mockResolvedValue(undefined)
      });

      // Create new config manager with updated mock
      configManager = new ConfigManager(mockContext);
      const config = configManager.getConfig();

      // Invalid URL should be replaced with default
      expect(config.llm.endpoint).toBe('http://localhost:11434');
    });

    it('should accept valid endpoint URLs', () => {
      // Set up mock to return valid URL
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          const customValues: Record<string, any> = {
            'llm.endpoint': 'https://api.example.com:8080/v1', // Valid URL
          };

          return key in customValues ? customValues[key] : defaultValue;
        }),
        has: jest.fn().mockReturnValue(true),
        update: jest.fn().mockResolvedValue(undefined)
      });

      // Create new config manager with updated mock
      configManager = new ConfigManager(mockContext);
      const config = configManager.getConfig();

      // Valid URL should be kept as is
      expect(config.llm.endpoint).toBe('https://api.example.com:8080/v1');
    });
  });

  describe('configuration updates', () => {
    it('should update configuration with correct target', async () => {
      const updateMock = jest.fn().mockResolvedValue(undefined);
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn(),
        has: jest.fn(),
        update: updateMock
      });

      await configManager.updateConfig('debugLogging', true);

      expect(updateMock).toHaveBeenCalledWith(
        'debugLogging',
        true,
        vscode.ConfigurationTarget.Global
      );
    });

    it('should update configuration with workspace target when specified', async () => {
      const updateMock = jest.fn().mockResolvedValue(undefined);
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn(),
        has: jest.fn(),
        update: updateMock
      });

      await configManager.updateConfig('debugLogging', true, vscode.ConfigurationTarget.Workspace);

      expect(updateMock).toHaveBeenCalledWith(
        'debugLogging',
        true,
        vscode.ConfigurationTarget.Workspace
      );
    });

    it('should validate and update invalid values', async () => {
      // Set up mocks
      const updateMock = jest.fn().mockResolvedValue(undefined);
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          const customValues: Record<string, any> = {
            'analysisThreshold': 50, // Below minimum
            'llm.maxTokens': 10000, // Above maximum
            'llm.temperature': -0.5, // Below minimum
            'llm.endpoint': 'invalid-url' // Invalid URL
          };

          return key in customValues ? customValues[key] : defaultValue;
        }),
        has: jest.fn().mockReturnValue(true),
        update: updateMock
      });

      // Create new config manager with invalid values and wait for initialization
      configManager = new ConfigManager(mockContext);
      await configManager.initialize();

      // Should have called update for each invalid value
      expect(updateMock).toHaveBeenCalledWith(
        'analysisThreshold',
        100, // Minimum value
        expect.any(Number)
      );

      expect(updateMock).toHaveBeenCalledWith(
        'llm.maxTokens',
        8192, // Maximum value
        expect.any(Number)
      );

      expect(updateMock).toHaveBeenCalledWith(
        'llm.temperature',
        0, // Minimum value
        expect.any(Number)
      );

      expect(updateMock).toHaveBeenCalledWith(
        'llm.endpoint',
        'http://localhost:11434', // Default value
        expect.any(Number)
      );
    });
  });

  describe('configuration change events', () => {
    it('should emit change events when configuration changes', () => {
      // Mock the vscode configuration change event
      const mockConfigChangeEvent = {
        affectsConfiguration: jest.fn().mockReturnValue(true)
      };

      // Mock configuration values before change
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValueOnce({
        get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
        has: jest.fn(),
        update: jest.fn()
      });

      // Create the config manager
      configManager = new ConfigManager(mockContext);

      // Set up listener
      const configChangeListener = jest.fn();
      configManager.onConfigChanged(configChangeListener);

      // Mock configuration values after change
      getConfigurationMock.mockReturnValueOnce({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          const customValues: Record<string, any> = {
            'debugLogging': true // Changed from default (false)
          };

          return key in customValues ? customValues[key] : defaultValue;
        }),
        has: jest.fn(),
        update: jest.fn()
      });

      // Trigger configuration change
      (vscode.workspace as any).triggerConfigurationChange(mockConfigChangeEvent);

      // Verify listener was called with correct event data
      expect(configChangeListener).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'debugLogging',
          value: true,
          source: vscode.ConfigurationTarget.Global
        })
      );
    });

    it('should handle nested configuration property changes', () => {
      // Mock the vscode configuration change event
      const mockConfigChangeEvent = {
        affectsConfiguration: jest.fn().mockReturnValue(true)
      };

      // Mock configuration values before change
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValueOnce({
        get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
        has: jest.fn(),
        update: jest.fn()
      });

      // Create the config manager
      configManager = new ConfigManager(mockContext);

      // Set up listener
      const configChangeListener = jest.fn();
      configManager.onConfigChanged(configChangeListener);

      // Mock configuration values after change
      getConfigurationMock.mockReturnValueOnce({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          const customValues: Record<string, any> = {
            'llm.temperature': 0.9, // Changed from default (0.7)
            'integrationFeatures.vscodeProfileEnabled': true // Changed from default (false)
          };

          return key in customValues ? customValues[key] : defaultValue;
        }),
        has: jest.fn(),
        update: jest.fn()
      });

      // Trigger configuration change
      (vscode.workspace as any).triggerConfigurationChange(mockConfigChangeEvent);

      // Verify listener was called with correct events
      expect(configChangeListener).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'llm',
          value: expect.objectContaining({ temperature: 0.9 }),
          source: vscode.ConfigurationTarget.Global
        })
      );

      expect(configChangeListener).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'integrationFeatures',
          value: expect.objectContaining({ vscodeProfileEnabled: true }),
          source: vscode.ConfigurationTarget.Global
        })
      );
    });
  });

  describe('configuration defaults', () => {
    it('should register default configuration values', async () => {
      const updateMock = jest.fn().mockResolvedValue(undefined);
      const hasMock = jest.fn().mockReturnValue(false);
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn(),
        has: hasMock,
        update: updateMock
      });

      // Create config manager and initialize
      configManager = new ConfigManager(mockContext);
      await configManager.initialize();

      // Should set default provider if not already set
      expect(hasMock).toHaveBeenCalledWith('defaultProvider');
      expect(updateMock).toHaveBeenCalledWith(
        'defaultProvider',
        'ollama',
        vscode.ConfigurationTarget.Global
      );
    });

    it('should not overwrite existing configuration', async () => {
      const updateMock = jest.fn().mockResolvedValue(undefined);
      const hasMock = jest.fn().mockReturnValue(true); // Config already exists
      const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;
      getConfigurationMock.mockReturnValue({
        get: jest.fn(),
        has: hasMock,
        update: updateMock
      });

      // Create config manager and initialize
      configManager = new ConfigManager(mockContext);
      await configManager.initialize();

      // Should not set default provider if already set
      expect(hasMock).toHaveBeenCalledWith('defaultProvider');
      expect(updateMock).not.toHaveBeenCalledWith(
        'defaultProvider',
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('resource management', () => {
    it('should dispose event handlers properly', () => {
      const mockDispose = jest.fn();
      const mockConfigChangeHandler = { dispose: mockDispose };

      // Add mock handler to subscriptions
      (configManager as any)._configChangeHandler = mockConfigChangeHandler;

      // Dispose the config manager
      configManager.dispose();

      // Verify handler was disposed
      expect(mockDispose).toHaveBeenCalled();
    });
  });
});

import { LLMProvider } from '../../config';

// Mock VS Code API
jest.mock('vscode', () => {
    const mockEventEmitter = {
        event: jest.fn(),
        fire: jest.fn(),
        dispose: jest.fn()
    };

    const mockConfig = {
        get: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        has: jest.fn()
    };

    return {
        EventEmitter: jest.fn(() => mockEventEmitter),
        workspace: {
            getConfiguration: jest.fn().mockReturnValue(mockConfig),
            onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() })
        },
        ConfigurationTarget: {
            Global: 1,
            Workspace: 2,
            WorkspaceFolder: 3
        }
    };
});

describe('ConfigManager (Extended Tests)', () => {
    let configManager: ConfigManager;
    let mockContext: vscode.ExtensionContext;
    let mockConfig: any;
    let mockEventEmitter: any;
    let originalConfiguration: Record<string, any> = {};

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock context
        mockContext = {
            subscriptions: [],
            workspaceState: {
                get: jest.fn(),
                update: jest.fn()
            },
            globalState: {
                get: jest.fn(),
                update: jest.fn()
            },
            extensionPath: '/test/extension/path',
            asAbsolutePath: jest.fn(path => `/absolute/${path}`),
            storagePath: '/test/storage/path',
            globalStoragePath: '/test/global/storage/path',
            logPath: '/test/log/path',
        } as unknown as vscode.ExtensionContext;

        // Setup mock configuration with a default configuration
        originalConfiguration = {
            'enableTelemetry': true,
            'debugLogging': false,
            'showStatusBar': true,
            'analysisThreshold': 500,
            'integrationFeatures.copilotEnabled': true,
            'integrationFeatures.vscodeProfileEnabled': false,
            'integrationFeatures.perfDataCollection': true,
            'llm.provider': 'ollama',
            'llm.modelId': 'llama2',
            'llm.endpoint': 'http://localhost:11434',
            'llm.maxTokens': 2048,
            'llm.temperature': 0.7,
            'defaultProvider': 'ollama'
        };

        // Setup mock configuration
        mockConfig = (vscode.workspace.getConfiguration as jest.Mock)();
        mockConfig.get.mockImplementation((key: string, defaultValue: any) => {
            return (key in originalConfiguration) ? originalConfiguration[key] : defaultValue;
        });

        mockConfig.has.mockImplementation((key: string) => {
            return key in originalConfiguration;
        });

        // Setup event emitter
        mockEventEmitter = new (vscode.EventEmitter as jest.Mock)();
        mockEventEmitter.event = jest.fn().mockReturnValue(jest.fn());

        // Create instance of ConfigManager
        configManager = new ConfigManager(mockContext);

        // Replace the event emitter for testing
        (configManager as any)._configChangeEmitter = mockEventEmitter;
    });

    test('validation should correct extreme temperature values', () => {
        // Access the private method for validation
        const validateLLMConfig = (configManager as any).validateLLMConfig.bind(configManager);

        // Test extreme low temperature
        const lowTempConfig = {
            provider: 'ollama',
            modelId: 'model',
            endpoint: 'http://example.com',
            maxTokens: 1000,
            temperature: -10 // Very low temperature
        };
        const correctedLowTemp = validateLLMConfig(lowTempConfig);
        expect(correctedLowTemp.temperature).toBe(0);

        // Test extreme high temperature
        const highTempConfig = {
            provider: 'ollama',
            modelId: 'model',
            endpoint: 'http://example.com',
            maxTokens: 1000,
            temperature: 100 // Very high temperature
        };
        const correctedHighTemp = validateLLMConfig(highTempConfig);
        expect(correctedHighTemp.temperature).toBe(2);
    });

    test('validation should correct extreme token values', () => {
        // Access the private method for validation
        const validateLLMConfig = (configManager as any).validateLLMConfig.bind(configManager);

        // Test zero tokens
        const zeroTokenConfig = {
            provider: 'ollama',
            modelId: 'model',
            endpoint: 'http://example.com',
            maxTokens: 0, // Zero tokens
            temperature: 0.7
        };
        const correctedZeroToken = validateLLMConfig(zeroTokenConfig);
        expect(correctedZeroToken.maxTokens).toBe(1);

        // Test extremely high tokens
        const highTokenConfig = {
            provider: 'ollama',
            modelId: 'model',
            endpoint: 'http://example.com',
            maxTokens: 20000, // Very high token count
            temperature: 0.7
        };
        const correctedHighToken = validateLLMConfig(highTokenConfig);
        expect(correctedHighToken.maxTokens).toBe(8192);

        // Test negative tokens
        const negativeTokenConfig = {
            provider: 'ollama',
            modelId: 'model',
            endpoint: 'http://example.com',
            maxTokens: -100, // Negative token count
            temperature: 0.7
        };
        const correctedNegativeToken = validateLLMConfig(negativeTokenConfig);
        expect(correctedNegativeToken.maxTokens).toBe(1);
    });

    test('validation should handle malformed URLs correctly', () => {
        // Access the private method for validation
        const validateEndpoint = (configManager as any).validateEndpoint.bind(configManager);

        // Test various invalid URLs
        expect(validateEndpoint('')).toBe('http://localhost:11434'); // Empty
        expect(validateEndpoint('not-a-url')).toBe('http://localhost:11434'); // Not a URL
        expect(validateEndpoint('ftp://example.com')).toBe('ftp://example.com'); // Valid non-HTTP URL
        expect(validateEndpoint('localhost:9000')).toBe('http://localhost:11434'); // Missing scheme
        expect(validateEndpoint('http:/example.com')).toBe('http://localhost:11434'); // Malformed URL
    });

    test('config change events should include detailed information', async () => {
        // Mock the configuration change
        const configChangeListener = (vscode.workspace.onDidChangeConfiguration as jest.Mock).mock.calls[0][0];

        // Create a mock event object that affects our configuration
        const mockEvent = {
            affectsConfiguration: jest.fn().mockReturnValue(true)
        };

        // Modify the original configuration to simulate a change
        originalConfiguration['llm.temperature'] = 1.5;
        originalConfiguration['llm.maxTokens'] = 4096;

        // Trigger the configuration change
        configChangeListener(mockEvent);

        // Verify that the event emitter fired events
        expect(mockEventEmitter.fire).toHaveBeenCalled();

        // Verify that the events contain the right information
        const callArgs = mockEventEmitter.fire.mock.calls;

        // Find the call that deals with the llm property
        const llmChangeEvent = callArgs.find((args: any[]) =>
            args[0].key === 'llm'
        );

        expect(llmChangeEvent).toBeDefined();
        expect(llmChangeEvent[0].value.temperature).toBe(1.5);
        expect(llmChangeEvent[0].value.maxTokens).toBe(4096);
        expect(llmChangeEvent[0].source).toBe(vscode.ConfigurationTarget.Global);
    });

    test('validateAndUpdateConfig should update multiple invalid settings', async () => {
        // Set multiple invalid values in original configuration
        originalConfiguration['analysisThreshold'] = 50; // Below minimum (100)
        originalConfiguration['llm.maxTokens'] = 10000; // Above maximum (8192)
        originalConfiguration['llm.temperature'] = 3; // Above maximum (2)
        originalConfiguration['llm.endpoint'] = 'invalid-url'; // Invalid URL

        // Manually reload the config to pick up these changes
        (configManager as any)._currentConfig = (configManager as any).loadConfig();

        // Call validateAndUpdateConfig
        await (configManager as any).validateAndUpdateConfig();

        // Check that all invalid values were corrected with calls to update
        expect(mockConfig.update).toHaveBeenCalledWith('analysisThreshold', 100, vscode.ConfigurationTarget.Global);
        expect(mockConfig.update).toHaveBeenCalledWith('llm.maxTokens', 8192, vscode.ConfigurationTarget.Global);
        expect(mockConfig.update).toHaveBeenCalledWith('llm.temperature', 2, vscode.ConfigurationTarget.Global);
        expect(mockConfig.update).toHaveBeenCalledWith('llm.endpoint', 'http://localhost:11434', vscode.ConfigurationTarget.Global);
    });

    test('should handle complex nested configuration changes', async () => {
        // Setup a callback to track the event
        const onConfigChangedCallback = jest.fn();
        (configManager as any).onConfigChanged(onConfigChangedCallback);

        // Simulate a change to nested properties
        const configChangeListener = (vscode.workspace.onDidChangeConfiguration as jest.Mock).mock.calls[0][0];

        // Update multiple nested properties
        originalConfiguration['integrationFeatures.copilotEnabled'] = false;
        originalConfiguration['integrationFeatures.vscodeProfileEnabled'] = true;
        originalConfiguration['integrationFeatures.perfDataCollection'] = false;

        // Trigger the configuration change
        configChangeListener({ affectsConfiguration: jest.fn().mockReturnValue(true) });

        // The changes should be detected and fired through the event emitter
        expect(mockEventEmitter.fire).toHaveBeenCalled();

        // Look for the integrationFeatures change
        const integrationFeaturesChange = mockEventEmitter.fire.mock.calls.find(
            (args: any[]) => args[0].key === 'integrationFeatures'
        );

        expect(integrationFeaturesChange).toBeDefined();
        expect(integrationFeaturesChange[0].value).toEqual({
            copilotEnabled: false,
            vscodeProfileEnabled: true,
            perfDataCollection: false
        });
    });

    test('should handle provider changes correctly', () => {
        // Access the private method for validation
        const validateLLMConfig = (configManager as any).validateLLMConfig.bind(configManager);

        // Test changing the provider
        const newProviderConfig = {
            provider: 'lmstudio' as LLMProvider, // Different provider
            modelId: 'different-model',
            endpoint: 'http://localhost:8080',
            maxTokens: 2048,
            temperature: 0.5
        };

        const result = validateLLMConfig(newProviderConfig);

        // Provider change should be preserved
        expect(result.provider).toBe('lmstudio');
        expect(result.modelId).toBe('different-model');
        expect(result.endpoint).toBe('http://localhost:8080');
    });

    test('should correctly update the defaultProvider setting', async () => {
        // Setting doesn't exist yet
        mockConfig.has.mockReturnValue(false);

        await configManager.registerConfigurationDefaults();

        expect(mockConfig.update).toHaveBeenCalledWith(
            'defaultProvider',
            'ollama',
            vscode.ConfigurationTarget.Global
        );

        // Now change the provider through updateConfig
        await configManager.updateConfig('defaultProvider', 'huggingface');

        expect(mockConfig.update).toHaveBeenCalledWith(
            'defaultProvider',
            'huggingface',
            vscode.ConfigurationTarget.Global
        );
    });

    test('configuration changes should be reflected in getConfig', () => {
        // Get initial configuration
        const initialConfig = configManager.getConfig();
        expect(initialConfig.debugLogging).toBe(false);

        // Change a configuration value
        originalConfiguration['debugLogging'] = true;

        // Simulate configuration change event
        const configChangeListener = (vscode.workspace.onDidChangeConfiguration as jest.Mock).mock.calls[0][0];
        configChangeListener({ affectsConfiguration: jest.fn().mockReturnValue(true) });

        // Get updated configuration and verify it changed
        const updatedConfig = configManager.getConfig();
        expect(updatedConfig.debugLogging).toBe(true);
    });

    test('init sequence ensures valid configuration is present', async () => {
        // Set some invalid values
        originalConfiguration['analysisThreshold'] = 1; // Too low
        originalConfiguration['llm.maxTokens'] = 10000; // Too high
        originalConfiguration['llm.temperature'] = -1; // Too low

        // Create a new manager with these invalid settings
        const newConfigManager = new ConfigManager(mockContext);

        // Initialize to trigger validation
        await newConfigManager.initialize();

        // Validate that update was called for each invalid setting
        expect(mockConfig.update).toHaveBeenCalledWith('analysisThreshold', 100, vscode.ConfigurationTarget.Global);
        expect(mockConfig.update).toHaveBeenCalledWith('llm.maxTokens', 8192, vscode.ConfigurationTarget.Global);
        expect(mockConfig.update).toHaveBeenCalledWith('llm.temperature', 0, vscode.ConfigurationTarget.Global);
    });
});
