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
exports.LLMModelInfoService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
let LLMModelInfoService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var LLMModelInfoService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LLMModelInfoService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        modelCache = new Map();
        cacheManager;
        validator;
        constructor(logger, cacheManager, validator) {
            super();
            this.logger = logger;
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
    return LLMModelInfoService = _classThis;
})();
exports.LLMModelInfoService = LLMModelInfoService;
//# sourceMappingURL=LLMModelInfoService.js.map