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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.ModelConfigurationManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelConfigurationManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelConfigurationManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelConfigurationManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        configMap = new Map();
        defaultConfigs = new Map();
        outputChannel;
        storageKey = 'model-configurations';
        constructor(logger) {
            super();
            this.logger = logger;
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
    return ModelConfigurationManager = _classThis;
})();
exports.ModelConfigurationManager = ModelConfigurationManager;
//# sourceMappingURL=ModelConfigurationManager.js.map