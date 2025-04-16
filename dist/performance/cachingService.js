"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingService = void 0;
const logger_1 = require("../utils/logger");
/**
 * CachingService provides a general-purpose caching mechanism for operations
 * that are expensive to compute but rarely change
 */
class CachingService {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 100; // Default max items to store
        this.cleanupIntervalId = null;
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
        // Check if we have a valid cache entry
        const cachedItem = this.cache.get(key);
        const now = Date.now();
        if (cachedItem && (cachedItem.expiresAt === null || cachedItem.expiresAt > now)) {
            return cachedItem.value;
        }
        // Compute the value and cache it
        const value = await computeFunc();
        const expiresAt = ttlMs ? now + ttlMs : null;
        this.cache.set(key, {
            value,
            createdAt: now,
            expiresAt
        });
        this.enforceMaxSize();
        return value;
    }
    /**
     * Manually set a cache value
     */
    set(key, value, ttlMs) {
        const now = Date.now();
        const expiresAt = ttlMs ? now + ttlMs : null;
        this.cache.set(key, {
            value,
            createdAt: now,
            expiresAt
        });
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
        if (!cachedItem)
            return undefined;
        const now = Date.now();
        if (cachedItem.expiresAt !== null && cachedItem.expiresAt <= now) {
            this.cache.delete(key);
            return undefined;
        }
        return cachedItem.value;
    }
    /**
     * Remove a specific item from the cache
     */
    invalidate(key) {
        return this.cache.delete(key);
    }
    /**
     * Clear all items from the cache
     */
    clearAll() {
        this.cache.clear();
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
        for (const [key, item] of this.cache.entries()) {
            if (item.expiresAt !== null && item.expiresAt <= now) {
                this.cache.delete(key);
                expiredCount++;
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
        // If we exceed the max size, remove the oldest entries
        const entriesToDelete = this.cache.size - this.maxCacheSize;
        if (entriesToDelete <= 0)
            return;
        // Sort by creation time and remove oldest
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].createdAt - b[1].createdAt);
        for (let i = 0; i < entriesToDelete; i++) {
            this.cache.delete(entries[i][0]);
        }
        this.logger.log(`Removed ${entriesToDelete} oldest items from cache to maintain max size`);
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
    }
}
exports.CachingService = CachingService;
//# sourceMappingURL=cachingService.js.map