import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';

interface RateLimitConfig {
    requestsPerSecond: number;
    burstLimit: number;
    maxQueueSize: number;
    quotaLimit?: number;
    timeWindowMs?: number;
}

interface TokenBucket {
    tokens: number;
    lastRefill: number;
    quota?: {
        remaining: number;
        resetTime: number;
    };
}

interface QueuedRequest {
    id: string;
    timestamp: number;
    resolve: () => void;
    reject: (error: Error) => void;
    timeoutId: NodeJS.Timeout;
}

@injectable()
export class ModelRateLimiter extends EventEmitter implements vscode.Disposable {
    private readonly buckets = new Map<string, TokenBucket>();
    private readonly queues = new Map<string, QueuedRequest[]>();
    private readonly configs = new Map<string, RateLimitConfig>();
    private readonly outputChannel: vscode.OutputChannel;
    private readonly cleanupInterval: NodeJS.Timer;
    
    constructor(@inject(ILogger) private readonly logger: ILogger) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Rate Limiter');
        this.cleanupInterval = setInterval(() => this.cleanupStaleRequests(), 60000);
    }

    public async configureModel(modelId: string, config: Partial<RateLimitConfig>): Promise<void> {
        try {
            const defaultConfig: RateLimitConfig = {
                requestsPerSecond: 10,
                burstLimit: 20,
                maxQueueSize: 100,
                timeWindowMs: 3600000 // 1 hour
            };

            this.configs.set(modelId, {
                ...defaultConfig,
                ...config
            });

            this.logConfigUpdate(modelId);
        } catch (error) {
            this.handleError(`Failed to configure model ${modelId}`, error as Error);
            throw error;
        }
    }

    public async acquireToken(modelId: string, timeout: number = 5000): Promise<void> {
        try {
            const config = this.configs.get(modelId);
            if (!config) {
                throw new Error(`Model ${modelId} not configured for rate limiting`);
            }

            const bucket = this.getOrCreateBucket(modelId, config);
            if (this.checkAndUpdateQuota(bucket, config)) {
                if (this.tryAcquireToken(bucket, config)) {
                    return;
                }
                return this.enqueueRequest(modelId, timeout);
            }
            throw new Error(`Quota exceeded for model ${modelId}`);
        } catch (error) {
            this.handleError(`Failed to acquire token for model ${modelId}`, error as Error);
            throw error;
        }
    }

    private getOrCreateBucket(modelId: string, config: RateLimitConfig): TokenBucket {
        let bucket = this.buckets.get(modelId);
        if (!bucket) {
            bucket = {
                tokens: config.burstLimit,
                lastRefill: Date.now(),
                quota: config.quotaLimit ? {
                    remaining: config.quotaLimit,
                    resetTime: Date.now() + (config.timeWindowMs || 3600000)
                } : undefined
            };
            this.buckets.set(modelId, bucket);
            return bucket;
        }

        const now = Date.now();
        const timePassed = (now - bucket.lastRefill) / 1000;
        const newTokens = timePassed * config.requestsPerSecond;

        bucket.tokens = Math.min(config.burstLimit, bucket.tokens + newTokens);
        bucket.lastRefill = now;

        return bucket;
    }

    private tryAcquireToken(bucket: TokenBucket, config: RateLimitConfig): boolean {
        if (bucket.tokens >= 1) {
            bucket.tokens--;
            return true;
        }
        return false;
    }

    private checkAndUpdateQuota(bucket: TokenBucket, config: RateLimitConfig): boolean {
        if (!bucket.quota || !config.quotaLimit) {
            return true;
        }

        const now = Date.now();
        if (now > bucket.quota.resetTime) {
            bucket.quota.remaining = config.quotaLimit;
            bucket.quota.resetTime = now + (config.timeWindowMs || 3600000);
        }

        if (bucket.quota.remaining > 0) {
            bucket.quota.remaining--;
            return true;
        }

        return false;
    }

    private async enqueueRequest(modelId: string, timeout: number): Promise<void> {
        const queue = this.queues.get(modelId) || [];
        const config = this.configs.get(modelId);

        if (!config) {
            throw new Error(`Model ${modelId} not configured for rate limiting`);
        }

        if (queue.length >= config.maxQueueSize) {
            throw new Error(`Rate limit queue full for model ${modelId}`);
        }

        if (!this.queues.has(modelId)) {
            this.queues.set(modelId, []);
        }

        return new Promise<void>((resolve, reject) => {
            const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const timeoutId = setTimeout(() => {
                this.removeRequest(modelId, requestId);
                reject(new Error('Rate limit request timeout'));
            }, timeout);

            queue.push({ id: requestId, timestamp: new Date(), resolve, reject, timeoutId });
            this.logQueueUpdate(modelId, queue.length);
        });
    }

    private removeRequest(modelId: string, requestId: string): void {
        const queue = this.queues.get(modelId);
        if (!queue) return;

        const index = queue.findIndex(r => r.id === requestId);
        if (index !== -1) {
            clearTimeout(queue[index].timeoutId);
            queue.splice(index, 1);
        }
    }

    private processQueue(modelId: string): void {
        const queue = this.queues.get(modelId);
        const config = this.configs.get(modelId);
        if (!queue || !config) return;

        const bucket = this.getOrCreateBucket(modelId, config);
        while (queue.length > 0 && this.tryAcquireToken(bucket, config)) {
            const request = queue.shift();
            if (request) {
                clearTimeout(request.timeoutId);
                request.resolve();
            }
        }

        this.logQueueUpdate(modelId, queue.length);
    }

    private cleanupStaleRequests(): void {
        const now = Date.now();
        for (const [modelId, queue] of this.queues.entries()) {
            const staleTimeout = 300000; // 5 minutes
            const filtered = queue.filter(request => {
                const isStale = (now - request.timestamp) > staleTimeout;
                if (isStale) {
                    clearTimeout(request.timeoutId);
                    request.reject(new Error('Request expired'));
                }
                return !isStale;
            });
            this.queues.set(modelId, filtered);
        }
    }

    public getRateLimitStatus(modelId: string): {
        tokens: number;
        queueLength: number;
        quotaRemaining?: number;
        quotaResetTime?: number;
    } {
        const bucket = this.buckets.get(modelId);
        const queue = this.queues.get(modelId) || [];

        return {
            tokens: bucket?.tokens ?? 0,
            queueLength: queue.length,
            quotaRemaining: bucket?.quota?.remaining,
            quotaResetTime: bucket?.quota?.resetTime
        };
    }

    private logConfigUpdate(modelId: string): void {
        const config = this.configs.get(modelId);
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] Updated rate limit config for model ${modelId}:`);
        this.outputChannel.appendLine(JSON.stringify(config, null, 2));
    }

    private logQueueUpdate(modelId: string, queueLength: number): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] Queue update for model ${modelId}: ${queueLength} requests waiting`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelRateLimiter]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        clearInterval(this.cleanupInterval);
        
        // Reject all queued requests
        for (const [modelId, queue] of this.queues.entries()) {
            queue.forEach(request => {
                clearTimeout(request.timeoutId);
                request.reject(new Error('Rate limiter disposed'));
            });
            queue.length = 0;
        }

        this.queues.clear();
        this.buckets.clear();
        this.configs.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}
