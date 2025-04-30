import { Disposable } from 'vscode';
import { IModelConfiguration, ConfigChangeEvent } from '../types';
export declare class ModelConfigurationService implements Disposable {
    private readonly persistenceIntervalMs;
    private readonly _configEmitter;
    private readonly _configurations;
    private readonly _logger;
    private _persistenceInterval;
    constructor(persistenceIntervalMs?: number);
    getConfiguration(modelId: string): Promise<IModelConfiguration | undefined>;
    setConfiguration(modelId: string, config: Partial<IModelConfiguration>): Promise<void>;
    private validateConfiguration;
    private startPersistence;
    private persistConfiguration;
    private persistAllConfigurations;
    onConfigurationChanged(listener: (event: ConfigChangeEvent) => void): Disposable;
    dispose(): void;
}
