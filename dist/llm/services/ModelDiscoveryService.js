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
exports.ModelDiscoveryService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Service for discovering and managing LLM models
 */
class ModelDiscoveryService {
    metricsService;
    validationService;
    outputChannel;
    modelRegistry = new Map();
    eventEmitter = new vscode.EventEmitter();
    constructor(metricsService, validationService) {
        this.metricsService = metricsService;
        this.validationService = validationService;
        this.outputChannel = vscode.window.createOutputChannel('LLM Models');
    }
    /**
     * Register a model with the discovery service
     */
    async registerModel(model) {
        try {
            const startTime = Date.now();
            // Validate model before registration
            const validation = await this.validationService.validateModel(model);
            if (!validation.isValid) {
                this.outputChannel.appendLine(`Model ${model.id} failed validation: ${validation.issues.join(', ')}`);
                this.metricsService.recordMetrics(model.id, Date.now() - startTime, 0, true);
                return;
            }
            this.modelRegistry.set(model.id, model);
            this.eventEmitter.fire();
            this.outputChannel.appendLine(`Registered model ${model.id}`);
            // Record successful registration
            this.metricsService.recordMetrics(model.id, Date.now() - startTime, 0);
        }
        catch (error) {
            this.outputChannel.appendLine(`Error registering model ${model.id}: ${error}`);
            this.metricsService.recordMetrics(model.id, 0, 0, true);
            throw error;
        }
    }
    /**
     * Get all registered models
     */
    getRegisteredModels() {
        return Array.from(this.modelRegistry.values());
    }
    /**
     * Get model by ID
     */
    getModel(modelId) {
        return this.modelRegistry.get(modelId);
    }
    /**
     * Remove a model from the registry
     */
    unregisterModel(modelId) {
        const result = this.modelRegistry.delete(modelId);
        if (result) {
            this.eventEmitter.fire();
            this.outputChannel.appendLine(`Unregistered model ${modelId}`);
        }
        return result;
    }
    /**
     * Event fired when the model registry changes
     */
    get onDidChangeModels() {
        return this.eventEmitter.event;
    }
    /**
     * Get models that are compatible with the system
     */
    async getCompatibleModels() {
        const models = this.getRegisteredModels();
        const compatibleModels = [];
        for (const model of models) {
            const validation = await this.validationService.validateModel(model);
            if (validation.isValid) {
                compatibleModels.push(model);
            }
        }
        return compatibleModels;
    }
    dispose() {
        this.outputChannel.dispose();
        this.eventEmitter.dispose();
    }
}
exports.ModelDiscoveryService = ModelDiscoveryService;
//# sourceMappingURL=ModelDiscoveryService.js.map