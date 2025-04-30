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
exports.LLMSessionConfigService = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
const DEFAULT_CONFIG = {
    timeout: 30000,
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    presencePenalty: 0,
    frequencyPenalty: 0,
    stream: true,
    cache: true,
    retryCount: 3,
    contextWindowSize: 4096
};
/**
 * Service for managing LLM session configurations
 */
class LLMSessionConfigService extends events_1.EventEmitter {
    currentConfig;
    constructor() {
        super();
        this.currentConfig = this.loadConfig();
    }
    /**
     * Reload configuration from workspace settings
     */
    reloadConfig() {
        const newConfig = this.loadConfig();
        const oldConfig = this.currentConfig;
        this.currentConfig = newConfig;
        this.emit('configChanged', {
            oldConfig,
            newConfig,
            changes: this.getConfigChanges(oldConfig, newConfig)
        });
    }
    /**
     * Get the current session configuration
     */
    getCurrentConfig() {
        return { ...this.currentConfig };
    }
    /**
     * Merge provided config with current config
     */
    mergeConfig(config) {
        return {
            ...this.currentConfig,
            ...config
        };
    }
    /**
     * Update specific configuration values
     */
    async updateConfig(updates) {
        const config = vscode.workspace.getConfiguration('copilot-ppa.llm');
        for (const [key, value] of Object.entries(updates)) {
            await config.update(key, value, vscode.ConfigurationTarget.Global);
        }
        this.reloadConfig();
    }
    /**
     * Reset configuration to defaults
     */
    async resetConfig() {
        await this.updateConfig(DEFAULT_CONFIG);
    }
    /**
     * Validate a session configuration
     */
    validateConfig(config) {
        const errors = [];
        if (config.timeout !== undefined && config.timeout < 0) {
            errors.push('Timeout must be non-negative');
        }
        if (config.maxTokens !== undefined && config.maxTokens < 1) {
            errors.push('Max tokens must be positive');
        }
        if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
            errors.push('Temperature must be between 0 and 2');
        }
        if (config.topP !== undefined && (config.topP < 0 || config.topP > 1)) {
            errors.push('Top P must be between 0 and 1');
        }
        if (config.presencePenalty !== undefined && (config.presencePenalty < -2 || config.presencePenalty > 2)) {
            errors.push('Presence penalty must be between -2 and 2');
        }
        if (config.frequencyPenalty !== undefined && (config.frequencyPenalty < -2 || config.frequencyPenalty > 2)) {
            errors.push('Frequency penalty must be between -2 and 2');
        }
        if (config.retryCount !== undefined && config.retryCount < 0) {
            errors.push('Retry count must be non-negative');
        }
        if (config.contextWindowSize !== undefined && config.contextWindowSize < 1) {
            errors.push('Context window size must be positive');
        }
        return errors;
    }
    loadConfig() {
        const config = vscode.workspace.getConfiguration('copilot-ppa.llm');
        return {
            timeout: config.get('timeout', DEFAULT_CONFIG.timeout),
            maxTokens: config.get('maxTokens', DEFAULT_CONFIG.maxTokens),
            temperature: config.get('temperature', DEFAULT_CONFIG.temperature),
            topP: config.get('topP', DEFAULT_CONFIG.topP),
            presencePenalty: config.get('presencePenalty', DEFAULT_CONFIG.presencePenalty),
            frequencyPenalty: config.get('frequencyPenalty', DEFAULT_CONFIG.frequencyPenalty),
            stream: config.get('stream', DEFAULT_CONFIG.stream),
            cache: config.get('cache', DEFAULT_CONFIG.cache),
            retryCount: config.get('retryCount', DEFAULT_CONFIG.retryCount),
            contextWindowSize: config.get('contextWindowSize', DEFAULT_CONFIG.contextWindowSize)
        };
    }
    getConfigChanges(oldConfig, newConfig) {
        const changes = {};
        for (const key of Object.keys(oldConfig)) {
            if (oldConfig[key] !== newConfig[key]) {
                changes[key] = newConfig[key];
            }
        }
        return changes;
    }
}
exports.LLMSessionConfigService = LLMSessionConfigService;
//# sourceMappingURL=LLMSessionConfigService.js.map