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

describe('ConfigManager (JavaScript)', () => {
    let configManager;
    let mockContext;
    let mockConfig;
    let mockEventEmitter;

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

        // Setup mock configuration
        mockConfig = vscode.workspace.getConfiguration();
        mockConfig.get.mockImplementation((key, defaultValue) => {
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
        mockEventEmitter = new vscode.EventEmitter();

        // Create instance of ConfigManager
        configManager = new ConfigManager(mockContext);
    });

    test('constructor should initialize correctly', () => {
        expect(configManager).toBeDefined();
        expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('copilot-ppa');
        expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalled();
        expect(mockContext.subscriptions.length).toBe(1);
    });

    test('initialize should validate and register configuration defaults', async () => {
        await configManager.initialize();
        expect(mockConfig.update).toHaveBeenCalledTimes(0); // No updates needed if config is valid
        expect(mockConfig.has).toHaveBeenCalledWith('defaultProvider');
    });

    test('getConfig should return a copy of the current config', () => {
        const config = configManager.getConfig();
        expect(config).toEqual({
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
        });
    });

    test('updateConfig should call VS Code update API', async () => {
        await configManager.updateConfig('debugLogging', true);
        expect(mockConfig.update).toHaveBeenCalledWith('debugLogging', true, vscode.ConfigurationTarget.Global);
    });

    test('validateAnalysisThreshold should constrain value within limits', () => {
        // Access private method for testing
        const validateAnalysisThreshold = configManager.validateAnalysisThreshold.bind(configManager);

        expect(validateAnalysisThreshold(50)).toBe(100); // Below min
        expect(validateAnalysisThreshold(500)).toBe(500); // Within range
        expect(validateAnalysisThreshold(15000)).toBe(10000); // Above max
    });

    test('validateLLMConfig should constrain values within limits', () => {
        // Access private method for testing
        const validateLLMConfig = configManager.validateLLMConfig.bind(configManager);

        const config = {
            provider: 'test',
            modelId: 'model',
            endpoint: 'http://valid.endpoint',
            maxTokens: 5000,
            temperature: 0.5
        };

        const result = validateLLMConfig(config);
        expect(result).toEqual(config); // Valid config stays the same

        // Test invalid values
        const invalidConfig = {
            provider: 'test',
            modelId: 'model',
            endpoint: 'invalid-url',
            maxTokens: 10000, // Too high
            temperature: 3 // Too high
        };

        const correctedConfig = validateLLMConfig(invalidConfig);
        expect(correctedConfig.maxTokens).toBe(8192); // Constrained to max
        expect(correctedConfig.temperature).toBe(2); // Constrained to max
        expect(correctedConfig.endpoint).toBe('http://localhost:11434'); // Default for invalid URL
    });

    test('validateEndpoint should return valid URL or default', () => {
        // Access private method for testing
        const validateEndpoint = configManager.validateEndpoint.bind(configManager);

        expect(validateEndpoint('http://valid.endpoint')).toBe('http://valid.endpoint');
        expect(validateEndpoint('https://valid.endpoint')).toBe('https://valid.endpoint');
        expect(validateEndpoint('invalid-url')).toBe('http://localhost:11434');
    });

    test('emitConfigChanges should fire events for changed properties', () => {
        // Access private method and properties for testing
        const emitConfigChanges = configManager.emitConfigChanges.bind(configManager);
        configManager._configChangeEmitter = mockEventEmitter;

        const oldConfig = {
            enableTelemetry: true,
            debugLogging: false,
            showStatusBar: true,
            // Other properties remain the same
        };

        const newConfig = {
            enableTelemetry: false, // Changed
            debugLogging: true, // Changed
            showStatusBar: true, // Unchanged
            // Other properties remain the same
        };

        emitConfigChanges(oldConfig, newConfig);

        expect(mockEventEmitter.fire).toHaveBeenCalledTimes(2);
    });

    test('dispose should clean up resources', () => {
        // Setup disposable for testing
        const mockDisposable = { dispose: jest.fn() };
        configManager._configChangeHandler = mockDisposable;
        configManager._configChangeEmitter = mockEventEmitter;

        configManager.dispose();

        expect(mockDisposable.dispose).toHaveBeenCalled();
        expect(mockEventEmitter.dispose).toHaveBeenCalled();
    });

    test('registerConfigurationDefaults should set defaults if not present', async () => {
        mockConfig.has.mockReturnValue(false);

        await configManager.registerConfigurationDefaults();

        expect(mockConfig.update).toHaveBeenCalledWith(
            'defaultProvider',
            'ollama',
            vscode.ConfigurationTarget.Global
        );
    });

    test('registerConfigurationDefaults should not set defaults if already present', async () => {
        mockConfig.has.mockReturnValue(true);

        await configManager.registerConfigurationDefaults();

        expect(mockConfig.update).not.toHaveBeenCalled();
    });
});
