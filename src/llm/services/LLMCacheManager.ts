import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMRequest, ILLMResponse } from '../types';

export interface ICacheEntry {
    request: ILLMRequest;
    response: ILLMResponse;
    timestamp: number;
    expiresAt?: number;
    metadata?: Record<string, unknown>;
}

export interface ICacheOptions {
    maxSize?: number;
    ttlMs?: number;
    persistToDisk?: boolean;
    compressionEnabled?: boolean;
}

export interface ICacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    totalRequests: number;
    avgResponseTime: number;
}

@injectable()
export class LLMCacheManager extends EventEmitter {
    private readonly cache = new Map<string, ICacheEntry>();
    private readonly stats: ICacheStats = {
        size: 0,
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        avgResponseTime: 0
    };

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        private readonly options: ICacheOptions = {}
    ) {
        super();
        this.options = {
            maxSize: 1000,
            ttlMs: 24 * 60 * 60 * 1000, // 24 hours
            persistToDisk: false,
            compressionEnabled: false,
            ...options
        };
    }

    public async get(request: ILLMRequest): Promise<ILLMResponse | null> {
        const key = this.generateCacheKey(request);
        const entry = this.cache.get(key);

        if (!entry) {
            this.updateStats('miss');
            return null;
        }

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.updateStats('miss');
            return null;
        }

        this.updateStats('hit');
        return entry.response;
    }

    public async set(request: ILLMRequest, response: ILLMResponse): Promise<void> {
        try {
            const key = this.generateCacheKey(request);
            const entry: ICacheEntry = {
                request,
                response,
                timestamp: Date.now(),
                expiresAt: this.options.ttlMs ? Date.now() + this.options.ttlMs : undefined
            };

            if (this.cache.size >= this.options.maxSize!) {
                this.evictOldest();
            }

            this.cache.set(key, entry);
            this.stats.size = this.cache.size;

            this.emit('entryCached', { key, entry });

            if (this.options.persistToDisk) {
                await this.persistToDisk();
            }
        } catch (error) {
            this.handleError('Failed to cache response', error as Error);
            throw error;
        }
    }

    private generateCacheKey(request: ILLMRequest): string {
        // This would implement a proper cache key generation strategy
        return `${request.model}-${request.id}`;
    }

    private isExpired(entry: ICacheEntry): boolean {
        return entry.expiresAt ? Date.now() > entry.expiresAt : false;
    }

    private evictOldest(): void {
        const oldestKey = Array.from(this.cache.entries())
            .reduce((oldest, [key, entry]) => {
                return !oldest[1] || entry.timestamp < oldest[1].timestamp
                    ? [key, entry]
                    : oldest;
            }, ['', null as ICacheEntry | null])[0];

        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.emit('entryEvicted', { key: oldestKey });
        }
    }

    private async persistToDisk(): Promise<void> {
        // This would implement disk persistence
        throw new Error('Method not implemented');
    }

    private updateStats(type: 'hit' | 'miss'): void {
        this.stats.totalRequests++;

        if (type === 'hit') {
            this.stats.hits++;
        } else {
            this.stats.misses++;
        }

        this.stats.hitRate = this.stats.hits / this.stats.totalRequests;
    }

    public getStats(): ICacheStats {
        return { ...this.stats };
    }

    public clear(): void {
        this.cache.clear();
        this.stats.size = 0;
        this.emit('cacheCleared');
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[LLMCacheManager]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.cache.clear();
        this.removeAllListeners();
    }
}
