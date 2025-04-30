import { EventEmitter } from 'events';
/**
 * Rate limit configuration
 */
interface RateLimitConfig {
    requestsPerSecond: number;
    burstSize: number;
    maxQueueSize: number;
}
/**
 * Manages request rate limiting for LLM providers
 */
export declare class RequestRateLimiter extends EventEmitter {
    private static instance;
    private buckets;
    private queues;
    private configs;
    private constructor();
    static getInstance(): RequestRateLimiter;
    /**
     * Configure rate limiting for a provider
     */
    configureProvider(providerId: string, config: Partial<RateLimitConfig>): void;
    /**
     * Acquire permission to make a request
     */
    acquireToken(providerId: string, timeout?: number): Promise<void>;
    /**
     * Release tokens back to the bucket (for error cases)
     */
    releaseToken(providerId: string): void;
    /**
     * Get current rate limit status
     */
    getStatus(providerId: string): {
        availableTokens: number;
        queueLength: number;
        config: {
            requestsPerSecond: number;
            burstSize: number;
            maxQueueSize: number;
        };
    };
    private getOrCreateBucket;
    private tryAcquireToken;
    private queueRequest;
    private processQueue;
    /**
     * Clear rate limiting state for a provider
     */
    clearProvider(providerId: string): void;
    dispose(): void;
}
export {};
