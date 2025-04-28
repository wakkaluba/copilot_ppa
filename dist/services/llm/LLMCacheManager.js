"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMCacheManager = void 0;
const events_1 = require("events");
/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG = {
    modelInfoTTL: 5 * 60 * 1000, // 5 minutes
    healthCheckTTL: 30 * 1000, // 30 seconds
    responseCacheTTL: 60 * 60 * 1000, // 1 hour
    maxCacheSize: 1000
};
/**
 * Manages caching for LLM-related data
 */
class LLMCacheManager extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.modelInfoCache = new Map();
        this.healthCheckCache = new Map();
        this.responseCache = new Map();
        this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
        this.startCleanupInterval();
    }
    static getInstance(config) {
        if (!this.instance) {
            this.instance = new LLMCacheManager(config);
        }
        return this.instance;
    }
    /**
     * Cache model information
     */
    cacheModelInfo(providerId, modelInfo) {
        this.modelInfoCache.set(this.getModelKey(providerId), {
            data: modelInfo,
            expiry: Date.now() + this.config.modelInfoTTL
        });
        this.emit('modelInfoCached', { providerId, modelInfo });
    }
    /**
     * Get cached model information
     */
    getModelInfo(providerId) {
        const entry = this.modelInfoCache.get(this.getModelKey(providerId));
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return undefined;
    }
    /**
     * Cache health check response
     */
    cacheHealthCheck(providerId, response) {
        this.healthCheckCache.set(this.getHealthKey(providerId), {
            data: response,
            expiry: Date.now() + this.config.healthCheckTTL
        });
        this.emit('healthCheckCached', { providerId, response });
    }
    /**
     * Get cached health check response
     */
    getHealthCheck(providerId) {
        const entry = this.healthCheckCache.get(this.getHealthKey(providerId));
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return undefined;
    }
    /**
     * Cache a response
     */
    cacheResponse(key, response, ttl) {
        this.ensureCacheSize();
        this.responseCache.set(key, {
            data: response,
            expiry: Date.now() + (ttl || this.config.responseCacheTTL)
        });
        this.emit('responseCached', { key, response });
    }
    /**
     * Get a cached response
     */
    getResponse(key) {
        const entry = this.responseCache.get(key);
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return undefined;
    }
    /**
     * Clear cache for a provider
     */
    clearProviderCache(providerId) {
        const modelKey = this.getModelKey(providerId);
        const healthKey = this.getHealthKey(providerId);
        this.modelInfoCache.delete(modelKey);
        this.healthCheckCache.delete(healthKey);
        // Clear provider-specific responses
        const prefix = `${providerId}:`;
        for (const key of this.responseCache.keys()) {
            if (key.startsWith(prefix)) {
                this.responseCache.delete(key);
            }
        }
        this.emit('providerCacheCleared', providerId);
    }
    /**
     * Clear all caches
     */
    clearAll() {
        this.modelInfoCache.clear();
        this.healthCheckCache.clear();
        this.responseCache.clear();
        this.emit('cacheCleared');
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            modelInfoCount: this.modelInfoCache.size,
            healthCheckCount: this.healthCheckCache.size,
            responseCount: this.responseCache.size,
            config: { ...this.config }
        };
    }
    getModelKey(providerId) {
        return `model:${providerId}`;
    }
    getHealthKey(providerId) {
        return `health:${providerId}`;
    }
    ensureCacheSize() {
        if (this.responseCache.size >= this.config.maxCacheSize) {
            // Remove oldest entries
            const entries = Array.from(this.responseCache.entries());
            entries.sort((a, b) => a[1].expiry - b[1].expiry);
            const toRemove = entries.slice(0, Math.floor(this.config.maxCacheSize * 0.2));
            toRemove.forEach(([key]) => this.responseCache.delete(key));
        }
    }
    startCleanupInterval() {
        setInterval(() => {
            const now = Date.now();
            // Clean up expired entries
            for (const [key, entry] of this.modelInfoCache.entries()) {
                if (entry.expiry <= now) {
                    this.modelInfoCache.delete(key);
                }
            }
            for (const [key, entry] of this.healthCheckCache.entries()) {
                if (entry.expiry <= now) {
                    this.healthCheckCache.delete(key);
                }
            }
            for (const [key, entry] of this.responseCache.entries()) {
                if (entry.expiry <= now) {
                    this.responseCache.delete(key);
                }
            }
        }, 60000); // Clean up every minute
    }
    dispose() {
        this.clearAll();
        this.removeAllListeners();
    }
}
exports.LLMCacheManager = LLMCacheManager;
//# sourceMappingURL=LLMCacheManager.js.map