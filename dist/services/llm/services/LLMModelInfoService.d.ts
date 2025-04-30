import { ILogger } from '../../../logging/ILogger';
import { EventEmitter } from 'events';
import { LLMModelInfo } from '../types';
import { LLMCacheManager } from '../LLMCacheManager';
import { LLMModelValidator } from './LLMModelValidator';
export declare class LLMModelInfoService extends EventEmitter {
    private readonly logger;
    private readonly modelCache;
    private readonly cacheManager;
    private readonly validator;
    constructor(logger: ILogger, cacheManager: LLMCacheManager, validator: LLMModelValidator);
    private setupEventListeners;
    getModelInfo(modelId: string, force?: boolean): Promise<LLMModelInfo>;
    private loadModelInfo;
    updateModelInfo(modelId: string, info: Partial<LLMModelInfo>): Promise<void>;
    private validateAndCache;
    getAvailableModels(): Promise<LLMModelInfo[]>;
    clearCache(modelId?: string): void;
    private handleCacheUpdate;
    private handleValidationComplete;
    private handleError;
    dispose(): void;
}
