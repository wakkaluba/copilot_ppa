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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConfigManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
let ModelConfigManager = class ModelConfigManager extends events_1.EventEmitter {
    constructor(logger, storage) {
        super();
        this.logger = logger;
        this.configStore = new Map();
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
exports.ModelConfigManager = ModelConfigManager;
exports.ModelConfigManager = ModelConfigManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __param(1, (0, inversify_1.inject)('GlobalState')),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, Object])
], ModelConfigManager);
//# sourceMappingURL=ModelConfigManager.js.map