import { EventEmitter } from 'events';
import { ProviderError } from './errors';

/**
 * Rate limit configuration
 */
export interface IRateLimitConfig {
    requestsPerSecond: number;
    burstSize: number;
    maxQueueSize: number;
}

/**
 * Token bucket state
 */
interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

/**
 * Default rate limit configuration
 */
const DEFAULT_RATE_LIMIT_CONFIG: IRateLimitConfig = {
    requestsPerSecond: 10,
    burstSize: 20,
    maxQueueSize: 100
};

/**
 * Manages request rate limiting for LLM providers
 */
export class RequestRateLimiter extends EventEmitter {
    private static instance: RequestRateLimiter;
    private buckets: Map<string, TokenBucket> = new Map();
    private queues: Map<string, Array<{
        resolve: () => void;
        reject: (error: Error) => void;
        timeout: NodeJS.Timeout;
    }>> = new Map();
    private configs: Map<string, IRateLimitConfig> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): RequestRateLimiter {
        if (!this.instance) {
            this.instance = new RequestRateLimiter();
        }
        return this.instance;
    }

    /**
     * Configure rate limiting for a provider
     */
    public configureProvider(providerId: string, config: Partial<IRateLimitConfig>): void {
        this.configs.set(providerId, {
            ...DEFAULT_RATE_LIMIT_CONFIG,
            ...config
        });
    }

    /**
     * Acquire permission to make a request
     */
    public async acquireToken(providerId: string, timeout: number = 5000): Promise<void> {
        const config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;
        const bucket = this.getOrCreateBucket(providerId, config);

        // Try to get a token
        if (this.tryAcquireToken(bucket, config)) {
            return;
        }

        // If no tokens available, queue the request
        return this.queueRequest(providerId, timeout);
    }

    /**
     * Release tokens back to the bucket (for error cases)
     */
    public releaseToken(providerId: string): void {
        const bucket = this.buckets.get(providerId);
        const config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;

        if (bucket && bucket.tokens < config.burstSize) {
            bucket.tokens++;
            this.processQueue(providerId);
        }
    }

    /**
     * Get current rate limit status
     */
    public getStatus(providerId: string) {
        const bucket = this.buckets.get(providerId);
        const queue = this.queues.get(providerId) || [];
        const config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;

        return {
            availableTokens: bucket?.tokens ?? config.burstSize,
            queueLength: queue.length,
            config: { ...config }
        };
    }

    private getOrCreateBucket(providerId: string, config: IRateLimitConfig): TokenBucket {
        let bucket = this.buckets.get(providerId);

        if (!bucket) {
            bucket = {
                tokens: config.burstSize,
                lastRefill: Date.now()
            };
            this.buckets.set(providerId, bucket);
            return bucket;
        }

        // Refill tokens based on elapsed time
        const now = Date.now();
        const elapsedMs = now - bucket.lastRefill;
        const newTokens = (elapsedMs / 1000) * config.requestsPerSecond;

        bucket.tokens = Math.min(
            config.burstSize,
            bucket.tokens + newTokens
        );
        bucket.lastRefill = now;

        return bucket;
    }

    private tryAcquireToken(bucket: TokenBucket, config: IRateLimitConfig): boolean {
        this.getOrCreateBucket(bucket.lastRefill.toString(), config); // Refill tokens

        if (bucket.tokens >= 1) {
            bucket.tokens--;
            return true;
        }

        return false;
    }

    private queueRequest(providerId: string, timeout: number): Promise<void> {
        const queue = this.queues.get(providerId) || [];
        const config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;

        if (queue.length >= config.maxQueueSize) {
            throw new ProviderError('Rate limit queue full', providerId);
        }

        if (!this.queues.has(providerId)) {
            this.queues.set(providerId, []);
        }

        return new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                const index = queue.findIndex(r => r.timeout === timeoutId);
                if (index !== -1) {
                    queue.splice(index, 1);
                }
                reject(new Error('Rate limit timeout'));
            }, timeout);

            queue.push({ resolve, reject, timeout: timeoutId });
        });
    }

    private processQueue(providerId: string): void {
        const queue = this.queues.get(providerId) || [];
        const bucket = this.buckets.get(providerId);
        const config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;

        while (queue.length > 0 && bucket && bucket.tokens >= 1) {
            const request = queue.shift();
            if (request) {
                clearTimeout(request.timeout);
                bucket.tokens--;
                request.resolve();
            }
        }
    }

    /**
     * Clear rate limiting state for a provider
     */
    public clearProvider(providerId: string): void {
        const queue = this.queues.get(providerId) || [];

        // Reject all queued requests
        queue.forEach(request => {
            clearTimeout(request.timeout);
            request.reject(new Error('Rate limiter cleared'));
        });

        this.queues.delete(providerId);
        this.buckets.delete(providerId);
        this.configs.delete(providerId);
    }

    public dispose(): void {
        // Clear all providers
        for (const providerId of this.queues.keys()) {
            this.clearProvider(providerId);
        }

        this.removeAllListeners();
    }
}
