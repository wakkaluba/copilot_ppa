import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../services/logging/ILogger';
import { LLMModelInfo } from '../types';
interface CacheConfig {
    maxMemorySize: number;
    maxDiskSize: number;
    ttl: number;
    cleanupInterval: number;
    compressionEnabled: boolean;
    persistPath: string;
}
interface CacheMetrics {
    memoryUsed: number;
    diskUsed: number;
    memoryHits: number;
    diskHits: number;
    misses: number;
    evictions: number;
}
export declare class ModelCacheManagerV2 extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly config;
    private readonly memoryCache;
    private readonly diskCache;
    private readonly metrics;
    private readonly outputChannel;
    private readonly cleanupInterval;
    constructor(logger: ILogger, config?: CacheConfig);
    private initializeMetrics;
    private initializeCache;
    get(key: string): Promise<LLMModelInfo | null>;
    set(key: string, value: LLMModelInfo): Promise<void>;
    private setInMemory;
    private setOnDisk;
    private promoteToMemory;
    private loadFromDisk;
    private saveToDisk;
    private evictFromMemory;
    private evictFromDisk;
    invalidate(key: string): Promise<void>;
    private runCleanup;
    private updateItemAccess;
    private isExpired;
    private findLRUKey;
    private findOldestDiskKey;
    private getAvailableMemory;
    private getDiskPath;
    private estimateSize;
    getMetrics(): CacheMetrics;
    private loadPersistedCache;
    private handleError;
    private logOperation;
    dispose(): void;
}
export {};
