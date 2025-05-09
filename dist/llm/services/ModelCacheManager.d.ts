import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { LLMModelInfo, CacheStrategy, CacheStats, CacheConfig } from '../types';
export declare class ModelCacheManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly cacheConfig;
    private readonly cacheDir;
    private readonly memoryCache;
    private readonly diskCache;
    private readonly outputChannel;
    private cleanupInterval;
    private cacheStats;
    constructor(logger: ILogger, cacheConfig?: CacheConfig, cacheDir?: string);
    private initializeCache;
    cacheModel(model: LLMModelInfo, strategy?: CacheStrategy): Promise<void>;
    getModel(modelId: string): Promise<LLMModelInfo | null>;
    invalidateModel(modelId: string): void;
    private cacheInMemory;
    private cacheOnDisk;
    private loadFromDisk;
    private cleanup;
    private evictOldest;
    private isExpired;
    private generateCacheKey;
    private estimateSize;
    getCacheStats(): CacheStats;
    private logCacheOperation;
    private handleError;
    dispose(): void;
}
