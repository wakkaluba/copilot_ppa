"use strict";

const vscode = require('vscode');
const { ConfigManager } = require('../../config.js');

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

describe('ConfigManager Extended JavaScript Tests', () => {
    let configManager;
    let mockContext;
    let mockConfig;
    let mockEventEmitter;
    let originalConfiguration = {};

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
        };

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
        mockConfig = vscode.workspace.getConfiguration();
        mockConfig.get.mockImplementation((key, defaultValue) => {
            return (key in originalConfiguration) ? originalConfiguration[key] : defaultValue;
        });

        mockConfig.has.mockImplementation((key) => {
            return key in originalConfiguration;
        });

        // Setup event emitter
        mockEventEmitter = new (vscode.EventEmitter)();
        mockEventEmitter.event = jest.fn().mockReturnValue(jest.fn());

        // Create instance of ConfigManager
        configManager = new ConfigManager(mockContext);

        // Replace the event emitter for testing
        configManager._configChangeEmitter = mockEventEmitter;
    });

    test('validation should correct extreme temperature values', () => {
        // Access the private method for validation
        const validateLLMConfig = configManager.validateLLMConfig.bind(configManager);

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
        const validateLLMConfig = configManager.validateLLMConfig.bind(configManager);

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
        const validateEndpoint = configManager.validateEndpoint.bind(configManager);

        // Test various invalid URLs
        expect(validateEndpoint('')).toBe('http://localhost:11434'); // Empty
        expect(validateEndpoint('not-a-url')).toBe('http://localhost:11434'); // Not a URL
        expect(validateEndpoint('ftp://example.com')).toBe('ftp://example.com'); // Valid non-HTTP URL
        expect(validateEndpoint('localhost:9000')).toBe('http://localhost:11434'); // Missing scheme
        expect(validateEndpoint('http:/example.com')).toBe('http://localhost:11434'); // Malformed URL
    });

    test('config change events should include detailed information', async () => {
        // Mock the configuration change
        const configChangeListener = vscode.workspace.onDidChangeConfiguration.mock.calls[0][0];

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
        const llmChangeEvent = callArgs.find((args) =>
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
        configManager._currentConfig = configManager.loadConfig();

        // Call validateAndUpdateConfig
        await configManager.validateAndUpdateConfig();

        // Check that all invalid values were corrected with calls to update
        expect(mockConfig.update).toHaveBeenCalledWith('analysisThreshold', 100, vscode.ConfigurationTarget.Global);
        expect(mockConfig.update).toHaveBeenCalledWith('llm.maxTokens', 8192, vscode.ConfigurationTarget.Global);
        expect(mockConfig.update).toHaveBeenCalledWith('llm.temperature', 2, vscode.ConfigurationTarget.Global);
        expect(mockConfig.update).toHaveBeenCalledWith('llm.endpoint', 'http://localhost:11434', vscode.ConfigurationTarget.Global);
    });

    test('should handle complex nested configuration changes', async () => {
        // Setup a callback to track the event
        const onConfigChangedCallback = jest.fn();
        configManager.onConfigChanged(onConfigChangedCallback);

        // Simulate a change to nested properties
        const configChangeListener = vscode.workspace.onDidChangeConfiguration.mock.calls[0][0];

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
            (args) => args[0].key === 'integrationFeatures'
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
        const validateLLMConfig = configManager.validateLLMConfig.bind(configManager);

        // Test changing the provider
        const newProviderConfig = {
            provider: 'lmstudio', // Different provider
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
        const configChangeListener = vscode.workspace.onDidChangeConfiguration.mock.calls[0][0];
        configChangeListener({ affectsConfiguration: jest.fn().mockReturnValue(true) });

        // Get updated configuration and verify it changed
        const updatedConfig = configManager.getConfig();
        expect(updatedConfig.debugLogging).toBe(true);
    });

    test('event handlers and emitters should be properly disposed', () => {
        // Create a mock disposable for the change handler
        const mockDisposable = { dispose: jest.fn() };
        configManager._configChangeHandler = mockDisposable;

        // Mock the event emitter's dispose method
        mockEventEmitter.dispose = jest.fn();

        // Call dispose
        configManager.dispose();

        // Verify dispose was called on both objects
        expect(mockDisposable.dispose).toHaveBeenCalled();
        expect(mockEventEmitter.dispose).toHaveBeenCalled();
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

describe('ConfigManager Error Handling', () => {
    let configManager;
    let mockContext;
    let mockConfig;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock context
        mockContext = {
            subscriptions: [],
            workspaceState: { get: jest.fn(), update: jest.fn() },
            globalState: { get: jest.fn(), update: jest.fn() },
            extensionPath: '/test/path',
        };

        // Setup mock configuration
        mockConfig = vscode.workspace.getConfiguration();

        // Create instance
        configManager = new ConfigManager(mockContext);
    });

    test('should handle exceptions during URL validation', () => {
        // Mock URL constructor to throw an exception
        const originalURL = global.URL;
        global.URL = jest.fn().mockImplementation(() => {
            throw new Error('Invalid URL');
        });

        try {
            // Test the validation method
            const validateEndpoint = configManager.validateEndpoint.bind(configManager);
            const result = validateEndpoint('http://example.com');

            // Should return the default endpoint
            expect(result).toBe('http://localhost:11434');
        } finally {
            // Restore original URL constructor
            global.URL = originalURL;
        }
    });

    test('should handle failed configuration updates', async () => {
        // Mock update to reject
        mockConfig.update.mockRejectedValueOnce(new Error('Update failed'));

        // Test error handling during update
        try {
            await configManager.updateConfig('someConfig', 'someValue');
            fail('Expected an error to be thrown');
        } catch (error) {
            expect(error.message).toBe('Update failed');
        }
    });

    test('should handle empty or missing configuration values', () => {
        // Mock config to return undefined for all values
        mockConfig.get.mockReturnValue(undefined);

        // Load config should use defaults
        const config = configManager.loadConfig();

        // Verify defaults were used
        expect(config.enableTelemetry).toBe(true);
        expect(config.debugLogging).toBe(false);
        expect(config.llm.provider).toBe('ollama');
        expect(config.llm.modelId).toBe('llama2');
    });
});

describe('ConfigManager Edge Cases', () => {
    let configManager;
    let mockContext;
    let mockConfig;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock context
        mockContext = {
            subscriptions: [],
            workspaceState: { get: jest.fn(), update: jest.fn() },
            globalState: { get: jest.fn(), update: jest.fn() },
            extensionPath: '/test/path',
        };

        // Setup mock configuration
        mockConfig = vscode.workspace.getConfiguration();

        // Create instance
        configManager = new ConfigManager(mockContext);
    });

    test('should handle non-object configuration values for llm section', () => {
        // Mock config to return a non-object for llm
        mockConfig.get.mockImplementation((key, defaultValue) => {
            if (key === 'llm.provider') return null;
            if (key === 'llm.modelId') return null;
            if (key === 'llm.endpoint') return null;
            if (key === 'llm.maxTokens') return null;
            if (key === 'llm.temperature') return null;
            return defaultValue;
        });

        // Load config should use defaults for invalid values
        const config = configManager.loadConfig();

        // Verify defaults were used
        expect(config.llm.provider).toBe('ollama');
        expect(config.llm.modelId).toBe('llama2');
        expect(config.llm.endpoint).toBe('http://localhost:11434');
        expect(config.llm.maxTokens).toBe(2048);
        expect(config.llm.temperature).toBe(0.7);
    });

    test('should handle string values for numeric settings', () => {
        // Mock config to return strings instead of numbers
        mockConfig.get.mockImplementation((key, defaultValue) => {
            if (key === 'analysisThreshold') return '750';
            if (key === 'llm.maxTokens') return '4096';
            if (key === 'llm.temperature') return '0.5';
            return defaultValue;
        });

        // Load config should convert string values
        const config = configManager.loadConfig();

        // Type conversion should happen automatically in JavaScript
        expect(config.analysisThreshold).toBe(750);
        expect(config.llm.maxTokens).toBe(4096);
        expect(config.llm.temperature).toBe(0.5);
    });

    test('should handle extreme values for analysisThreshold', () => {
        const validateAnalysisThreshold = configManager.validateAnalysisThreshold.bind(configManager);

        // Test various extreme values
        expect(validateAnalysisThreshold(Number.MAX_SAFE_INTEGER)).toBe(10000);
        expect(validateAnalysisThreshold(Number.MIN_SAFE_INTEGER)).toBe(100);
        expect(validateAnalysisThreshold(Infinity)).toBe(10000);
        expect(validateAnalysisThreshold(-Infinity)).toBe(100);
        expect(validateAnalysisThreshold(NaN)).toBe(100);
    });

    test('should handle invalid values in configuration update', async () => {
        // Mock the getConfig method to return invalid values
        configManager.getConfig = jest.fn().mockReturnValue({
            analysisThreshold: 'not a number',
            llm: {
                maxTokens: null,
                temperature: undefined,
                endpoint: 123  // Not a string
            }
        });

        // Run the validation process
        await configManager.validateAndUpdateConfig();

        // Check that update was called with valid values
        expect(mockConfig.update).toHaveBeenCalledWith('analysisThreshold', 100, expect.anything());
        expect(mockConfig.update).toHaveBeenCalledWith('llm.maxTokens', 1, expect.anything());
        expect(mockConfig.update).toHaveBeenCalledWith('llm.temperature', 0, expect.anything());
        expect(mockConfig.update).toHaveBeenCalledWith('llm.endpoint', 'http://localhost:11434', expect.anything());
    });
});
