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
exports.ModelConfigManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelConfigManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelConfigManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelConfigManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        outputChannel;
        configStore = new Map();
        storage;
        constructor(logger, storage) {
            super();
            this.logger = logger;
            this.outputChannel = vscode.window.createOutputChannel('Model Configuration');
            this.storage = storage;
            this.loadPersistedConfigs();
        }
        async getConfig(modelId) {
            try {
                return this.configStore.get(modelId);
            }
            catch (error) {
                this.handleError('Failed to get model config', error);
                return undefined;
            }
        }
        async updateConfig(modelId, config) {
            try {
                const currentConfig = this.configStore.get(modelId) || this.createDefaultConfig();
                const newConfig = { ...currentConfig, ...config };
                const validation = await this.validateConfig(newConfig);
                if (!validation.isValid) {
                    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
                }
                this.configStore.set(modelId, newConfig);
                await this.persistConfig(modelId, newConfig);
                this.emit('configUpdated', modelId, newConfig);
                this.logConfigUpdate(modelId, newConfig);
            }
            catch (error) {
                this.handleError('Failed to update model config', error);
                throw error;
            }
        }
        async validateConfig(config) {
            const errors = [];
            const warnings = [];
            // Validate required fields
            if (!this.validateRequiredFields(config, errors)) {
                return { isValid: false, errors, warnings };
            }
            // Validate numerical ranges
            this.validateNumericalRanges(config, errors, warnings);
            // Validate compatibility
            await this.validateCompatibility(config, errors, warnings);
            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };
        }
        validateRequiredFields(config, errors) {
            const requiredFields = ['contextLength', 'temperature', 'topP'];
            const missingFields = requiredFields.filter(field => config[field] === undefined);
            if (missingFields.length > 0) {
                errors.push(`Missing required fields: ${missingFields.join(', ')}`);
                return false;
            }
            return true;
        }
        validateNumericalRanges(config, errors, warnings) {
            // Temperature validation
            if (config.temperature !== undefined) {
                if (config.temperature < 0 || config.temperature > 2) {
                    errors.push('Temperature must be between 0 and 2');
                }
                else if (config.temperature > 1.5) {
                    warnings.push('High temperature values may lead to less focused outputs');
                }
            }
            // Top-p validation
            if (config.topP !== undefined) {
                if (config.topP < 0 || config.topP > 1) {
                    errors.push('Top-p must be between 0 and 1');
                }
            }
            // Context length validation
            if (config.contextLength !== undefined) {
                if (config.contextLength < 0) {
                    errors.push('Context length must be positive');
                }
                else if (config.contextLength > 32768) {
                    warnings.push('Very large context lengths may impact performance');
                }
            }
        }
        async validateCompatibility(config, errors, warnings) {
            // Memory requirement validation
            const estimatedMemory = this.estimateMemoryRequirement(config);
            const availableMemory = await this.getAvailableMemory();
            if (estimatedMemory > availableMemory) {
                errors.push('Configuration exceeds available system memory');
            }
            else if (estimatedMemory > availableMemory * 0.8) {
                warnings.push('Configuration may use most available memory');
            }
        }
        estimateMemoryRequirement(config) {
            // Basic memory estimation based on context length and model size
            const bytesPerToken = 4; // Approximate bytes per token
            const baseMemory = 512 * 1024 * 1024; // 512MB base memory
            return baseMemory + (config.contextLength || 2048) * bytesPerToken;
        }
        async getAvailableMemory() {
            // In a real implementation, this would check system memory
            return 16 * 1024 * 1024 * 1024; // Example: 16GB
        }
        createDefaultConfig() {
            return {
                contextLength: 2048,
                temperature: 0.7,
                topP: 0.95,
                frequencyPenalty: 0,
                presencePenalty: 0,
                stopSequences: [],
                maxTokens: undefined
            };
        }
        async persistConfig(modelId, config) {
            try {
                const key = `model-config-${modelId}`;
                await this.storage.update(key, config);
            }
            catch (error) {
                this.handleError('Failed to persist config', error);
            }
        }
        async loadPersistedConfigs() {
            try {
                const keys = await this.storage.keys();
                const configKeys = keys.filter(key => key.startsWith('model-config-'));
                for (const key of configKeys) {
                    const modelId = key.replace('model-config-', '');
                    const config = await this.storage.get(key);
                    if (config) {
                        this.configStore.set(modelId, config);
                    }
                }
                this.logConfigLoad(configKeys.length);
            }
            catch (error) {
                this.handleError('Failed to load persisted configs', error);
            }
        }
        logConfigUpdate(modelId, config) {
            this.outputChannel.appendLine('\nConfiguration Updated:');
            this.outputChannel.appendLine(`Model: ${modelId}`);
            this.outputChannel.appendLine(JSON.stringify(config, null, 2));
        }
        logConfigLoad(count) {
            this.outputChannel.appendLine(`\nLoaded ${count} model configurations`);
        }
        handleError(message, error) {
            this.logger.error('[ModelConfigManager]', message, error);
            this.emit('error', error);
            this.outputChannel.appendLine(`\nError: ${message}`);
            this.outputChannel.appendLine(error.stack || error.message);
        }
        dispose() {
            this.outputChannel.dispose();
            this.removeAllListeners();
            this.configStore.clear();
        }
    };
    return ModelConfigManager = _classThis;
})();
exports.ModelConfigManager = ModelConfigManager;
//# sourceMappingURL=ModelConfigManager.js.map