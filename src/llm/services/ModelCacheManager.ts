import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { LLMModelInfo, CacheStrategy, CacheStats, CacheConfig } from '../types';
import path from 'path';
import fs from 'fs';

const DEFAULT_CACHE_CONFIG: CacheConfig = {
    maxMemorySize: 1024 * 1024 * 1024, // 1GB
    maxItems: 100,
    ttl: 60 * 60 * 1000, // 1 hour
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
};

@injectable()
export class ModelCacheManager extends EventEmitter implements vscode.Disposable {
    private readonly memoryCache = new Map<string, CachedModel>();
    private readonly diskCache = new Map<string, string>();
    private readonly outputChannel: vscode.OutputChannel;
    private cleanupInterval: NodeJS.Timeout | null = null;
    private cacheStats: CacheStats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        memoryUsed: 0
    };

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        private readonly cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG,
        private readonly cacheDir: string = path.join(vscode.workspace.rootPath || '', '.model-cache')
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Cache');
        this.initializeCache();
    }

    private initializeCache(): void {
        // Ensure cache directory exists
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }

        // Start cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, this.cacheConfig.cleanupInterval);
    }

    public async cacheModel(
        model: LLMModelInfo,
        strategy: CacheStrategy = 'memory'
    ): Promise<void> {
        const key = this.generateCacheKey(model);

        try {
            if (strategy === 'memory') {
                await this.cacheInMemory(key, model);
            } else if (strategy === 'disk') {
                await this.cacheOnDisk(key, model);
            } else {
                throw new Error(`Invalid cache strategy: ${strategy}`);
            }

            this.emit('modelCached', { modelId: model.id, strategy });
            this.logCacheOperation('cache', model.id, strategy);
        } catch (error) {
            this.handleError('Failed to cache model', error as Error);
            throw error;
        }
    }

    public async getModel(modelId: string): Promise<LLMModelInfo | null> {
        try {
            // Check memory cache first
            const memoryModel = this.memoryCache.get(modelId);
            if (memoryModel && !this.isExpired(memoryModel)) {
                this.cacheStats.hits++;
                this.emit('cacheHit', { modelId, source: 'memory' });
                return memoryModel.model;
            }

            // Check disk cache
            const diskPath = this.diskCache.get(modelId);
            if (diskPath && fs.existsSync(diskPath)) {
                const model = await this.loadFromDisk(diskPath);
                if (model) {
                    this.cacheStats.hits++;
                    this.emit('cacheHit', { modelId, source: 'disk' });
                    return model;
                }
            }

            this.cacheStats.misses++;
            this.emit('cacheMiss', { modelId });
            return null;
        } catch (error) {
            this.handleError('Failed to retrieve model from cache', error as Error);
            throw error;
        }
    }

    public invalidateModel(modelId: string): void {
        try {
            // Remove from memory cache
            if (this.memoryCache.has(modelId)) {
                const model = this.memoryCache.get(modelId)!;
                this.cacheStats.memoryUsed -= this.estimateSize(model.model);
                this.memoryCache.delete(modelId);
            }

            // Remove from disk cache
            const diskPath = this.diskCache.get(modelId);
            if (diskPath && fs.existsSync(diskPath)) {
                fs.unlinkSync(diskPath);
                this.diskCache.delete(modelId);
            }

            this.cacheStats.evictions++;
            this.emit('modelInvalidated', { modelId });
            this.logCacheOperation('invalidate', modelId);
        } catch (error) {
            this.handleError('Failed to invalidate model', error as Error);
            throw error;
        }
    }

    private async cacheInMemory(key: string, model: LLMModelInfo): Promise<void> {
        const size = this.estimateSize(model);

        // Check if we need to make space
        while (this.cacheStats.memoryUsed + size > this.cacheConfig.maxMemorySize) {
            this.evictOldest();
        }

        this.memoryCache.set(key, {
            model,
            timestamp: Date.now(),
            size
        });

        this.cacheStats.memoryUsed += size;
    }

    private async cacheOnDisk(key: string, model: LLMModelInfo): Promise<void> {
        const filePath = path.join(this.cacheDir, `${key}.json`);
        
        await fs.promises.writeFile(
            filePath,
            JSON.stringify({ model, timestamp: Date.now() }),
            'utf8'
        );

        this.diskCache.set(key, filePath);
    }

    private async loadFromDisk(filePath: string): Promise<LLMModelInfo | null> {
        try {
            const data = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
            
            if (this.isExpired({ timestamp: data.timestamp })) {
                fs.unlinkSync(filePath);
                return null;
            }

            return data.model;
        } catch (error) {
            this.logger.error('[ModelCacheManager]', 'Failed to load model from disk', error);
            return null;
        }
    }

    private cleanup(): void {
        const now = Date.now();

        // Cleanup memory cache
        for (const [key, model] of this.memoryCache.entries()) {
            if (this.isExpired(model)) {
                this.invalidateModel(key);
            }
        }

        // Cleanup disk cache
        for (const [key, filePath] of this.diskCache.entries()) {
            if (!fs.existsSync(filePath)) {
                this.diskCache.delete(key);
                continue;
            }

            try {
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > this.cacheConfig.ttl) {
                    this.invalidateModel(key);
                }
            } catch (error) {
                this.logger.error('[ModelCacheManager]', 'Failed to check file stats', error);
            }
        }

        this.emit('cleanup', this.getCacheStats());
    }

    private evictOldest(): void {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const [key, model] of this.memoryCache.entries()) {
            if (model.timestamp < oldestTime) {
                oldestTime = model.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.invalidateModel(oldestKey);
        }
    }

    private isExpired(model: { timestamp: number }): boolean {
        return Date.now() - model.timestamp > this.cacheConfig.ttl;
    }

    private generateCacheKey(model: LLMModelInfo): string {
        return model.id;
    }

    private estimateSize(model: LLMModelInfo): number {
        return Buffer.byteLength(JSON.stringify(model));
    }

    public getCacheStats(): CacheStats {
        return { ...this.cacheStats };
    }

    private logCacheOperation(operation: string, modelId: string, strategy?: string): void {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] ${operation} - Model: ${modelId}${strategy ? ` (${strategy})` : ''}`);
        const stats = this.getCacheStats();
        this.outputChannel.appendLine(`Cache Stats: ${JSON.stringify(stats, null, 2)}`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelCacheManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.memoryCache.clear();
        this.diskCache.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}

interface CachedModel {
    model: LLMModelInfo;
    timestamp: number;
    size: number;
}
