import { EventEmitter } from 'events';
import {
    ModelInfo,
    ModelEvent,
    ModelUpdateEvent,
    ModelInfoCache,
    ModelDiscoveryOptions,
    ModelFilterOptions,
    ModelSortOptions,
    ModelQueryResult
} from '../types';

const DEFAULT_CACHE_TTL = 3600000; // 1 hour

/**
 * Service for managing model information, discovery, and caching
 */
export class LLMModelInfoService extends EventEmitter {
    private readonly modelCache = new Map<string, ModelInfoCache>();
    private readonly cacheTTL: number;
    private updateInterval: NodeJS.Timer | null = null;
    private readonly updateFrequency = 300000; // 5 minutes

    constructor(cacheTTL = DEFAULT_CACHE_TTL) {
        super();
        this.cacheTTL = cacheTTL;
        this.startPeriodicUpdates();
    }

    /**
     * Get model information
     */
    public async getModelInfo(
        modelId: string,
        forceRefresh = false
    ): Promise<ModelInfo | null> {
        const cached = this.modelCache.get(modelId);
        
        if (!forceRefresh && cached && !this.isCacheExpired(cached)) {
            return cached.info;
        }

        try {
            const info = await this.fetchModelInfo(modelId);
            if (info) {
                this.updateCache(modelId, info);
            }
            return info;
        } catch (error) {
            if (cached) {
                // Return stale cache on error
                return cached.info;
            }
            throw error;
        }
    }

    /**
     * Discover available models
     */
    public async discoverModels(
        options: ModelDiscoveryOptions = {}
    ): Promise<ModelInfo[]> {
        try {
            const models = await this.performModelDiscovery(options);
            
            // Update cache with discovered models
            for (const model of models) {
                this.updateCache(model.id, model);
            }

            this.emit(ModelEvent.ModelsDiscovered, {
                count: models.length,
                timestamp: Date.now()
            });

            return models;
        } catch (error) {
            console.error('Model discovery failed:', error);
            // Return cached models on error
            return Array.from(this.modelCache.values())
                .filter(cached => !this.isCacheExpired(cached))
                .map(cached => cached.info);
        }
    }

    /**
     * Query models with filtering and sorting
     */
    public async queryModels(
        filter?: ModelFilterOptions,
        sort?: ModelSortOptions
    ): Promise<ModelQueryResult> {
        let models = Array.from(this.modelCache.values())
            .filter(cached => !this.isCacheExpired(cached))
            .map(cached => cached.info);

        // Apply filters
        if (filter) {
            models = this.filterModels(models, filter);
        }

        // Apply sorting
        if (sort) {
            models = this.sortModels(models, sort);
        }

        return {
            models,
            total: models.length,
            timestamp: Date.now()
        };
    }

    /**
     * Update model information
     */
    public async updateModelInfo(
        modelId: string,
        updates: Partial<ModelInfo>
    ): Promise<void> {
        const current = await this.getModelInfo(modelId);
        if (!current) {
            throw new Error(`Model ${modelId} not found`);
        }

        const updated = { ...current, ...updates };
        this.updateCache(modelId, updated);

        const event: ModelUpdateEvent = {
            modelId,
            oldInfo: current,
            newInfo: updated,
            changes: this.getInfoChanges(current, updated)
        };

        this.emit(ModelEvent.Updated, event);
    }

    /**
     * Clear model cache
     */
    public clearCache(modelId?: string): void {
        if (modelId) {
            this.modelCache.delete(modelId);
        } else {
            this.modelCache.clear();
        }
    }

    /**
     * Get cache statistics
     */
    public getCacheStats(): Record<string, unknown> {
        const now = Date.now();
        const stats = {
            totalEntries: this.modelCache.size,
            validEntries: 0,
            expiredEntries: 0,
            averageAge: 0
        };

        let totalAge = 0;
        for (const cached of this.modelCache.values()) {
            const age = now - cached.timestamp;
            totalAge += age;
            
            if (this.isCacheExpired(cached)) {
                stats.expiredEntries++;
            } else {
                stats.validEntries++;
            }
        }

        if (stats.totalEntries > 0) {
            stats.averageAge = totalAge / stats.totalEntries;
        }

        return stats;
    }

    private startPeriodicUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(async () => {
            try {
                const expiredModels = Array.from(this.modelCache.entries())
                    .filter(([_, cached]) => this.isCacheExpired(cached))
                    .map(([id]) => id);

                for (const modelId of expiredModels) {
                    await this.getModelInfo(modelId, true);
                }
            } catch (error) {
                console.error('Periodic update failed:', error);
            }
        }, this.updateFrequency);
    }

    private isCacheExpired(cached: ModelInfoCache): boolean {
        return Date.now() - cached.timestamp > this.cacheTTL;
    }

    private updateCache(modelId: string, info: ModelInfo): void {
        this.modelCache.set(modelId, {
            info,
            timestamp: Date.now()
        });
    }

    private async fetchModelInfo(modelId: string): Promise<ModelInfo | null> {
        // This would integrate with the provider's model info retrieval
        throw new Error('Not implemented');
    }

    private async performModelDiscovery(
        options: ModelDiscoveryOptions
    ): Promise<ModelInfo[]> {
        // This would integrate with the provider's model discovery
        throw new Error('Not implemented');
    }

    private filterModels(
        models: ModelInfo[],
        filter: ModelFilterOptions
    ): ModelInfo[] {
        return models.filter(model => {
            if (filter.provider && model.provider !== filter.provider) {
                return false;
            }
            if (filter.type && model.type !== filter.type) {
                return false;
            }
            if (filter.minVersion && !this.checkVersion(model.version, filter.minVersion)) {
                return false;
            }
            if (filter.capabilities) {
                const hasCapabilities = filter.capabilities.every(
                    cap => model.capabilities.includes(cap)
                );
                if (!hasCapabilities) {
                    return false;
                }
            }
            if (filter.formats) {
                const hasFormats = filter.formats.every(
                    format => model.supportedFormats?.includes(format)
                );
                if (!hasFormats) {
                    return false;
                }
            }
            return true;
        });
    }

    private sortModels(
        models: ModelInfo[],
        sort: ModelSortOptions
    ): ModelInfo[] {
        return [...models].sort((a, b) => {
            for (const { field, direction } of sort.criteria) {
                const multiplier = direction === 'desc' ? -1 : 1;
                
                switch (field) {
                    case 'name':
                        return multiplier * a.name.localeCompare(b.name);
                    case 'version':
                        return multiplier * this.compareVersions(a.version, b.version);
                    case 'provider':
                        return multiplier * a.provider.localeCompare(b.provider);
                    default:
                        return 0;
                }
            }
            return 0;
        });
    }

    private compareVersions(a: string | undefined, b: string | undefined): number {
        if (!a && !b) return 0;
        if (!a) return -1;
        if (!b) return 1;

        const [majorA, minorA = 0] = a.split('.').map(Number);
        const [majorB, minorB = 0] = b.split('.').map(Number);

        if (majorA !== majorB) {
            return majorA - majorB;
        }
        return minorA - minorB;
    }

    private checkVersion(actual: string | undefined, required: string): boolean {
        if (!actual) return false;

        const [actualMajor, actualMinor = 0] = actual.split('.').map(Number);
        const [requiredMajor, requiredMinor = 0] = required.split('.').map(Number);

        if (actualMajor !== requiredMajor) {
            return actualMajor > requiredMajor;
        }
        return actualMinor >= requiredMinor;
    }

    private getInfoChanges(
        oldInfo: ModelInfo,
        newInfo: ModelInfo
    ): Partial<ModelInfo> {
        const changes: Partial<ModelInfo> = {};
        
        for (const key of Object.keys(oldInfo) as Array<keyof ModelInfo>) {
            if (oldInfo[key] !== newInfo[key]) {
                changes[key] = newInfo[key];
            }
        }
        
        return changes;
    }

    public dispose(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.modelCache.clear();
        this.removeAllListeners();
    }
}