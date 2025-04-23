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
exports.LLMModelManager = void 0;
const events_1 = require("events");
const inversify_1 = require("inversify");
const types_1 = require("../types");
// Update the code to use provider instead of providerId
const mapProviderField = (info) => ({
    ...info,
    providerId: info.provider // Map provider to providerId for backward compatibility
});
/**
 * Manages LLM model lifecycle, discovery, and runtime management
 */
let LLMModelManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var LLMModelManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LLMModelManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        providerRegistry;
        configManager;
        metricsService;
        telemetryService;
        models = new Map();
        activeModel = null;
        loadingModels = new Set();
        maxLoadAttempts;
        disposables = [];
        constructor(logger, providerRegistry, configManager, metricsService, telemetryService) {
            super();
            this.logger = logger;
            this.providerRegistry = providerRegistry;
            this.configManager = configManager;
            this.metricsService = metricsService;
            this.telemetryService = telemetryService;
            // Get max load attempts from config with default fallback
            const config = this.configManager.getConfig();
            this.maxLoadAttempts = config?.modelLoadRetries || 3;
            this.setupEventHandlers();
            this.logger.info('LLMModelManager initialized');
        }
        setupEventHandlers() {
            // Listen for provider registry events
            this.providerRegistry.on('providerAdded', this.handleProviderAdded.bind(this));
            this.providerRegistry.on('providerRemoved', this.handleProviderRemoved.bind(this));
            // Listen for metrics service events
            this.metricsService.on('metricsUpdated', this.handleMetricsUpdated.bind(this));
        }
        /**
         * Register a new model
         */
        registerModel(info) {
            try {
                // Validate model information
                this.validateModelInfo(info);
                const state = {
                    info,
                    status: 'inactive',
                    stats: {
                        totalRequests: 0,
                        successfulRequests: 0,
                        failedRequests: 0,
                        averageResponseTime: 0,
                        totalTokensUsed: 0,
                        lastError: null
                    },
                    lastUsed: 0,
                    loadAttempts: 0
                };
                this.models.set(info.id, state);
                const eventData = { modelId: info.id, info };
                this.emit(types_1.ModelEvents.Registered, eventData);
                this.telemetryService.sendEvent('model.registered', {
                    modelId: info.id,
                    provider: info.provider,
                    contextSize: info.contextSize
                });
                this.logger.info(`Model registered: ${info.id} (${info.name}) from provider ${info.provider}`);
            }
            catch (error) {
                this.handleError('Failed to register model', error, info?.id);
                throw error;
            }
        }
        /**
         * Load a model for use
         */
        async loadModel(modelId, options = {}) {
            const state = this.models.get(modelId);
            if (!state) {
                const error = new types_1.ModelLoadError(`Model ${modelId} not found`);
                this.handleError('Model not found during load attempt', error, modelId);
                return { success: false, error };
            }
            if (this.loadingModels.has(modelId)) {
                const error = new types_1.ModelLoadError(`Model ${modelId} is already loading`);
                this.handleError('Duplicate model load attempt', error, modelId);
                return { success: false, error };
            }
            if (state.loadAttempts >= this.maxLoadAttempts) {
                const error = new types_1.ModelLoadError(`Model ${modelId} failed to load after ${this.maxLoadAttempts} attempts`);
                this.handleError('Maximum load attempts exceeded', error, modelId);
                return { success: false, error };
            }
            // Start timing the operation for metrics
            const startTime = Date.now();
            try {
                this.loadingModels.add(modelId);
                state.status = 'loading';
                state.loadAttempts++;
                const loadEvent = {
                    modelId,
                    attempt: state.loadAttempts,
                    options
                };
                this.emit(types_1.ModelEvents.Loading, loadEvent);
                this.logger.info(`Loading model: ${modelId} (attempt ${state.loadAttempts})`);
                await this.performModelLoad(state.info, options);
                // Update model state
                state.status = 'active';
                this.activeModel = modelId;
                state.lastUsed = Date.now();
                const loadedEvent = { modelId, loadTimeMs: Date.now() - startTime };
                this.emit(types_1.ModelEvents.Loaded, loadedEvent);
                // Record successful load in telemetry
                this.telemetryService.sendEvent('model.loaded', {
                    modelId,
                    provider: state.info.provider,
                    loadTimeMs: Date.now() - startTime,
                    attempt: state.loadAttempts
                });
                this.logger.info(`Model loaded successfully: ${modelId} in ${Date.now() - startTime}ms`);
                return { success: true };
            }
            catch (error) {
                // Handle the error and update model state
                state.status = 'error';
                state.stats.lastError = error instanceof Error ? error : new Error(String(error));
                const errorEvent = {
                    modelId,
                    error: state.stats.lastError,
                    attempt: state.loadAttempts,
                    loadTimeMs: Date.now() - startTime
                };
                this.emit(types_1.ModelEvents.LoadError, errorEvent);
                // Record error in telemetry
                this.telemetryService.sendEvent('model.loadError', {
                    modelId,
                    provider: state.info.provider,
                    errorType: error.constructor.name,
                    attempt: state.loadAttempts,
                    message: error instanceof Error ? error.message : String(error)
                });
                const wrappedError = error instanceof types_1.ModelLoadError
                    ? error
                    : new types_1.ModelLoadError(`Failed to load model ${modelId}`, state.stats.lastError);
                this.handleError(`Failed to load model: ${modelId}`, wrappedError, modelId);
                return { success: false, error: wrappedError };
            }
            finally {
                this.loadingModels.delete(modelId);
            }
        }
        /**
         * Unload a model
         */
        async unloadModel(modelId) {
            const state = this.models.get(modelId);
            if (!state) {
                this.logger.warn(`Attempted to unload non-existent model: ${modelId}`);
                return { success: true };
            }
            if (state.status === 'unloading') {
                this.logger.info(`Model already unloading: ${modelId}`);
                return { success: true };
            }
            // Start timing the operation for metrics
            const startTime = Date.now();
            try {
                state.status = 'unloading';
                this.emit(types_1.ModelEvents.Unloading, { modelId });
                this.logger.info(`Unloading model: ${modelId}`);
                await this.performModelUnload(state.info);
                state.status = 'inactive';
                if (this.activeModel === modelId) {
                    this.activeModel = null;
                }
                const unloadedEvent = { modelId, unloadTimeMs: Date.now() - startTime };
                this.emit(types_1.ModelEvents.Unloaded, unloadedEvent);
                // Record successful unload in telemetry
                this.telemetryService.sendEvent('model.unloaded', {
                    modelId,
                    provider: state.info.provider,
                    unloadTimeMs: Date.now() - startTime
                });
                this.logger.info(`Model unloaded successfully: ${modelId} in ${Date.now() - startTime}ms`);
                return { success: true };
            }
            catch (error) {
                state.status = 'error';
                state.stats.lastError = error instanceof Error ? error : new Error(String(error));
                const errorEvent = {
                    modelId,
                    error: state.stats.lastError,
                    unloadTimeMs: Date.now() - startTime
                };
                this.emit(types_1.ModelEvents.UnloadError, errorEvent);
                // Record error in telemetry
                this.telemetryService.sendEvent('model.unloadError', {
                    modelId,
                    provider: state.info.provider,
                    errorType: error.constructor.name,
                    message: error instanceof Error ? error.message : String(error)
                });
                this.handleError(`Failed to unload model: ${modelId}`, error, modelId);
                return { success: false, error };
            }
        }
        /**
         * Update model information
         */
        async updateModel(modelId, updates) {
            try {
                const state = this.models.get(modelId);
                if (!state) {
                    const error = new Error(`Model ${modelId} not found`);
                    this.handleError('Model not found during update attempt', error, modelId);
                    return { success: false, error };
                }
                const oldInfo = { ...state.info };
                // Validate the updated information
                const updatedInfo = { ...state.info, ...updates };
                this.validateModelInfo(updatedInfo);
                // Apply the validated updates
                state.info = updatedInfo;
                const changes = this.getInfoChanges(oldInfo, state.info);
                const event = {
                    modelId,
                    oldInfo,
                    newInfo: state.info,
                    changes,
                    timestamp: Date.now()
                };
                this.emit(types_1.ModelEvents.Updated, event);
                // Record model update in telemetry
                this.telemetryService.sendEvent('model.updated', {
                    modelId,
                    provider: state.info.provider,
                    changedFields: Object.keys(changes)
                });
                this.logger.info(`Model updated: ${modelId}, changed fields: ${Object.keys(changes).join(', ')}`);
                return { success: true };
            }
            catch (error) {
                this.handleError(`Failed to update model: ${modelId}`, error, modelId);
                return { success: false, error };
            }
        }
        /**
         * Record model usage statistics
         */
        recordUsage(modelId, stats) {
            try {
                const state = this.models.get(modelId);
                if (!state) {
                    this.logger.warn(`Attempted to record usage for non-existent model: ${modelId}`);
                    return;
                }
                // Update stats with proper validation
                if (stats.totalRequests && stats.totalRequests > 0) {
                    state.stats.totalRequests += stats.totalRequests;
                }
                if (stats.successfulRequests && stats.successfulRequests > 0) {
                    state.stats.successfulRequests += stats.successfulRequests;
                }
                if (stats.failedRequests && stats.failedRequests > 0) {
                    state.stats.failedRequests += stats.failedRequests;
                }
                if (stats.totalTokensUsed && stats.totalTokensUsed > 0) {
                    state.stats.totalTokensUsed += stats.totalTokensUsed;
                }
                // Update average response time with protection against NaN
                if (stats.averageResponseTime && stats.averageResponseTime > 0) {
                    const totalResponses = state.stats.successfulRequests + state.stats.failedRequests;
                    if (totalResponses > 0) {
                        state.stats.averageResponseTime = ((state.stats.averageResponseTime * (totalResponses - 1)) +
                            stats.averageResponseTime) / totalResponses;
                    }
                }
                const statsEvent = {
                    modelId,
                    stats: { ...state.stats },
                    timestamp: Date.now()
                };
                this.emit(types_1.ModelEvents.StatsUpdated, statsEvent);
                // Update the metrics service
                this.metricsService.updateModelMetrics(modelId, state.stats);
                // Periodically send aggregate stats to telemetry (to avoid too many events)
                if (state.stats.totalRequests % 10 === 0) {
                    this.telemetryService.sendEvent('model.usageStats', {
                        modelId,
                        provider: state.info.provider,
                        totalRequests: state.stats.totalRequests,
                        successRate: state.stats.totalRequests > 0
                            ? state.stats.successfulRequests / state.stats.totalRequests
                            : 0,
                        averageResponseTime: state.stats.averageResponseTime,
                        totalTokensUsed: state.stats.totalTokensUsed
                    });
                }
            }
            catch (error) {
                this.handleError(`Failed to record usage for model: ${modelId}`, error, modelId);
            }
        }
        /**
         * Get model information
         */
        getModelInfo(modelId) {
            try {
                return this.models.get(modelId)?.info;
            }
            catch (error) {
                this.handleError(`Failed to get model info: ${modelId}`, error, modelId);
                return undefined;
            }
        }
        /**
         * Get model status
         */
        getModelStatus(modelId) {
            try {
                return this.models.get(modelId)?.status;
            }
            catch (error) {
                this.handleError(`Failed to get model status: ${modelId}`, error, modelId);
                return undefined;
            }
        }
        /**
         * Get model statistics
         */
        getModelStats(modelId) {
            try {
                return this.models.get(modelId)?.stats;
            }
            catch (error) {
                this.handleError(`Failed to get model stats: ${modelId}`, error, modelId);
                return undefined;
            }
        }
        /**
         * Get all registered models
         */
        getModels() {
            try {
                return Array.from(this.models.values()).map(state => state.info);
            }
            catch (error) {
                this.handleError('Failed to get models list', error);
                return [];
            }
        }
        /**
         * Get active model
         */
        getActiveModel() {
            try {
                return this.activeModel ? this.getModelInfo(this.activeModel) : undefined;
            }
            catch (error) {
                this.handleError('Failed to get active model', error);
                return undefined;
            }
        }
        /**
         * Check if a model is loaded
         */
        isModelLoaded(modelId) {
            try {
                return this.models.get(modelId)?.status === 'active';
            }
            catch (error) {
                this.handleError(`Failed to check if model is loaded: ${modelId}`, error, modelId);
                return false;
            }
        }
        /**
         * Get total count of registered models
         */
        getModelCount() {
            return this.models.size;
        }
        /**
         * Get count of models by status
         */
        getModelCountByStatus() {
            const counts = {
                'inactive': 0,
                'loading': 0,
                'active': 0,
                'error': 0,
                'unloading': 0
            };
            for (const state of this.models.values()) {
                counts[state.status]++;
            }
            return counts;
        }
        /**
         * Clear model registration
         */
        clearModel(modelId) {
            try {
                const state = this.models.get(modelId);
                if (!state) {
                    return false;
                }
                // Ensure model is unloaded first
                if (state.status === 'active' || state.status === 'loading') {
                    this.logger.warn(`Attempting to clear an active or loading model: ${modelId}. ` +
                        'Model should be unloaded first.');
                }
                // Remove model from registry
                const result = this.models.delete(modelId);
                if (result) {
                    this.emit(types_1.ModelEvents.Removed, { modelId, info: state.info });
                    this.logger.info(`Model cleared from registry: ${modelId}`);
                    this.telemetryService.sendEvent('model.removed', {
                        modelId,
                        provider: state.info.provider
                    });
                }
                return result;
            }
            catch (error) {
                this.handleError(`Failed to clear model: ${modelId}`, error, modelId);
                return false;
            }
        }
        /**
         * Load model implementation
         */
        async performModelLoad(info, options) {
            // Get the provider for this model
            const provider = await this.providerRegistry.getProvider(info.provider);
            if (!provider) {
                throw new types_1.ModelLoadError(`Provider ${info.provider} not found for model ${info.id}`);
            }
            try {
                // Initialize provider-specific resources
                await provider.initializeModel(info, options);
                // Verify the model is ready
                const status = await provider.getModelStatus(info.id);
                if (status !== 'ready') {
                    throw new types_1.ModelInitError(`Model ${info.id} failed to initialize. Status: ${status}`);
                }
            }
            catch (error) {
                // Ensure consistent error handling and proper cleanup
                if (provider) {
                    try {
                        // Attempt cleanup even on initialization failure
                        await provider.cleanupModel(info.id);
                    }
                    catch (cleanupError) {
                        this.logger.error(`Failed to clean up after initialization error for model ${info.id}`, cleanupError);
                    }
                }
                // Re-throw the original error
                throw error;
            }
        }
        /**
         * Unload model implementation
         */
        async performModelUnload(info) {
            // Get the provider for this model
            const provider = await this.providerRegistry.getProvider(info.provider);
            if (!provider) {
                throw new Error(`Provider ${info.provider} not found for model ${info.id}`);
            }
            // Clean up provider-specific resources
            await provider.cleanupModel(info.id);
            // Verify the model is properly unloaded
            const status = await provider.getModelStatus(info.id);
            if (status !== 'inactive') {
                throw new Error(`Model ${info.id} failed to unload properly. Status: ${status}`);
            }
        }
        /**
         * Calculate the differences between old and new model info
         */
        getInfoChanges(oldInfo, newInfo) {
            const changes = {};
            for (const key of Object.keys(oldInfo)) {
                // Skip comparison of complex objects unless they're exactly the same reference
                if (typeof oldInfo[key] === 'object' || typeof newInfo[key] === 'object') {
                    if (JSON.stringify(oldInfo[key]) !== JSON.stringify(newInfo[key])) {
                        changes[key] = newInfo[key];
                    }
                }
                else if (oldInfo[key] !== newInfo[key]) {
                    changes[key] = newInfo[key];
                }
            }
            return changes;
        }
        /**
         * Validate model information
         */
        validateModelInfo(info) {
            const requiredFields = ['id', 'name', 'provider'];
            // Check required fields
            for (const field of requiredFields) {
                if (!info[field]) {
                    throw new Error(`Model validation failed: missing required field '${field}'`);
                }
            }
            // Validate model ID format
            if (typeof info.id === 'string' && !/^[a-zA-Z0-9-_.]+$/.test(info.id)) {
                throw new Error(`Model validation failed: invalid model ID format '${info.id}'`);
            }
            // Validate contextSize is a positive number if provided
            if (info.contextSize !== undefined &&
                (typeof info.contextSize !== 'number' || info.contextSize <= 0)) {
                throw new Error(`Model validation failed: invalid contextSize '${info.contextSize}'`);
            }
        }
        /**
         * Handle provider added event
         */
        handleProviderAdded(event) {
            this.logger.info(`LLM provider added: ${event.providerId}`);
        }
        /**
         * Handle provider removed event
         */
        handleProviderRemoved(event) {
            this.logger.info(`LLM provider removed: ${event.providerId}`);
            // Mark models from this provider as unavailable
            for (const [modelId, state] of this.models.entries()) {
                if (state.info.provider === event.providerId) {
                    if (state.status === 'active') {
                        this.logger.warn(`Provider for active model ${modelId} was removed. Unloading...`);
                        this.unloadModel(modelId).catch(error => this.handleError(`Failed to unload model ${modelId} during provider removal`, error, modelId));
                    }
                    this.updateModel(modelId, { isAvailable: false }).catch(error => this.handleError(`Failed to update model availability for ${modelId}`, error, modelId));
                }
            }
        }
        /**
         * Handle metrics updated event
         */
        handleMetricsUpdated(event) {
            // Synchronize any metrics updates from the metrics service
            this.logger.debug(`Metrics updated for model ${event.modelId}`);
        }
        /**
         * Centralized error handling
         */
        handleError(message, error, modelId) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`${message}: ${errorObj.message}`, errorObj);
            if (modelId) {
                // Update model error state if a model ID is provided
                const state = this.models.get(modelId);
                if (state) {
                    state.stats.lastError = errorObj;
                }
            }
            // Emit the error event for subscribers to handle
            this.emit('error', { message, error: errorObj, modelId });
        }
        /**
         * Dispose of resources
         */
        dispose() {
            try {
                this.logger.info('Disposing LLMModelManager');
                // Unload all active models
                const unloadPromises = [];
                for (const [modelId, state] of this.models.entries()) {
                    if (state.status === 'active') {
                        unloadPromises.push(this.unloadModel(modelId));
                    }
                }
                // Wait for all models to unload
                Promise.all(unloadPromises).catch(error => {
                    this.logger.error('Error while unloading models during disposal', error);
                }).finally(() => {
                    // Clean up data structures
                    this.models.clear();
                    this.loadingModels.clear();
                    this.activeModel = null;
                    // Dispose of all disposable resources
                    for (const disposable of this.disposables) {
                        disposable.dispose();
                    }
                    // Remove all listeners
                    this.removeAllListeners();
                    this.logger.info('LLMModelManager disposed');
                });
            }
            catch (error) {
                this.logger.error('Error during LLMModelManager disposal', error);
            }
        }
        /**
         * Continue model iteration process
         */
        async continueIteration(modelId) {
            const state = this.models.get(modelId);
            if (!state) {
                const error = new Error(`Model ${modelId} not found`);
                this.handleError('Model not found during iteration attempt', error, modelId);
                return { success: false, error };
            }
            // Don't continue if model is in a terminal state
            if (state.status === 'error' || state.status === 'unloaded') {
                return { success: false, error: new Error(`Cannot continue from ${state.status} state`) };
            }
            try {
                // Update state to indicate continuation
                const oldStatus = state.status;
                state.status = 'ready';
                const event = {
                    modelId,
                    oldStatus,
                    newStatus: state.status,
                    timestamp: Date.now()
                };
                this.emit(types_1.ModelEvents.StatusChanged, event);
                // Record state change in telemetry
                this.telemetryService.sendEvent('model.stateChanged', {
                    modelId,
                    provider: state.info.provider,
                    fromStatus: oldStatus,
                    toStatus: state.status
                });
                this.logger.info(`Model iteration continued: ${modelId} (${oldStatus} -> ${state.status})`);
                return { success: true };
            }
            catch (error) {
                state.status = 'error';
                state.stats.lastError = error instanceof Error ? error : new Error(String(error));
                this.handleError(`Failed to continue iteration: ${modelId}`, error, modelId);
                return { success: false, error };
            }
        }
        /**
         * Continue iteration for a model
         * @param modelId The ID of the model to continue iteration for
         * @returns Operation result indicating success or failure
         */
        async continueModelIteration(modelId) {
            try {
                if (!modelId) {
                    throw new Error('Model ID is required');
                }
                return await this.continueIteration(modelId);
            }
            catch (error) {
                this.handleError(`Failed to continue model iteration: ${modelId}`, error, modelId);
                return {
                    success: false,
                    error: error instanceof Error ? error : new Error(String(error))
                };
            }
        }
    };
    return LLMModelManager = _classThis;
})();
exports.LLMModelManager = LLMModelManager;
//# sourceMappingURL=LLMModelManager.js.map