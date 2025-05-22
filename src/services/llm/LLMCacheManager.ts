import { EventEmitter } from 'events';
import { ModelInfo, HealthCheckResponse } from './interfaces';

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
    data: T;
    expiry: number;
}

/**
 * Cache configuration
 */
interface CacheConfig {
    modelInfoTTL: number;
    healthCheckTTL: number;
    responseCacheTTL: number;
    maxCacheSize: number;
}

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
    modelInfoTTL: 5 * 60 * 1000, // 5 minutes
    healthCheckTTL: 30 * 1000, // 30 seconds
    responseCacheTTL: 60 * 60 * 1000, // 1 hour
    maxCacheSize: 1000
};

/**
 * Manages caching for LLM-related data
 */
export class LLMCacheManager extends EventEmitter {
    private static instance: LLMCacheManager;
    private readonly modelInfoCache: Map<string, CacheEntry<ModelInfo>> = new Map();
    private readonly healthCheckCache: Map<string, CacheEntry<HealthCheckResponse>> = new Map();
    private readonly responseCache: Map<string, CacheEntry<any>> = new Map();
    private readonly config: CacheConfig;

    private constructor(config: Partial<CacheConfig> = {}) {
        super();
        this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
        this.startCleanupInterval();
    }

    public static getInstance(config?: Partial<CacheConfig>): LLMCacheManager {
        if (!this.instance) {
            this.instance = new LLMCacheManager(config);
        }
        return this.instance;
    }

    /**
     * Cache model information
     */
    public cacheModelInfo(providerId: string, modelInfo: ModelInfo): void {
        this.modelInfoCache.set(this.getModelKey(providerId), {
            data: modelInfo,
            expiry: Date.now() + this.config.modelInfoTTL
        });
        this.emit('modelInfoCached', { providerId, modelInfo });
    }

    /**
     * Get cached model information
     */
    public getModelInfo(providerId: string): ModelInfo | undefined {
        const entry = this.modelInfoCache.get(this.getModelKey(providerId));
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return undefined;
    }

    /**
     * Cache health check response
     */
    public cacheHealthCheck(providerId: string, response: HealthCheckResponse): void {
        this.healthCheckCache.set(this.getHealthKey(providerId), {
            data: response,
            expiry: Date.now() + this.config.healthCheckTTL
        });
        this.emit('healthCheckCached', { providerId, response });
    }

    /**
     * Get cached health check response
     */
    public getHealthCheck(providerId: string): HealthCheckResponse | undefined {
        const entry = this.healthCheckCache.get(this.getHealthKey(providerId));
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return undefined;
    }

    /**
     * Cache a response
     */
    public cacheResponse(key: string, response: any, ttl?: number): void {
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
    public getResponse(key: string): any | undefined {
        const entry = this.responseCache.get(key);
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return undefined;
    }

    /**
     * Clear cache for a provider
     */
    public clearProviderCache(providerId: string): void {
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
    public clearAll(): void {
        this.modelInfoCache.clear();
        this.healthCheckCache.clear();
        this.responseCache.clear();
        this.emit('cacheCleared');
    }

    /**
     * Get cache statistics
     */
    public getStats() {
        return {
            modelInfoCount: this.modelInfoCache.size,
            healthCheckCount: this.healthCheckCache.size,
            responseCount: this.responseCache.size,
            config: { ...this.config }
        };
    }

    private getModelKey(providerId: string): string {
        return `model:${providerId}`;
    }

    private getHealthKey(providerId: string): string {
        return `health:${providerId}`;
    }

    private ensureCacheSize(): void {
        if (this.responseCache.size >= this.config.maxCacheSize) {
            // Remove oldest entries
            const entries = Array.from(this.responseCache.entries());
            entries.sort((a, b) => a[1].expiry - b[1].expiry);
            
            const toRemove = entries.slice(0, Math.floor(this.config.maxCacheSize * 0.2));
            toRemove.forEach(([key]) => this.responseCache.delete(key));
        }
    }

    private startCleanupInterval(): void {
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

    public dispose(): void {
        this.clearAll();
        this.removeAllListeners();
    }
}