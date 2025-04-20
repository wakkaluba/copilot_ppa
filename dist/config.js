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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Default configuration values
 */
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
};
/**
 * Configuration manager for the extension
 * Handles reading and writing configuration values
 */
class ConfigManager {
    context;
    configChangeHandler;
    /**
     * Creates a new configuration manager
     * @param context The extension context
     */
    constructor(context) {
        this.context = context;
        this.setupConfigChangeListener();
    }
    /**
     * Get the current configuration
     * @returns The current configuration combined with defaults
     */
    getConfig() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        return {
            enableTelemetry: config.get('enableTelemetry', DEFAULT_CONFIG.enableTelemetry),
            debugLogging: config.get('debugLogging', DEFAULT_CONFIG.debugLogging),
            showStatusBar: config.get('showStatusBar', DEFAULT_CONFIG.showStatusBar),
            analysisThreshold: config.get('analysisThreshold', DEFAULT_CONFIG.analysisThreshold),
            integrationFeatures: {
                copilotEnabled: config.get('integrationFeatures.copilotEnabled', DEFAULT_CONFIG.integrationFeatures.copilotEnabled),
                vscodeProfileEnabled: config.get('integrationFeatures.vscodeProfileEnabled', DEFAULT_CONFIG.integrationFeatures.vscodeProfileEnabled),
                perfDataCollection: config.get('integrationFeatures.perfDataCollection', DEFAULT_CONFIG.integrationFeatures.perfDataCollection),
            },
            llm: {
                provider: config.get('llm.provider', DEFAULT_CONFIG.llm.provider),
                modelId: config.get('llm.modelId', DEFAULT_CONFIG.llm.modelId),
                endpoint: config.get('llm.endpoint', DEFAULT_CONFIG.llm.endpoint),
                maxTokens: config.get('llm.maxTokens', DEFAULT_CONFIG.llm.maxTokens),
                temperature: config.get('llm.temperature', DEFAULT_CONFIG.llm.temperature),
            },
        };
    }
    /**
     * Update a configuration value
     * @param section The configuration section path
     * @param value The value to set
     * @param configTarget The configuration target (global or workspace)
     */
    async updateConfig(section, value, configTarget = vscode.ConfigurationTarget.Global) {
        await vscode.workspace.getConfiguration('copilot-ppa').update(section, value, configTarget);
    }
    /**
     * Setup the configuration change listener
     */
    setupConfigChangeListener() {
        this.configChangeHandler = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('copilot-ppa')) {
                // Emit an event or perform any necessary actions when config changes
                console.log('Copilot PPA configuration changed');
            }
        });
        this.context.subscriptions.push(this.configChangeHandler);
    }
    /**
     * Register configuration schema contributions to override defaults when not specified by user
     * Used for dynamic runtime configuration updates
     */
    registerConfigurationDefaults() {
        vscode.workspace.getConfiguration('copilot-ppa').update('defaultProvider', DEFAULT_CONFIG.llm.provider, vscode.ConfigurationTarget.Global);
    }
    /**
     * Dispose of any resources
     */
    dispose() {
        if (this.configChangeHandler) {
            this.configChangeHandler.dispose();
        }
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map