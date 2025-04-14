import * as vscode from 'vscode';
import { Logger } from '../utils/logger';

/**
 * Interface for cache items to track creation and expiration time
 */
interface CacheItem<T> {
    value: T;
    createdAt: number;
    expiresAt: number | null; // null means no expiration
}

/**
 * CachingService provides a general-purpose caching mechanism for operations
 * that are expensive to compute but rarely change
 */
export class CachingService {
    private static instance: CachingService;
    private cache: Map<string, CacheItem<any>> = new Map();
    private logger: Logger;
    private maxCacheSize: number = 100; // Default max items to store
    private cleanupIntervalId: NodeJS.Timeout | null = null;
    
    private constructor() {
        this.logger = Logger.getInstance();
        // Start periodic cleanup every 5 minutes
        this.startCleanupInterval(5 * 60 * 1000);
    }
    
    public static getInstance(): CachingService {
        if (!CachingService.instance) {
            CachingService.instance = new CachingService();
        }
        return CachingService.instance;
    }
    
    /**
     * Set the maximum number of items to cache
     */
    public setMaxCacheSize(size: number): void {
        this.maxCacheSize = size;
        this.enforceMaxSize();
    }
    
    /**
     * Get a value from cache or compute it if not available
     */
    public async getOrCompute<T>(
        key: string, 
        computeFunc: () => Promise<T>, 
        ttlMs?: number
    ): Promise<T> {
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
    public set<T>(key: string, value: T, ttlMs?: number): void {
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
    public has(key: string): boolean {
        const cachedItem = this.cache.get(key);
        if (!cachedItem) return false;
        
        const now = Date.now();
        return cachedItem.expiresAt === null || cachedItem.expiresAt > now;
    }
    
    /**
     * Get a value from the cache (returns undefined if not found or expired)
     */
    public get<T>(key: string): T | undefined {
        const cachedItem = this.cache.get(key);
        if (!cachedItem) return undefined;
        
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
    public invalidate(key: string): boolean {
        return this.cache.delete(key);
    }
    
    /**
     * Clear all items from the cache
     */
    public clearAll(): void {
        this.cache.clear();
        this.logger.log('Cache cleared');
    }
    
    /**
     * Start the cleanup interval timer
     */
    private startCleanupInterval(intervalMs: number): void {
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
    private removeExpiredItems(): void {
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
    private enforceMaxSize(): void {
        if (this.cache.size <= this.maxCacheSize) return;
        
        // If we exceed the max size, remove the oldest entries
        const entriesToDelete = this.cache.size - this.maxCacheSize;
        if (entriesToDelete <= 0) return;
        
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
    public dispose(): void {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
        }
        this.cache.clear();
    }
}
