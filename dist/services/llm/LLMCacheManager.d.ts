import { EventEmitter } from 'events';
import { ModelInfo, HealthCheckResponse } from './interfaces';
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
 * Manages caching for LLM-related data
 */
export declare class LLMCacheManager extends EventEmitter {
    private static instance;
    private readonly modelInfoCache;
    private readonly healthCheckCache;
    private readonly responseCache;
    private readonly config;
    private constructor();
    static getInstance(config?: Partial<CacheConfig>): LLMCacheManager;
    /**
     * Cache model information
     */
    cacheModelInfo(providerId: string, modelInfo: ModelInfo): void;
    /**
     * Get cached model information
     */
    getModelInfo(providerId: string): ModelInfo | undefined;
    /**
     * Cache health check response
     */
    cacheHealthCheck(providerId: string, response: HealthCheckResponse): void;
    /**
     * Get cached health check response
     */
    getHealthCheck(providerId: string): HealthCheckResponse | undefined;
    /**
     * Cache a response
     */
    cacheResponse(key: string, response: any, ttl?: number): void;
    /**
     * Get a cached response
     */
    getResponse(key: string): any | undefined;
    /**
     * Clear cache for a provider
     */
    clearProviderCache(providerId: string): void;
    /**
     * Clear all caches
     */
    clearAll(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        modelInfoCount: number;
        healthCheckCount: number;
        responseCount: number;
        config: {
            modelInfoTTL: number;
            healthCheckTTL: number;
            responseCacheTTL: number;
            maxCacheSize: number;
        };
    };
    private getModelKey;
    private getHealthKey;
    private ensureCacheSize;
    private startCleanupInterval;
    dispose(): void;
}
export {};
