import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { ModelConfig } from '../types';
export declare class ModelConfigurationManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly configMap;
    private readonly defaultConfigs;
    private readonly outputChannel;
    private readonly storageKey;
    constructor(logger: ILogger);
    updateConfig(modelId: string, config: Partial<ModelConfig>): Promise<void>;
    getConfig(modelId: string): ModelConfig;
    setDefaultConfig(modelId: string, config: ModelConfig): void;
    resetConfig(modelId: string): Promise<void>;
    private getDefaultConfig;
    private validateConfig;
    private persistConfigs;
    private loadPersistedConfigs;
    private logConfigChange;
    private handleError;
    dispose(): void;
}
