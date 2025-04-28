"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ModelService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelService = exports.ModelRecommendation = exports.HardwareSpecs = void 0;
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const types_1 = require("./types");
Object.defineProperty(exports, "HardwareSpecs", { enumerable: true, get: function () { return types_1.HardwareSpecs; } });
Object.defineProperty(exports, "ModelRecommendation", { enumerable: true, get: function () { return types_1.ModelRecommendation; } });
const ModelDiscoveryService_1 = require("./services/ModelDiscoveryService");
const ModelMetricsService_1 = require("./services/ModelMetricsService");
const ModelValidationService_1 = require("./services/ModelValidationService");
const TelemetryService_1 = require("../services/TelemetryService");
let ModelService = ModelService_1 = class ModelService extends vscode_1.EventEmitter {
    constructor(logger, discoveryService, metricsService, validationService, telemetryService) {
        super();
        this.logger = logger;
        this.discoveryService = discoveryService;
        this.metricsService = metricsService;
        this.validationService = validationService;
        this.telemetryService = telemetryService;
        this.models = new Map();
        this.setupEventListeners();
    }
    static getInstance(logger, discoveryService, metricsService, validationService, telemetryService) {
        if (!ModelService_1.instance) {
            ModelService_1.instance = new ModelService_1(logger, discoveryService, metricsService, validationService, telemetryService);
        }
        return ModelService_1.instance;
    }
    setupEventListeners() {
        this.discoveryService.on('modelFound', this.handleModelFound.bind(this));
        this.metricsService.on('metricsUpdated', this.handleMetricsUpdated.bind(this));
        this.validationService.on('validationComplete', this.handleValidationComplete.bind(this));
    }
    async initialize() {
        try {
            await this.discoveryService.startDiscovery();
            this.telemetryService.sendEvent('modelService.initialized');
        }
        catch (error) {
            this.handleError(new Error(`Failed to initialize model service: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
    async getModelInfo(modelId) {
        const model = this.models.get(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        return { ...model };
    }
    async validateModel(modelId) {
        try {
            const model = await this.getModelInfo(modelId);
            const result = await this.validationService.validateModel(model);
            this.telemetryService.sendEvent('modelService.validation', {
                modelId,
                isValid: result.isValid,
                issueCount: result.issues.length
            });
            return result;
        }
        catch (error) {
            this.handleError(new Error(`Failed to validate model ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }
    async getModelMetrics(modelId) {
        try {
            return await this.metricsService.getMetrics(modelId);
        }
        catch (error) {
            this.handleError(new Error(`Failed to get metrics for model ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }
    async setActiveModel(modelId) {
        try {
            const model = await this.getModelInfo(modelId);
            const validationResult = await this.validateModel(modelId);
            if (!validationResult.isValid) {
                throw new Error(`Model ${modelId} validation failed: ${validationResult.issues.join(', ')}`);
            }
            this.activeModelId = modelId;
            this.emit(types_1.ModelEvent.ActiveModelChanged, modelId);
            this.telemetryService.sendEvent('modelService.activeModelChanged', {
                modelId,
                provider: model.provider
            });
        }
        catch (error) {
            this.handleError(new Error(`Failed to set active model ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }
    getActiveModelId() {
        return this.activeModelId;
    }
    async updateModelConfig(modelId, config) {
        try {
            const model = await this.getModelInfo(modelId);
            Object.assign(model.config, config);
            this.models.set(modelId, model);
            this.emit(types_1.ModelEvent.ModelUpdated, modelId);
            this.telemetryService.sendEvent('modelService.configUpdated', {
                modelId,
                configKeys: Object.keys(config)
            });
        }
        catch (error) {
            this.handleError(new Error(`Failed to update config for model ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }
    getAvailableModels() {
        return Array.from(this.models.values()).map(model => ({ ...model }));
    }
    handleModelFound(modelInfo) {
        this.models.set(modelInfo.id, modelInfo);
        this.emit(types_1.ModelEvent.ModelRegistered, modelInfo.id);
    }
    handleMetricsUpdated(modelId, metrics) {
        this.emit(types_1.ModelEvent.MetricsUpdated, { modelId, metrics });
    }
    handleValidationComplete(modelId, result) {
        this.emit(types_1.ModelEvent.ValidationUpdated, { modelId, result });
    }
    handleError(error) {
        this.logger.error('[ModelService]', error);
        this.emit('error', error);
        this.telemetryService.sendEvent('modelService.error', {
            error: error.message
        });
    }
    dispose() {
        this.discoveryService.dispose();
        this.metricsService.dispose();
        this.validationService.dispose();
        this.removeAllListeners();
    }
};
exports.ModelService = ModelService;
exports.ModelService = ModelService = ModelService_1 = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelDiscoveryService_1.ModelDiscoveryService)),
    __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __param(3, (0, inversify_1.inject)(ModelValidationService_1.ModelValidationService)),
    __param(4, (0, inversify_1.inject)(TelemetryService_1.TelemetryService)),
    __metadata("design:paramtypes", [Object, ModelDiscoveryService_1.ModelDiscoveryService,
        ModelMetricsService_1.ModelMetricsService,
        ModelValidationService_1.ModelValidationService, typeof (_a = typeof TelemetryService_1.TelemetryService !== "undefined" && TelemetryService_1.TelemetryService) === "function" ? _a : Object])
], ModelService);
//# sourceMappingURL=modelService.js.map