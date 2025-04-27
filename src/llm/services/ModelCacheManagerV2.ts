import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../services/logging/ILogger';
import * as fs from 'fs';
import * as path from 'path';
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

interface CachedItem<T> {
    data: T;
    size: number;
    lastAccess: number;
    accessCount: number;
    metadata?: Record<string, any>;
}

@injectable()
export class ModelCacheManagerV2 extends EventEmitter implements vscode.Disposable {
    private readonly memoryCache = new Map<string, CachedItem<LLMModelInfo>>();
    private readonly diskCache = new Map<string, string>();
    private readonly metrics: CacheMetrics;
    private readonly outputChannel: vscode.OutputChannel;
    private readonly cleanupInterval: NodeJS.Timer;

    constructor(
        @inject('ILogger') private readonly logger: ILogger,
        private readonly config: CacheConfig = {
            maxMemorySize: 1024 * 1024 * 1024, // 1GB
            maxDiskSize: 5 * 1024 * 1024 * 1024, // 5GB
            ttl: 24 * 60 * 60 * 1000, // 24 hours
            cleanupInterval: 15 * 60 * 1000, // 15 minutes
            compressionEnabled: true,
            persistPath: path.join(vscode.workspace.rootPath || '', '.model-cache')
        }
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Cache Manager');
        this.metrics = this.initializeMetrics();
        this.initializeCache();
        this.cleanupInterval = setInterval(() => this.runCleanup(), this.config.cleanupInterval);
    }

    private initializeMetrics(): CacheMetrics {
        return {
            memoryUsed: 0,
            diskUsed: 0,
            memoryHits: 0,
            diskHits: 0,
            misses: 0,
            evictions: 0
        };
    }

    private initializeCache(): void {
        if (!fs.existsSync(this.config.persistPath)) {
            fs.mkdirSync(this.config.persistPath, { recursive: true });
        }
        this.loadPersistedCache();
    }

    public async get(key: string): Promise<LLMModelInfo | null> {
        try {
            // Check memory cache first
            const memoryItem = this.memoryCache.get(key);
            if (memoryItem && !this.isExpired(memoryItem)) {
                this.metrics.memoryHits++;
                this.updateItemAccess(key, memoryItem);
                return memoryItem.data;
            }

            // Check disk cache
            const diskPath = this.diskCache.get(key);
            if (diskPath && fs.existsSync(diskPath)) {
                const diskItem = await this.loadFromDisk(diskPath);
                if (diskItem) {
                    this.metrics.diskHits++;
                    // Promote to memory if possible
                    await this.promoteToMemory(key, diskItem);
                    return diskItem;
                }
            }

            this.metrics.misses++;
            return null;
        } catch (error) {
            this.handleError(`Failed to retrieve item: ${key}`, error as Error);
            throw error;
        }
    }

    public async set(key: string, value: LLMModelInfo): Promise<void> {
        try {
            const size = this.estimateSize(value);
            const item: CachedItem<LLMModelInfo> = {
                data: value,
                size,
                lastAccess: Date.now(),
                accessCount: 1
            };

            // Try memory cache first
            if (size <= this.getAvailableMemory()) {
                await this.setInMemory(key, item);
            } else {
                // Fall back to disk if too large for memory
                await this.setOnDisk(key, value);
            }

            this.emit('itemCached', { key, location: size <= this.getAvailableMemory() ? 'memory' : 'disk' });
        } catch (error) {
            this.handleError(`Failed to cache item: ${key}`, error as Error);
            throw error;
        }
    }

    private async setInMemory(key: string, item: CachedItem<LLMModelInfo>): Promise<void> {
        while (this.metrics.memoryUsed + item.size > this.config.maxMemorySize) {
            if (!this.evictFromMemory()) {
                throw new Error('Unable to make space in memory cache');
            }
        }

        this.memoryCache.set(key, item);
        this.metrics.memoryUsed += item.size;
    }

    private async setOnDisk(key: string, value: LLMModelInfo): Promise<void> {
        const diskPath = this.getDiskPath(key);
        
        while (this.metrics.diskUsed + this.estimateSize(value) > this.config.maxDiskSize) {
            if (!await this.evictFromDisk()) {
                throw new Error('Unable to make space in disk cache');
            }
        }

        await this.saveToDisk(diskPath, value);
        this.diskCache.set(key, diskPath);
    }

    private async promoteToMemory(key: string, value: LLMModelInfo): Promise<void> {
        const size = this.estimateSize(value);
        if (size <= this.getAvailableMemory()) {
            await this.setInMemory(key, {
                data: value,
                size,
                lastAccess: Date.now(),
                accessCount: 1
            });
        }
    }

    private async loadFromDisk(filePath: string): Promise<LLMModelInfo | null> {
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            const cached = JSON.parse(data);
            
            if (this.isExpired(cached)) {
                await fs.promises.unlink(filePath);
                return null;
            }

            return cached.data;
        } catch (error) {
            this.handleError(`Failed to load from disk: ${filePath}`, error as Error);
            return null;
        }
    }

    private async saveToDisk(filePath: string, value: LLMModelInfo): Promise<void> {
        const data = {
            data: value,
            timestamp: new Date()
        };

        await fs.promises.writeFile(
            filePath,
            JSON.stringify(data),
            'utf8'
        );

        this.metrics.diskUsed += this.estimateSize(value);
    }

    private evictFromMemory(): boolean {
        const lruKey = this.findLRUKey();
        if (!lruKey) return false;

        const item = this.memoryCache.get(lruKey)!;
        this.memoryCache.delete(lruKey);
        this.metrics.memoryUsed -= item.size;
        this.metrics.evictions++;

        return true;
    }

    private async evictFromDisk(): Promise<boolean> {
        const oldestKey = this.findOldestDiskKey();
        if (!oldestKey) return false;

        const filePath = this.diskCache.get(oldestKey)!;
        try {
            const stats = await fs.promises.stat(filePath);
            await fs.promises.unlink(filePath);
            this.diskCache.delete(oldestKey);
            this.metrics.diskUsed -= stats.size;
            this.metrics.evictions++;
            return true;
        } catch (error) {
            this.handleError(`Failed to evict from disk: ${filePath}`, error as Error);
            return false;
        }
    }

    public async invalidate(key: string): Promise<void> {
        try {
            // Remove from memory
            const memoryItem = this.memoryCache.get(key);
            if (memoryItem) {
                this.metrics.memoryUsed -= memoryItem.size;
                this.memoryCache.delete(key);
            }

            // Remove from disk
            const diskPath = this.diskCache.get(key);
            if (diskPath && fs.existsSync(diskPath)) {
                const stats = await fs.promises.stat(diskPath);
                await fs.promises.unlink(diskPath);
                this.metrics.diskUsed -= stats.size;
                this.diskCache.delete(key);
            }

            this.emit('itemInvalidated', { key });
        } catch (error) {
            this.handleError(`Failed to invalidate item: ${key}`, error as Error);
            throw error;
        }
    }

    private async runCleanup(): Promise<void> {
        try {
            const now = Date.now();

            // Cleanup memory cache
            for (const [key, item] of Array.from(this.memoryCache.entries())) {
                if (this.isExpired(item)) {
                    await this.invalidate(key);
                }
            }

            // Cleanup disk cache
            for (const [key, filePath] of Array.from(this.diskCache.entries())) {
                if (!fs.existsSync(filePath)) {
                    this.diskCache.delete(key);
                    continue;
                }

                try {
                    const data = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
                    if (this.isExpired(data)) {
                        await this.invalidate(key);
                    }
                } catch (error) {
                    await this.invalidate(key);
                }
            }

            this.emit('cleanup', this.getMetrics());
        } catch (error) {
            this.handleError('Failed to run cleanup', error as Error);
        }
    }

    private updateItemAccess(key: string, item: CachedItem<LLMModelInfo>): void {
        item.lastAccess = Date.now();
        item.accessCount++;
    }

    private isExpired(item: { lastAccess?: number; timestamp?: number }): boolean {
        const timestamp = item.lastAccess || item.timestamp;
        return timestamp ? Date.now() - timestamp > this.config.ttl : true;
    }

    private findLRUKey(): string | undefined {
        let lruKey: string | undefined;
        let lruTime = Infinity;

        for (const [key, item] of Array.from(this.memoryCache.entries())) {
            if (item.lastAccess < lruTime) {
                lruTime = item.lastAccess;
                lruKey = key;
            }
        }

        return lruKey;
    }

    private findOldestDiskKey(): string | undefined {
        let oldestKey: string | undefined;
        let oldestTime = Infinity;

        for (const [key, filePath] of Array.from(this.diskCache.entries())) {
            try {
                const stats = fs.statSync(filePath);
                if (stats.mtimeMs < oldestTime) {
                    oldestTime = stats.mtimeMs;
                    oldestKey = key;
                }
            } catch (error) {
                this.diskCache.delete(key);
            }
        }

        return oldestKey;
    }

    private getAvailableMemory(): number {
        return this.config.maxMemorySize - this.metrics.memoryUsed;
    }

    private getDiskPath(key: string): string {
        return path.join(this.config.persistPath, `${key}.json`);
    }

    private estimateSize(value: LLMModelInfo): number {
        return Buffer.byteLength(JSON.stringify(value));
    }

    public getMetrics(): CacheMetrics {
        return { ...this.metrics };
    }

    private async loadPersistedCache(): Promise<void> {
        try {
            const files = await fs.promises.readdir(this.config.persistPath);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const key = file.slice(0, -5);
                    const filePath = path.join(this.config.persistPath, file);
                    this.diskCache.set(key, filePath);
                }
            }
        } catch (error) {
            this.handleError('Failed to load persisted cache', error as Error);
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error(`[ModelCacheManager] ${message}: ${error.message}`);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    private logOperation(operation: string, details: Record<string, any>): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${operation}: ${JSON.stringify(details)}`);
    }

    public dispose(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval as NodeJS.Timeout);
        }
        this.memoryCache.clear();
        this.diskCache.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}
