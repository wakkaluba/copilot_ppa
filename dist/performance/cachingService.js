"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingService = void 0;
const logger_1 = require("../utils/logger");
/**
 * CachingService provides a general-purpose caching mechanism for operations
 * that are expensive to compute but rarely change
 */
class CachingService {
    static instance;
    cache = new Map();
    logger;
    maxCacheSize = 100; // Default max items to store
    cleanupIntervalId = null;
    cacheStats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalMemoryBytes: 0
    };
    CLEANUP_THRESHOLD = 0.1; // Only cleanup when 10% over limit
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        // Start periodic cleanup every 5 minutes
        this.startCleanupInterval(5 * 60 * 1000);
    }
    static getInstance() {
        if (!CachingService.instance) {
            CachingService.instance = new CachingService();
        }
        return CachingService.instance;
    }
    /**
     * Set the maximum number of items to cache
     */
    setMaxCacheSize(size) {
        this.maxCacheSize = size;
        this.enforceMaxSize();
    }
    /**
     * Get a value from cache or compute it if not available
     */
    async getOrCompute(key, computeFunc, ttlMs) {
        try {
            // Check cache first
            const cachedValue = this.get(key);
            if (cachedValue !== undefined) {
                return cachedValue;
            }
            // Start performance tracking
            const startTime = performance.now();
            const value = await computeFunc();
            const duration = performance.now() - startTime;
            // Log slow computations
            if (duration > 1000) {
                this.logger.warn(`Slow cache computation for key ${key}: ${Math.round(duration)}ms`);
            }
            // Cache the computed value
            const expiresAt = ttlMs ? Date.now() + ttlMs : null;
            this.cache.set(key, {
                value,
                createdAt: Date.now(),
                expiresAt,
                accessCount: 0,
                lastAccessed: Date.now()
            });
            this.enforceMaxSize();
            return value;
        }
        catch (error) {
            this.logger.error(`Cache computation failed for key ${key}: ${error}`);
            throw error;
        }
    }
    /**
     * Manually set a cache value
     */
    set(key, value, ttlMs) {
        const now = Date.now();
        const expiresAt = ttlMs ? now + ttlMs : null;
        // Estimate memory size
        const estimatedSize = this.estimateObjectSize(value);
        this.cacheStats.totalMemoryBytes += estimatedSize;
        this.cache.set(key, {
            value,
            createdAt: now,
            lastAccessed: now,
            expiresAt,
            sizeBytes: estimatedSize
        });
        this.updateLRUOrder(key);
        this.enforceMaxSize();
    }
    /**
     * Check if a key exists in the cache and hasn't expired
     */
    has(key) {
        const cachedItem = this.cache.get(key);
        if (!cachedItem)
            return false;
        const now = Date.now();
        return cachedItem.expiresAt === null || cachedItem.expiresAt > now;
    }
    /**
     * Get a value from the cache (returns undefined if not found or expired)
     */
    get(key) {
        const cachedItem = this.cache.get(key);
        if (!cachedItem) {
            this.cacheStats.misses++;
            return undefined;
        }
        const now = Date.now();
        if (cachedItem.expiresAt !== null && cachedItem.expiresAt <= now) {
            this.cache.delete(key);
            this.cacheStats.evictions++;
            return undefined;
        }
        this.cacheStats.hits++;
        cachedItem.accessCount = (cachedItem.accessCount || 0) + 1;
        cachedItem.lastAccessed = now;
        return cachedItem.value;
    }
    /**
     * Remove a specific item from the cache
     */
    invalidate(key) {
        const result = this.cache.delete(key);
        if (result) {
            const lruIndex = this.lruList.indexOf(key);
            if (lruIndex > -1) {
                this.lruList.splice(lruIndex, 1);
            }
        }
        return result;
    }
    /**
     * Clear all items from the cache
     */
    clearAll() {
        this.cache.clear();
        this.lruList = [];
        this.logger.log('Cache cleared');
    }
    /**
     * Start the cleanup interval timer
     */
    startCleanupInterval(intervalMs) {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
        }
        this.cleanupIntervalId = setInterval(() => {
            this.removeExpiredItems();
        }, intervalMs);
    }
    /**
     * Remove all expired items from the cache
     */
    removeExpiredItems() {
        const now = Date.now();
        let expiredCount = 0;
        for (const key of [...this.cache.keys()]) {
            const item = this.cache.get(key);
            if (item?.expiresAt !== null && item?.expiresAt <= now) {
                this.cache.delete(key);
                const lruIndex = this.lruList.indexOf(key);
                if (lruIndex > -1) {
                    this.lruList.splice(lruIndex, 1);
                }
                expiredCount++;
                this.cacheStats.evictions++;
            }
        }
        if (expiredCount > 0) {
            this.logger.log(`Removed ${expiredCount} expired items from cache`);
        }
    }
    /**
     * Ensure the cache doesn't exceed the maximum size
     */
    enforceMaxSize() {
        if (this.cache.size <= this.maxCacheSize)
            return;
        // Use LRU (Least Recently Used) + frequency based eviction
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => {
            // Combine recency and frequency for scoring
            const scoreA = (a[1].lastAccessed || 0) + (a[1].accessCount || 0) * 1000;
            const scoreB = (b[1].lastAccessed || 0) + (b[1].accessCount || 0) * 1000;
            return scoreA - scoreB;
        });
        const entriesToDelete = this.cache.size - this.maxCacheSize;
        for (let i = 0; i < entriesToDelete; i++) {
            this.cache.delete(entries[i][0]);
        }
        this.logger.debug(`Cache evicted ${entriesToDelete} items using LRU+frequency strategy`);
    }
    updateLRUOrder(key) {
        const index = this.lruList.indexOf(key);
        if (index > -1) {
            this.lruList.splice(index, 1);
        }
        this.lruList.unshift(key);
    }
    /**
     * Dispose the service and clear any timers
     */
    dispose() {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
        }
        this.cache.clear();
        this.lruList = [];
    }
    /**
     * Get cache metrics
     */
    getMetrics() {
        return { ...this.cacheStats };
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            ...this.cacheStats,
            size: this.cache.size
        };
    }
    estimateObjectSize(obj) {
        const seen = new WeakSet();
        const estimate = (value) => {
            if (value === null || value === undefined)
                return 0;
            if (typeof value !== 'object')
                return 8; // Primitive size approximation
            if (seen.has(value))
                return 0; // Handle circular references
            seen.add(value);
            let size = 0;
            if (Array.isArray(value)) {
                size = value.reduce((acc, item) => acc + estimate(item), 0);
            }
            else {
                for (const key in value) {
                    if (Object.prototype.hasOwnProperty.call(value, key)) {
                        size += key.length * 2; // UTF-16 characters
                        size += estimate(value[key]);
                    }
                }
            }
            return size;
        };
        return estimate(obj);
    }
    resetStats() {
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalMemoryBytes: 0
        };
    }
}
exports.CachingService = CachingService;
//# sourceMappingURL=cachingService.js.map