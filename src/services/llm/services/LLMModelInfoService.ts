import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../../logging/ILogger';
import { ILLMCacheManager } from '../LLMCacheManager';
import { ILLMModelInfo, ModelEvent } from '../types';
import { ILLMModelValidator } from './LLMModelValidator';

@injectable()
export class LLMModelInfoService extends EventEmitter {
    private readonly modelCache = new Map<string, ILLMModelInfo>();
    private readonly cacheManager: ILLMCacheManager;
    private readonly validator: ILLMModelValidator;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ILLMCacheManager) cacheManager: ILLMCacheManager,
        @inject(ILLMModelValidator) validator: ILLMModelValidator
    ) {
        super();
        this.cacheManager = cacheManager;
        this.validator = validator;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.cacheManager.on('modelInfoCached', this.handleCacheUpdate.bind(this));
        this.validator.on('validationComplete', this.handleValidationComplete.bind(this));
    }

    public async getModelInfo(modelId: string, force: boolean = false): Promise<ILLMModelInfo> {
        try {
            // Check memory cache first
            if (!force && this.modelCache.has(modelId)) {
                return { ...this.modelCache.get(modelId)! };
            }

            // Check persistent cache
            const cached = await this.cacheManager.getModelInfo(modelId);
            if (!force && cached) {
                this.modelCache.set(modelId, cached);
                return { ...cached };
            }

            // Load from provider
            const info = await this.loadModelInfo(modelId);
            await this.validateAndCache(info);
            return { ...info };

        } catch (error) {
            this.handleError(new Error(`Failed to get model info for ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }

    private async loadModelInfo(modelId: string): Promise<ILLMModelInfo> {
        try {
            // This would integrate with the model provider to get fresh info
            throw new Error('Method not implemented');
        } catch (error) {
            this.handleError(new Error(`Failed to load model info for ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }

    public async updateModelInfo(modelId: string, info: Partial<ILLMModelInfo>): Promise<void> {
        try {
            const existing = await this.getModelInfo(modelId);
            const updated = { ...existing, ...info };
            await this.validateAndCache(updated);
            this.emit(ModelEvent.ModelUpdated, modelId);
        } catch (error) {
            this.handleError(new Error(`Failed to update model info for ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }

    private async validateAndCache(info: ILLMModelInfo): Promise<void> {
        try {
            const validationResult = await this.validator.validateModel(info);
            if (!validationResult.isValid) {
                throw new Error(`Invalid model info: ${validationResult.issues.join(', ')}`);
            }

            this.modelCache.set(info.id, info);
            await this.cacheManager.cacheModelInfo(info.id, info);

            this.emit(ModelEvent.ModelInfoUpdated, {
                modelId: info.id,
                info
            });
        } catch (error) {
            this.handleError(new Error(`Validation failed for model ${info.id}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }

    public async getAvailableModels(): Promise<ILLMModelInfo[]> {
        return Array.from(this.modelCache.values()).map(info => ({ ...info }));
    }

    public clearCache(modelId?: string): void {
        if (modelId) {
            this.modelCache.delete(modelId);
            this.cacheManager.clearModelInfo(modelId);
        } else {
            this.modelCache.clear();
            this.cacheManager.clearAllModelInfo();
        }
        this.emit('cacheCleared', modelId);
    }

    private handleCacheUpdate(event: { modelId: string; info: ILLMModelInfo }): void {
        this.modelCache.set(event.modelId, event.info);
        this.emit(ModelEvent.ModelInfoUpdated, event);
    }

    private handleValidationComplete(event: { modelId: string; result: any }): void {
        this.emit(ModelEvent.ValidationComplete, event);
    }

    private handleError(error: Error): void {
        this.logger.error('[LLMModelInfoService]', error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.modelCache.clear();
        this.removeAllListeners();
    }
}
