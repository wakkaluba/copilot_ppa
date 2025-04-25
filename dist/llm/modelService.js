"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelService = exports.ModelRecommendation = exports.HardwareSpecs = exports.LLMModelInfo = void 0;
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const types_1 = require("./types");
Object.defineProperty(exports, "LLMModelInfo", { enumerable: true, get: function () { return types_1.LLMModelInfo; } });
Object.defineProperty(exports, "HardwareSpecs", { enumerable: true, get: function () { return types_1.HardwareSpecs; } });
Object.defineProperty(exports, "ModelRecommendation", { enumerable: true, get: function () { return types_1.ModelRecommendation; } });
let ModelService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = vscode_1.EventEmitter;
    var ModelService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        discoveryService;
        metricsService;
        validationService;
        telemetryService;
        static instance;
        models = new Map();
        activeModelId;
        constructor(logger, discoveryService, metricsService, validationService, telemetryService) {
            super();
            this.logger = logger;
            this.discoveryService = discoveryService;
            this.metricsService = metricsService;
            this.validationService = validationService;
            this.telemetryService = telemetryService;
            this.setupEventListeners();
        }
        static getInstance(logger, discoveryService, metricsService, validationService, telemetryService) {
            if (!ModelService.instance) {
                ModelService.instance = new ModelService(logger, discoveryService, metricsService, validationService, telemetryService);
            }
            return ModelService.instance;
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
    return ModelService = _classThis;
})();
exports.ModelService = ModelService;
//# sourceMappingURL=modelService.js.map