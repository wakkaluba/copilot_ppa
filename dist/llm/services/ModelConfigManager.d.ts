import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { ModelConfig } from '../types';
interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class ModelConfigManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly outputChannel;
    private readonly configStore;
    private readonly storage;
    constructor(logger: ILogger, storage: vscode.Memento);
    getConfig(modelId: string): Promise<ModelConfig | undefined>;
    updateConfig(modelId: string, config: Partial<ModelConfig>): Promise<void>;
    validateConfig(config: ModelConfig): Promise<ConfigValidationResult>;
    private validateRequiredFields;
    private validateNumericalRanges;
    private validateCompatibility;
    private estimateMemoryRequirement;
    private getAvailableMemory;
    private createDefaultConfig;
    private persistConfig;
    private loadPersistedConfigs;
    private logConfigUpdate;
    private logConfigLoad;
    private handleError;
    dispose(): void;
}
export {};
