import { EventEmitter } from 'events';
import {
    ModelInfo,
    ModelEvent,
    ModelLoadError,
    ModelLoadOptions,
    ModelStats,
    ModelStatus,
    ModelUpdateEvent
} from '../types';

interface ModelState {
    info: ModelInfo;
    status: ModelStatus;
    stats: ModelStats;
    lastUsed: number;
    loadAttempts: number;
}

/**
 * Manages LLM model lifecycle, discovery, and runtime management
 */
export class LLMModelManager extends EventEmitter {
    private readonly models = new Map<string, ModelState>();
    private activeModel: string | null = null;
    private readonly loadingModels = new Set<string>();
    private readonly maxLoadAttempts = 3;

    /**
     * Register a new model
     */
    public registerModel(info: ModelInfo): void {
        const state: ModelState = {
            info,
            status: 'inactive',
            stats: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                totalTokensUsed: 0,
                lastError: null
            },
            lastUsed: 0,
            loadAttempts: 0
        };

        this.models.set(info.id, state);
        this.emit(ModelEvent.Registered, { modelId: info.id, info });
    }

    /**
     * Load a model for use
     */
    public async loadModel(
        modelId: string,
        options: ModelLoadOptions = {}
    ): Promise<void> {
        const state = this.models.get(modelId);
        if (!state) {
            throw new ModelLoadError(`Model ${modelId} not found`);
        }

        if (this.loadingModels.has(modelId)) {
            throw new ModelLoadError(`Model ${modelId} is already loading`);
        }

        if (state.loadAttempts >= this.maxLoadAttempts) {
            throw new ModelLoadError(
                `Model ${modelId} failed to load after ${this.maxLoadAttempts} attempts`
            );
        }

        try {
            this.loadingModels.add(modelId);
            state.status = 'loading';
            state.loadAttempts++;
            
            this.emit(ModelEvent.Loading, { 
                modelId,
                attempt: state.loadAttempts 
            });

            await this.performModelLoad(state.info, options);

            state.status = 'active';
            this.activeModel = modelId;
            state.lastUsed = Date.now();

            this.emit(ModelEvent.Loaded, { modelId });

        } catch (error) {
            state.status = 'error';
            state.stats.lastError = error instanceof Error ? error : new Error(String(error));
            
            this.emit(ModelEvent.LoadError, {
                modelId,
                error: state.stats.lastError,
                attempt: state.loadAttempts
            });

            throw new ModelLoadError(
                `Failed to load model ${modelId}`,
                state.stats.lastError
            );

        } finally {
            this.loadingModels.delete(modelId);
        }
    }

    /**
     * Unload a model
     */
    public async unloadModel(modelId: string): Promise<void> {
        const state = this.models.get(modelId);
        if (!state) return;

        if (state.status === 'unloading') return;

        try {
            state.status = 'unloading';
            this.emit(ModelEvent.Unloading, { modelId });

            await this.performModelUnload(state.info);

            state.status = 'inactive';
            if (this.activeModel === modelId) {
                this.activeModel = null;
            }

            this.emit(ModelEvent.Unloaded, { modelId });

        } catch (error) {
            state.status = 'error';
            state.stats.lastError = error instanceof Error ? error : new Error(String(error));
            
            this.emit(ModelEvent.UnloadError, {
                modelId,
                error: state.stats.lastError
            });

            throw error;
        }
    }

    /**
     * Update model information
     */
    public async updateModel(
        modelId: string,
        updates: Partial<ModelInfo>
    ): Promise<void> {
        const state = this.models.get(modelId);
        if (!state) {
            throw new Error(`Model ${modelId} not found`);
        }

        const oldInfo = { ...state.info };
        state.info = { ...state.info, ...updates };

        const event: ModelUpdateEvent = {
            modelId,
            oldInfo,
            newInfo: state.info,
            changes: this.getInfoChanges(oldInfo, state.info)
        };

        this.emit(ModelEvent.Updated, event);
    }

    /**
     * Record model usage statistics
     */
    public recordUsage(modelId: string, stats: Partial<ModelStats>): void {
        const state = this.models.get(modelId);
        if (!state) return;

        // Update stats
        if (stats.totalRequests) {
            state.stats.totalRequests += stats.totalRequests;
        }
        if (stats.successfulRequests) {
            state.stats.successfulRequests += stats.successfulRequests;
        }
        if (stats.failedRequests) {
            state.stats.failedRequests += stats.failedRequests;
        }
        if (stats.totalTokensUsed) {
            state.stats.totalTokensUsed += stats.totalTokensUsed;
        }

        // Update average response time
        if (stats.averageResponseTime) {
            const totalResponses = state.stats.successfulRequests + state.stats.failedRequests;
            state.stats.averageResponseTime = (
                (state.stats.averageResponseTime * (totalResponses - 1)) +
                stats.averageResponseTime
            ) / totalResponses;
        }

        this.emit(ModelEvent.StatsUpdated, {
            modelId,
            stats: { ...state.stats }
        });
    }

    /**
     * Get model information
     */
    public getModelInfo(modelId: string): ModelInfo | undefined {
        return this.models.get(modelId)?.info;
    }

    /**
     * Get model status
     */
    public getModelStatus(modelId: string): ModelStatus | undefined {
        return this.models.get(modelId)?.status;
    }

    /**
     * Get model statistics
     */
    public getModelStats(modelId: string): ModelStats | undefined {
        return this.models.get(modelId)?.stats;
    }

    /**
     * Get all registered models
     */
    public getModels(): ModelInfo[] {
        return Array.from(this.models.values()).map(state => state.info);
    }

    /**
     * Get active model
     */
    public getActiveModel(): ModelInfo | undefined {
        return this.activeModel ? this.getModelInfo(this.activeModel) : undefined;
    }

    /**
     * Check if a model is loaded
     */
    public isModelLoaded(modelId: string): boolean {
        return this.models.get(modelId)?.status === 'active';
    }

    private async performModelLoad(
        info: ModelInfo,
        options: ModelLoadOptions
    ): Promise<void> {
        // Get the provider for this model
        const provider = await this.providerRegistry.getProvider(info.providerId);
        if (!provider) {
            throw new ModelLoadError(`Provider ${info.providerId} not found for model ${info.id}`);
        }

        // Initialize provider-specific resources
        await provider.initializeModel(info, options);

        // Verify the model is ready
        const status = await provider.getModelStatus(info.id);
        if (status !== 'ready') {
            throw new ModelLoadError(`Model ${info.id} failed to initialize. Status: ${status}`);
        }
    }

    private async performModelUnload(info: ModelInfo): Promise<void> {
        // Get the provider for this model
        const provider = await this.providerRegistry.getProvider(info.providerId);
        if (!provider) {
            throw new Error(`Provider ${info.providerId} not found for model ${info.id}`);
        }

        // Clean up provider-specific resources
        await provider.cleanupModel(info.id);

        // Verify the model is properly unloaded
        const status = await provider.getModelStatus(info.id);
        if (status !== 'inactive') {
            throw new Error(`Model ${info.id} failed to unload properly. Status: ${status}`);
        }
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
        for (const [modelId, state] of this.models) {
            if (state.status === 'active') {
                this.unloadModel(modelId).catch(console.error);
            }
        }
        this.models.clear();
        this.removeAllListeners();
    }
}