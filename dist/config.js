"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const vscode = __importStar(require("vscode"));
const DEFAULT_CONFIG = {
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
class ConfigManager {
    constructor(context) {
        this._configChangeEmitter = new vscode.EventEmitter();
        this.onConfigChanged = this._configChangeEmitter.event;
        this._context = context;
        this._currentConfig = this.loadConfig();
        this.setupConfigChangeListener();
    }
    async initialize() {
        await this.validateAndUpdateConfig();
        await this.registerConfigurationDefaults();
    }
    loadConfig() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        return this.mergeWithDefaults(config);
    }
    mergeWithDefaults(config) {
        return {
            enableTelemetry: config.get('enableTelemetry', DEFAULT_CONFIG.enableTelemetry),
            debugLogging: config.get('debugLogging', DEFAULT_CONFIG.debugLogging),
            showStatusBar: config.get('showStatusBar', DEFAULT_CONFIG.showStatusBar),
            analysisThreshold: this.validateAnalysisThreshold(config.get('analysisThreshold', DEFAULT_CONFIG.analysisThreshold)),
            integrationFeatures: {
                copilotEnabled: config.get('integrationFeatures.copilotEnabled', DEFAULT_CONFIG.integrationFeatures.copilotEnabled),
                vscodeProfileEnabled: config.get('integrationFeatures.vscodeProfileEnabled', DEFAULT_CONFIG.integrationFeatures.vscodeProfileEnabled),
                perfDataCollection: config.get('integrationFeatures.perfDataCollection', DEFAULT_CONFIG.integrationFeatures.perfDataCollection),
            },
            llm: this.validateLLMConfig({
                provider: config.get('llm.provider', DEFAULT_CONFIG.llm.provider),
                modelId: config.get('llm.modelId', DEFAULT_CONFIG.llm.modelId),
                endpoint: config.get('llm.endpoint', DEFAULT_CONFIG.llm.endpoint),
                maxTokens: config.get('llm.maxTokens', DEFAULT_CONFIG.llm.maxTokens),
                temperature: config.get('llm.temperature', DEFAULT_CONFIG.llm.temperature),
            }),
            defaultProvider: config.get('defaultProvider', DEFAULT_CONFIG.defaultProvider),
        };
    }
    validateAnalysisThreshold(threshold) {
        return Math.max(100, Math.min(threshold, 10000));
    }
    validateLLMConfig(config) {
        return {
            ...config,
            maxTokens: Math.max(1, Math.min(config.maxTokens, 8192)),
            temperature: Math.max(0, Math.min(config.temperature, 2)),
            endpoint: this.validateEndpoint(config.endpoint),
        };
    }
    validateEndpoint(endpoint) {
        try {
            new URL(endpoint);
            return endpoint;
        }
        catch {
            return DEFAULT_CONFIG.llm.endpoint;
        }
    }
    async validateAndUpdateConfig() {
        const config = this.getConfig();
        // Update any invalid values with validated ones
        if (config.analysisThreshold !== this._currentConfig.analysisThreshold) {
            await this.updateConfig('analysisThreshold', this._currentConfig.analysisThreshold);
        }
        if (config.llm.maxTokens !== this._currentConfig.llm.maxTokens) {
            await this.updateConfig('llm.maxTokens', this._currentConfig.llm.maxTokens);
        }
        if (config.llm.temperature !== this._currentConfig.llm.temperature) {
            await this.updateConfig('llm.temperature', this._currentConfig.llm.temperature);
        }
        if (config.llm.endpoint !== this._currentConfig.llm.endpoint) {
            await this.updateConfig('llm.endpoint', this._currentConfig.llm.endpoint);
        }
    }
    setupConfigChangeListener() {
        this._configChangeHandler = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('copilot-ppa')) {
                const oldConfig = this._currentConfig;
                this._currentConfig = this.loadConfig();
                // Emit specific changes
                this.emitConfigChanges(oldConfig, this._currentConfig);
            }
        });
        this._context.subscriptions.push(this._configChangeHandler);
    }
    emitConfigChanges(oldConfig, newConfig) {
        // Compare and emit changes for each top-level property
        for (const key in newConfig) {
            const typedKey = key;
            if (JSON.stringify(oldConfig[typedKey]) !== JSON.stringify(newConfig[typedKey])) {
                this._configChangeEmitter.fire({
                    key: typedKey,
                    value: newConfig[typedKey],
                    source: vscode.ConfigurationTarget.Global
                });
            }
        }
    }
    getConfig() {
        return { ...this._currentConfig };
    }
    async updateConfig(section, value, configTarget = vscode.ConfigurationTarget.Global) {
        await vscode.workspace.getConfiguration('copilot-ppa').update(section, value, configTarget);
    }
    async registerConfigurationDefaults() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        // Only set defaults if they haven't been set before
        if (!config.has('defaultProvider')) {
            await config.update('defaultProvider', DEFAULT_CONFIG.llm.provider, vscode.ConfigurationTarget.Global);
        }
    }
    dispose() {
        this._configChangeHandler?.dispose();
        this._configChangeEmitter.dispose();
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map