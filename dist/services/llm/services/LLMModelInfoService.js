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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModelInfoService = void 0;
const inversify_1 = require("inversify");
const ILogger_1 = require("../../../logging/ILogger");
const events_1 = require("events");
const types_1 = require("../types");
const LLMCacheManager_1 = require("../LLMCacheManager");
const LLMModelValidator_1 = require("./LLMModelValidator");
let LLMModelInfoService = class LLMModelInfoService extends events_1.EventEmitter {
    constructor(logger, cacheManager, validator) {
        super();
        this.logger = logger;
        this.modelCache = new Map();
        this.cacheManager = cacheManager;
        this.validator = validator;
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.cacheManager.on('modelInfoCached', this.handleCacheUpdate.bind(this));
        this.validator.on('validationComplete', this.handleValidationComplete.bind(this));
    }
    async getModelInfo(modelId, force = false) {
        try {
            // Check memory cache first
            if (!force && this.modelCache.has(modelId)) {
                return { ...this.modelCache.get(modelId) };
            }
            // Check persistent cache
            const cached = await this.cacheManager.getModelInfo(modelId);
            if (!force && cached) {
                this.modelCache.set(modelId, cached);
                return { ...cached };
            }
            // Load from provider
            const info = await this.loadModelInfo(modelId);
            await this.validateAndCache(info);
            return { ...info };
        }
        catch (error) {
            this.handleError(new Error(`Failed to get model info for ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }
    async loadModelInfo(modelId) {
        try {
            // This would integrate with the model provider to get fresh info
            throw new Error('Method not implemented');
        }
        catch (error) {
            this.handleError(new Error(`Failed to load model info for ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }
    async updateModelInfo(modelId, info) {
        try {
            const existing = await this.getModelInfo(modelId);
            const updated = { ...existing, ...info };
            await this.validateAndCache(updated);
            this.emit(types_1.ModelEvent.ModelUpdated, modelId);
        }
        catch (error) {
            this.handleError(new Error(`Failed to update model info for ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }
    async validateAndCache(info) {
        try {
            const validationResult = await this.validator.validateModel(info);
            if (!validationResult.isValid) {
                throw new Error(`Invalid model info: ${validationResult.issues.join(', ')}`);
            }
            this.modelCache.set(info.id, info);
            await this.cacheManager.cacheModelInfo(info.id, info);
            this.emit(types_1.ModelEvent.ModelInfoUpdated, {
                modelId: info.id,
                info
            });
        }
        catch (error) {
            this.handleError(new Error(`Validation failed for model ${info.id}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }
    async getAvailableModels() {
        return Array.from(this.modelCache.values()).map(info => ({ ...info }));
    }
    clearCache(modelId) {
        if (modelId) {
            this.modelCache.delete(modelId);
            this.cacheManager.clearModelInfo(modelId);
        }
        else {
            this.modelCache.clear();
            this.cacheManager.clearAllModelInfo();
        }
        this.emit('cacheCleared', modelId);
    }
    handleCacheUpdate(event) {
        this.modelCache.set(event.modelId, event.info);
        this.emit(types_1.ModelEvent.ModelInfoUpdated, event);
    }
    handleValidationComplete(event) {
        this.emit(types_1.ModelEvent.ValidationComplete, event);
    }
    handleError(error) {
        this.logger.error('[LLMModelInfoService]', error);
        this.emit('error', error);
    }
    dispose() {
        this.modelCache.clear();
        this.removeAllListeners();
    }
};
LLMModelInfoService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(LLMCacheManager_1.LLMCacheManager)),
    __param(2, (0, inversify_1.inject)(LLMModelValidator_1.LLMModelValidator)),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, LLMCacheManager_1.LLMCacheManager,
        LLMModelValidator_1.LLMModelValidator])
], LLMModelInfoService);
exports.LLMModelInfoService = LLMModelInfoService;
//# sourceMappingURL=LLMModelInfoService.js.map