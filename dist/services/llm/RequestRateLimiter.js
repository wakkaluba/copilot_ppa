"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRateLimiter = void 0;
const events_1 = require("events");
/**
 * Default rate limit configuration
 */
const DEFAULT_RATE_LIMIT_CONFIG = {
    requestsPerSecond: 10,
    burstSize: 20,
    maxQueueSize: 100
};
/**
 * Manages request rate limiting for LLM providers
 */
class RequestRateLimiter extends events_1.EventEmitter {
    constructor() {
        super();
        this.buckets = new Map();
        this.queues = new Map();
        this.configs = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RequestRateLimiter();
        }
        return this.instance;
    }
    /**
     * Configure rate limiting for a provider
     */
    configureProvider(providerId, config) {
        this.configs.set(providerId, {
            ...DEFAULT_RATE_LIMIT_CONFIG,
            ...config
        });
    }
    /**
     * Acquire permission to make a request
     */
    async acquireToken(providerId, timeout = 5000) {
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
    releaseToken(providerId) {
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
    getStatus(providerId) {
        const bucket = this.buckets.get(providerId);
        const queue = this.queues.get(providerId) || [];
        const config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;
        return {
            availableTokens: bucket?.tokens ?? config.burstSize,
            queueLength: queue.length,
            config: { ...config }
        };
    }
    getOrCreateBucket(providerId, config) {
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
        bucket.tokens = Math.min(config.burstSize, bucket.tokens + newTokens);
        bucket.lastRefill = now;
        return bucket;
    }
    tryAcquireToken(bucket, config) {
        this.getOrCreateBucket(bucket.lastRefill.toString(), config); // Refill tokens
        if (bucket.tokens >= 1) {
            bucket.tokens--;
            return true;
        }
        return false;
    }
    queueRequest(providerId, timeout) {
        const queue = this.queues.get(providerId) || [];
        const config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;
        if (queue.length >= config.maxQueueSize) {
            throw new Error('Rate limit queue full');
        }
        if (!this.queues.has(providerId)) {
            this.queues.set(providerId, []);
        }
        return new Promise((resolve, reject) => {
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
    processQueue(providerId) {
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
    clearProvider(providerId) {
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
    dispose() {
        // Clear all providers
        for (const providerId of this.queues.keys()) {
            this.clearProvider(providerId);
        }
        this.removeAllListeners();
    }
}
exports.RequestRateLimiter = RequestRateLimiter;
//# sourceMappingURL=RequestRateLimiter.js.map