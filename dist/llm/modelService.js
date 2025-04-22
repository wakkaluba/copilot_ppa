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
exports.ModelService = void 0;
const vscode = __importStar(require("vscode"));
const ModelDiscoveryService_1 = require("./services/ModelDiscoveryService");
const ModelMetricsService_1 = require("./services/ModelMetricsService");
const ModelValidationService_1 = require("./services/ModelValidationService");
/**
 * Orchestrates model management, discovery, validation, and metrics
 */
class ModelService {
    statusBarItem;
    discoveryService;
    metricsService;
    validationService;
    constructor(context) {
        // Initialize services
        this.metricsService = new ModelMetricsService_1.ModelMetricsService();
        this.validationService = new ModelValidationService_1.ModelValidationService();
        this.discoveryService = new ModelDiscoveryService_1.ModelDiscoveryService(this.metricsService, this.validationService);
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'copilot-ppa.configureModel';
        this.statusBarItem.tooltip = 'Configure LLM Model';
        // Register commands
        context.subscriptions.push(this.statusBarItem, this.discoveryService, this.metricsService, this.validationService, vscode.commands.registerCommand('copilot-ppa.getModelRecommendations', this.getModelRecommendations.bind(this)), vscode.commands.registerCommand('copilot-ppa.checkModelCompatibility', this.checkModelCompatibility.bind(this)));
        // Listen for model changes
        this.discoveryService.onDidChangeModels(() => this.updateStatusBar());
        // Initialize status bar
        this.updateStatusBar();
    }
    /**
     * Register a new model
     */
    async registerModel(model) {
        await this.discoveryService.registerModel(model);
    }
    /**
     * Get all registered models
     */
    getRegisteredModels() {
        return this.discoveryService.getRegisteredModels();
    }
    /**
     * Get model by ID
     */
    getModel(modelId) {
        return this.discoveryService.getModel(modelId);
    }
    /**
     * Get system-compatible models
     */
    async getModelRecommendations() {
        return this.discoveryService.getCompatibleModels();
    }
    /**
     * Check model compatibility
     */
    async checkModelCompatibility(modelId) {
        const model = this.discoveryService.getModel(modelId);
        if (!model) {
            return false;
        }
        const validation = await this.validationService.validateModel(model);
        return validation.isValid;
    }
    /**
     * Record performance metrics
     */
    recordMetrics(modelId, responseTime, tokens, error) {
        this.metricsService.recordMetrics(modelId, responseTime, tokens, error);
    }
    /**
     * Get model metrics
     */
    getModelMetrics(modelId) {
        return this.metricsService.getMetrics(modelId);
    }
    /**
     * Reset metrics for a model
     */
    resetModelMetrics(modelId) {
        this.metricsService.resetMetrics(modelId);
    }
    /**
     * Subscribe to metrics updates
     */
    onMetricsUpdated(callback) {
        this.metricsService.onMetricsUpdated(callback);
    }
    /**
     * Update status bar with current model info
     */
    updateStatusBar() {
        const models = this.discoveryService.getRegisteredModels();
        if (models.length === 0) {
            this.statusBarItem.text = '$(hubot) No Models';
            this.statusBarItem.tooltip = 'Click to configure LLM models';
        }
        else {
            const compatibleModels = models.filter(model => this.validationService.validateModel(model));
            this.statusBarItem.text = `$(hubot) Models: ${compatibleModels.length}/${models.length}`;
            this.statusBarItem.tooltip = 'Click to manage LLM models';
        }
        this.statusBarItem.show();
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.ModelService = ModelService;
//# sourceMappingURL=modelService.js.map