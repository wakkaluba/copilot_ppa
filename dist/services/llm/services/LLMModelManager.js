"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModelManager = void 0;
const events_1 = require("events");
const types_1 = require("../types");
/**
 * Manages LLM model lifecycle, discovery, and runtime management
 */
class LLMModelManager extends events_1.EventEmitter {
    models = new Map();
    activeModel = null;
    loadingModels = new Set();
    maxLoadAttempts = 3;
    /**
     * Register a new model
     */
    registerModel(info) {
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
        this.emit(types_1.ModelEvent.Registered, { modelId: info.id, info });
    }
    /**
     * Load a model for use
     */
    async loadModel(modelId, options = {}) {
        const state = this.models.get(modelId);
        if (!state) {
            throw new types_1.ModelLoadError(`Model ${modelId} not found`);
        }
        if (this.loadingModels.has(modelId)) {
            throw new types_1.ModelLoadError(`Model ${modelId} is already loading`);
        }
        if (state.loadAttempts >= this.maxLoadAttempts) {
            throw new types_1.ModelLoadError(`Model ${modelId} failed to load after ${this.maxLoadAttempts} attempts`);
        }
        try {
            this.loadingModels.add(modelId);
            state.status = 'loading';
            state.loadAttempts++;
            this.emit(types_1.ModelEvent.Loading, {
                modelId,
                attempt: state.loadAttempts
            });
            await this.performModelLoad(state.info, options);
            state.status = 'active';
            this.activeModel = modelId;
            state.lastUsed = Date.now();
            this.emit(types_1.ModelEvent.Loaded, { modelId });
        }
        catch (error) {
            state.status = 'error';
            state.stats.lastError = error instanceof Error ? error : new Error(String(error));
            this.emit(types_1.ModelEvent.LoadError, {
                modelId,
                error: state.stats.lastError,
                attempt: state.loadAttempts
            });
            throw new types_1.ModelLoadError(`Failed to load model ${modelId}`, state.stats.lastError);
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
        if (!state)
            return;
        if (state.status === 'unloading')
            return;
        try {
            state.status = 'unloading';
            this.emit(types_1.ModelEvent.Unloading, { modelId });
            await this.performModelUnload(state.info);
            state.status = 'inactive';
            if (this.activeModel === modelId) {
                this.activeModel = null;
            }
            this.emit(types_1.ModelEvent.Unloaded, { modelId });
        }
        catch (error) {
            state.status = 'error';
            state.stats.lastError = error instanceof Error ? error : new Error(String(error));
            this.emit(types_1.ModelEvent.UnloadError, {
                modelId,
                error: state.stats.lastError
            });
            throw error;
        }
    }
    /**
     * Update model information
     */
    async updateModel(modelId, updates) {
        const state = this.models.get(modelId);
        if (!state) {
            throw new Error(`Model ${modelId} not found`);
        }
        const oldInfo = { ...state.info };
        state.info = { ...state.info, ...updates };
        const event = {
            modelId,
            oldInfo,
            newInfo: state.info,
            changes: this.getInfoChanges(oldInfo, state.info)
        };
        this.emit(types_1.ModelEvent.Updated, event);
    }
    /**
     * Record model usage statistics
     */
    recordUsage(modelId, stats) {
        const state = this.models.get(modelId);
        if (!state)
            return;
        // Update stats
        if (stats.totalRequests) {
            state.stats.totalRequests += stats.totalRequests;
        }
        if (stats.successfulRequests) {
            state.stats.successfulRequests += stats.successfulRequests;
        }
        if (stats.failedRequests) {
            state.stats.failedRequests += stats.failedRequests;
        }
        if (stats.totalTokensUsed) {
            state.stats.totalTokensUsed += stats.totalTokensUsed;
        }
        // Update average response time
        if (stats.averageResponseTime) {
            const totalResponses = state.stats.successfulRequests + state.stats.failedRequests;
            state.stats.averageResponseTime = ((state.stats.averageResponseTime * (totalResponses - 1)) +
                stats.averageResponseTime) / totalResponses;
        }
        this.emit(types_1.ModelEvent.StatsUpdated, {
            modelId,
            stats: { ...state.stats }
        });
    }
    /**
     * Get model information
     */
    getModelInfo(modelId) {
        return this.models.get(modelId)?.info;
    }
    /**
     * Get model status
     */
    getModelStatus(modelId) {
        return this.models.get(modelId)?.status;
    }
    /**
     * Get model statistics
     */
    getModelStats(modelId) {
        return this.models.get(modelId)?.stats;
    }
    /**
     * Get all registered models
     */
    getModels() {
        return Array.from(this.models.values()).map(state => state.info);
    }
    /**
     * Get active model
     */
    getActiveModel() {
        return this.activeModel ? this.getModelInfo(this.activeModel) : undefined;
    }
    /**
     * Check if a model is loaded
     */
    isModelLoaded(modelId) {
        return this.models.get(modelId)?.status === 'active';
    }
    async performModelLoad(info, options) {
        // This would integrate with the provider's model loading mechanism
        throw new Error('Not implemented');
    }
    async performModelUnload(info) {
        // This would integrate with the provider's model unloading mechanism
        throw new Error('Not implemented');
    }
    getInfoChanges(oldInfo, newInfo) {
        const changes = {};
        for (const key of Object.keys(oldInfo)) {
            if (oldInfo[key] !== newInfo[key]) {
                changes[key] = newInfo[key];
            }
        }
        return changes;
    }
    dispose() {
        for (const [modelId, state] of this.models) {
            if (state.status === 'active') {
                this.unloadModel(modelId).catch(console.error);
            }
        }
        this.models.clear();
        this.removeAllListeners();
    }
}
exports.LLMModelManager = LLMModelManager;
//# sourceMappingURL=LLMModelManager.js.map