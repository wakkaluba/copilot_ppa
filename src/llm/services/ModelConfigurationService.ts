import { EventEmitter } from 'events';
import { Disposable } from 'vscode';
import { Logger } from '../../utils/logger';
import { IModelConfiguration, ConfigChangeEvent } from '../types';

export class ModelConfigurationService implements Disposable {
    private readonly _configEmitter = new EventEmitter();
    private readonly _configurations = new Map<string, IModelConfiguration>();
    private readonly _logger: Logger;
    private _persistenceInterval: NodeJS.Timer | null = null;

    constructor(private readonly persistenceIntervalMs: number = 5000) {
        this._logger = Logger.for('ModelConfigurationService');
        this.startPersistence();
    }

    public async getConfiguration(modelId: string): Promise<IModelConfiguration | undefined> {
        try {
            return this._configurations.get(modelId);
        } catch (error) {
            this._logger.error('Failed to get configuration', { modelId, error });
            throw error;
        }
    }

    public async setConfiguration(modelId: string, config: Partial<IModelConfiguration>): Promise<void> {
        try {
            const currentConfig = this._configurations.get(modelId) || {};
            const validatedConfig = await this.validateConfiguration({
                ...currentConfig,
                ...config
            });

            this._configurations.set(modelId, validatedConfig);
            
            this._configEmitter.emit('configChanged', {
                modelId,
                oldConfig: currentConfig,
                newConfig: validatedConfig
            } as ConfigChangeEvent);

            await this.persistConfiguration(modelId);
        } catch (error) {
            this._logger.error('Failed to set configuration', { modelId, error });
            throw error;
        }
    }

    private async validateConfiguration(config: IModelConfiguration): Promise<IModelConfiguration> {
        try {
            // Add validation logic here
            if (!config.modelType) {
                throw new Error('Model type is required');
            }

            // Validate memory requirements
            if (config.memoryRequirements) {
                if (config.memoryRequirements < 0) {
                    throw new Error('Memory requirements must be positive');
                }
            }

            // Validate thread count
            if (config.threadCount) {
                if (config.threadCount < 1) {
                    throw new Error('Thread count must be at least 1');
                }
            }

            return config;
        } catch (error) {
            this._logger.error('Configuration validation failed', { config, error });
            throw error;
        }
    }

    private startPersistence(): void {
        if (this._persistenceInterval) return;

        this._persistenceInterval = setInterval(
            () => this.persistAllConfigurations(),
            this.persistenceIntervalMs
        );
    }

    private async persistConfiguration(modelId: string): Promise<void> {
        try {
            const config = this._configurations.get(modelId);
            if (!config) return;

            // Add persistence logic here
            // This could write to disk, database, etc.
        } catch (error) {
            this._logger.error('Failed to persist configuration', { modelId, error });
            throw error;
        }
    }

    private async persistAllConfigurations(): Promise<void> {
        try {
            const persistPromises = Array.from(this._configurations.entries())
                .map(([modelId]) => this.persistConfiguration(modelId));
            await Promise.all(persistPromises);
        } catch (error) {
            this._logger.error('Failed to persist configurations', { error });
        }
    }

    public onConfigurationChanged(listener: (event: ConfigChangeEvent) => void): Disposable {
        this._configEmitter.on('configChanged', listener);
        return {
            dispose: () => this._configEmitter.removeListener('configChanged', listener)
        };
    }

    public dispose(): void {
        if (this._persistenceInterval) {
            clearInterval(this._persistenceInterval);
            this._persistenceInterval = null;
        }
        this._configEmitter.removeAllListeners();
        this._configurations.clear();
    }
}
