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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConfigurationManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
let ModelConfigurationManager = class ModelConfigurationManager extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.configMap = new Map();
        this.defaultConfigs = new Map();
        this.storageKey = 'model-configurations';
        this.outputChannel = vscode.window.createOutputChannel('Model Configuration');
        this.loadPersistedConfigs();
    }
    async updateConfig(modelId, config) {
        try {
            const currentConfig = this.configMap.get(modelId) || this.getDefaultConfig(modelId);
            const newConfig = { ...currentConfig, ...config };
            await this.validateConfig(newConfig);
            this.configMap.set(modelId, newConfig);
            this.emit('configUpdated', { modelId, config: newConfig });
            this.logConfigChange(modelId, currentConfig, newConfig);
            await this.persistConfigs();
        }
        catch (error) {
            this.handleError('Failed to update configuration', error);
            throw error;
        }
    }
    getConfig(modelId) {
        return this.configMap.get(modelId) || this.getDefaultConfig(modelId);
    }
    setDefaultConfig(modelId, config) {
        this.defaultConfigs.set(modelId, config);
        this.emit('defaultConfigSet', { modelId, config });
    }
    async resetConfig(modelId) {
        try {
            const defaultConfig = this.getDefaultConfig(modelId);
            this.configMap.delete(modelId);
            this.emit('configReset', { modelId, config: defaultConfig });
            await this.persistConfigs();
        }
        catch (error) {
            this.handleError('Failed to reset configuration', error);
            throw error;
        }
    }
    getDefaultConfig(modelId) {
        return this.defaultConfigs.get(modelId) || {
            maxTokens: 2048,
            temperature: 0.7,
            topP: 0.9,
            presencePenalty: 0,
            frequencyPenalty: 0,
            stopSequences: []
        };
    }
    async validateConfig(config) {
        const errors = [];
        // Validate maxTokens
        if (config.maxTokens < 1) {
            errors.push('maxTokens must be greater than 0');
        }
        // Validate temperature
        if (config.temperature < 0 || config.temperature > 2) {
            errors.push('temperature must be between 0 and 2');
        }
        // Validate topP
        if (config.topP < 0 || config.topP > 1) {
            errors.push('topP must be between 0 and 1');
        }
        // Validate penalties
        if (config.presencePenalty < -2 || config.presencePenalty > 2) {
            errors.push('presencePenalty must be between -2 and 2');
        }
        if (config.frequencyPenalty < -2 || config.frequencyPenalty > 2) {
            errors.push('frequencyPenalty must be between -2 and 2');
        }
        // Validate stop sequences
        if (!Array.isArray(config.stopSequences)) {
            errors.push('stopSequences must be an array');
        }
        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }
    }
    async persistConfigs() {
        try {
            const configData = Array.from(this.configMap.entries()).map(([id, config]) => ({
                modelId: id,
                config
            }));
            await vscode.workspace.getConfiguration().update(this.storageKey, configData, vscode.ConfigurationTarget.Global);
        }
        catch (error) {
            this.handleError('Failed to persist configurations', error);
        }
    }
    async loadPersistedConfigs() {
        try {
            const configData = vscode.workspace.getConfiguration().get(this.storageKey) || [];
            for (const data of configData) {
                if (data.modelId && data.config) {
                    await this.validateConfig(data.config);
                    this.configMap.set(data.modelId, data.config);
                }
            }
        }
        catch (error) {
            this.handleError('Failed to load persisted configurations', error);
        }
    }
    logConfigChange(modelId, oldConfig, newConfig) {
        this.outputChannel.appendLine('\nModel Configuration Change:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine('Changes:');
        for (const key of Object.keys(newConfig)) {
            if (oldConfig[key] !== newConfig[key]) {
                this.outputChannel.appendLine(`  ${key}: ${oldConfig[key]} -> ${newConfig[key]}`);
            }
        }
        this.outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
    }
    handleError(message, error) {
        this.logger.error('[ModelConfigurationManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    dispose() {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.configMap.clear();
        this.defaultConfigs.clear();
    }
};
ModelConfigurationManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object])
], ModelConfigurationManager);
exports.ModelConfigurationManager = ModelConfigurationManager;
//# sourceMappingURL=ModelConfigurationManager.js.map