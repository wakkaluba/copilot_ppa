"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModelInfoService = void 0;
const events_1 = require("events");
const types_1 = require("../types");
const DEFAULT_CACHE_TTL = 3600000; // 1 hour
/**
 * Service for managing model information, discovery, and caching
 */
class LLMModelInfoService extends events_1.EventEmitter {
    modelCache = new Map();
    cacheTTL;
    updateInterval = null;
    updateFrequency = 300000; // 5 minutes
    constructor(cacheTTL = DEFAULT_CACHE_TTL) {
        super();
        this.cacheTTL = cacheTTL;
        this.startPeriodicUpdates();
    }
    /**
     * Get model information
     */
    async getModelInfo(modelId, forceRefresh = false) {
        const cached = this.modelCache.get(modelId);
        if (!forceRefresh && cached && !this.isCacheExpired(cached)) {
            return cached.info;
        }
        try {
            const info = await this.fetchModelInfo(modelId);
            if (info) {
                this.updateCache(modelId, info);
            }
            return info;
        }
        catch (error) {
            if (cached) {
                // Return stale cache on error
                return cached.info;
            }
            throw error;
        }
    }
    /**
     * Discover available models
     */
    async discoverModels(options = {}) {
        try {
            const models = await this.performModelDiscovery(options);
            // Update cache with discovered models
            for (const model of models) {
                this.updateCache(model.id, model);
            }
            this.emit(types_1.ModelEvent.ModelsDiscovered, {
                count: models.length,
                timestamp: Date.now()
            });
            return models;
        }
        catch (error) {
            console.error('Model discovery failed:', error);
            // Return cached models on error
            return Array.from(this.modelCache.values())
                .filter(cached => !this.isCacheExpired(cached))
                .map(cached => cached.info);
        }
    }
    /**
     * Query models with filtering and sorting
     */
    async queryModels(filter, sort) {
        let models = Array.from(this.modelCache.values())
            .filter(cached => !this.isCacheExpired(cached))
            .map(cached => cached.info);
        // Apply filters
        if (filter) {
            models = this.filterModels(models, filter);
        }
        // Apply sorting
        if (sort) {
            models = this.sortModels(models, sort);
        }
        return {
            models,
            total: models.length,
            timestamp: Date.now()
        };
    }
    /**
     * Update model information
     */
    async updateModelInfo(modelId, updates) {
        const current = await this.getModelInfo(modelId);
        if (!current) {
            throw new Error(`Model ${modelId} not found`);
        }
        const updated = { ...current, ...updates };
        this.updateCache(modelId, updated);
        const event = {
            modelId,
            oldInfo: current,
            newInfo: updated,
            changes: this.getInfoChanges(current, updated)
        };
        this.emit(types_1.ModelEvent.Updated, event);
    }
    /**
     * Clear model cache
     */
    clearCache(modelId) {
        if (modelId) {
            this.modelCache.delete(modelId);
        }
        else {
            this.modelCache.clear();
        }
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        const now = Date.now();
        const stats = {
            totalEntries: this.modelCache.size,
            validEntries: 0,
            expiredEntries: 0,
            averageAge: 0
        };
        let totalAge = 0;
        for (const cached of this.modelCache.values()) {
            const age = now - cached.timestamp;
            totalAge += age;
            if (this.isCacheExpired(cached)) {
                stats.expiredEntries++;
            }
            else {
                stats.validEntries++;
            }
        }
        if (stats.totalEntries > 0) {
            stats.averageAge = totalAge / stats.totalEntries;
        }
        return stats;
    }
    startPeriodicUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.updateInterval = setInterval(async () => {
            try {
                const expiredModels = Array.from(this.modelCache.entries())
                    .filter(([_, cached]) => this.isCacheExpired(cached))
                    .map(([id]) => id);
                for (const modelId of expiredModels) {
                    await this.getModelInfo(modelId, true);
                }
            }
            catch (error) {
                console.error('Periodic update failed:', error);
            }
        }, this.updateFrequency);
    }
    isCacheExpired(cached) {
        return Date.now() - cached.timestamp > this.cacheTTL;
    }
    updateCache(modelId, info) {
        this.modelCache.set(modelId, {
            info,
            timestamp: Date.now()
        });
    }
    async fetchModelInfo(modelId) {
        // This would integrate with the provider's model info retrieval
        throw new Error('Not implemented');
    }
    async performModelDiscovery(options) {
        // This would integrate with the provider's model discovery
        throw new Error('Not implemented');
    }
    filterModels(models, filter) {
        return models.filter(model => {
            if (filter.provider && model.provider !== filter.provider) {
                return false;
            }
            if (filter.type && model.type !== filter.type) {
                return false;
            }
            if (filter.minVersion && !this.checkVersion(model.version, filter.minVersion)) {
                return false;
            }
            if (filter.capabilities) {
                const hasCapabilities = filter.capabilities.every(cap => model.capabilities.includes(cap));
                if (!hasCapabilities) {
                    return false;
                }
            }
            if (filter.formats) {
                const hasFormats = filter.formats.every(format => model.supportedFormats?.includes(format));
                if (!hasFormats) {
                    return false;
                }
            }
            return true;
        });
    }
    sortModels(models, sort) {
        return [...models].sort((a, b) => {
            for (const { field, direction } of sort.criteria) {
                const multiplier = direction === 'desc' ? -1 : 1;
                switch (field) {
                    case 'name':
                        return multiplier * a.name.localeCompare(b.name);
                    case 'version':
                        return multiplier * this.compareVersions(a.version, b.version);
                    case 'provider':
                        return multiplier * a.provider.localeCompare(b.provider);
                    default:
                        return 0;
                }
            }
            return 0;
        });
    }
    compareVersions(a, b) {
        if (!a && !b)
            return 0;
        if (!a)
            return -1;
        if (!b)
            return 1;
        const [majorA, minorA = 0] = a.split('.').map(Number);
        const [majorB, minorB = 0] = b.split('.').map(Number);
        if (majorA !== majorB) {
            return majorA - majorB;
        }
        return minorA - minorB;
    }
    checkVersion(actual, required) {
        if (!actual)
            return false;
        const [actualMajor, actualMinor = 0] = actual.split('.').map(Number);
        const [requiredMajor, requiredMinor = 0] = required.split('.').map(Number);
        if (actualMajor !== requiredMajor) {
            return actualMajor > requiredMajor;
        }
        return actualMinor >= requiredMinor;
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
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.modelCache.clear();
        this.removeAllListeners();
    }
}
exports.LLMModelInfoService = LLMModelInfoService;
//# sourceMappingURL=LLMModelInfoService.js.map