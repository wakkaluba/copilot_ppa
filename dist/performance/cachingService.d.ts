/**
 * CachingService provides a general-purpose caching mechanism for operations
 * that are expensive to compute but rarely change
 */
export declare class CachingService {
    private static instance;
    private cache;
    private logger;
    private maxCacheSize;
    private cleanupIntervalId;
    private cacheStats;
    private readonly CLEANUP_THRESHOLD;
    private constructor();
    static getInstance(): CachingService;
    /**
     * Set the maximum number of items to cache
     */
    setMaxCacheSize(size: number): void;
    /**
     * Get a value from cache or compute it if not available
     */
    getOrCompute<T>(key: string, computeFunc: () => Promise<T>, ttlMs?: number): Promise<T>;
    /**
     * Manually set a cache value
     */
    set<T>(key: string, value: T, ttlMs?: number): void;
    /**
     * Check if a key exists in the cache and hasn't expired
     */
    has(key: string): boolean;
    /**
     * Get a value from the cache (returns undefined if not found or expired)
     */
    get<T>(key: string): T | undefined;
    /**
     * Remove a specific item from the cache
     */
    invalidate(key: string): boolean;
    /**
     * Clear all items from the cache
     */
    clearAll(): void;
    /**
     * Start the cleanup interval timer
     */
    private startCleanupInterval;
    /**
     * Remove all expired items from the cache
     */
    private removeExpiredItems;
    /**
     * Ensure the cache doesn't exceed the maximum size
     */
    private enforceMaxSize;
    private updateLRUOrder;
    /**
     * Dispose the service and clear any timers
     */
    dispose(): void;
    /**
     * Get cache metrics
     */
    getMetrics(): {
        hits: number;
        misses: number;
        evictions: number;
        totalMemoryBytes: number;
    };
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        hits: number;
        misses: number;
        evictions: number;
        size: number;
    };
    private estimateObjectSize;
    resetStats(): void;
}
