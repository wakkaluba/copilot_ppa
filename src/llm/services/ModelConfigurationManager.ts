import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { ModelConfig, LLMModelInfo } from '../types';

@injectable()
export class ModelConfigurationManager extends EventEmitter implements vscode.Disposable {
    private readonly configMap = new Map<string, ModelConfig>();
    private readonly defaultConfigs = new Map<string, ModelConfig>();
    private readonly outputChannel: vscode.OutputChannel;
    private readonly storageKey = 'model-configurations';

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Configuration');
        this.loadPersistedConfigs();
    }

    public async updateConfig(modelId: string, config: Partial<ModelConfig>): Promise<void> {
        try {
            const currentConfig = this.configMap.get(modelId) || this.getDefaultConfig(modelId);
            const newConfig = { ...currentConfig, ...config };
            
            await this.validateConfig(newConfig);
            this.configMap.set(modelId, newConfig);
            
            this.emit('configUpdated', { modelId, config: newConfig });
            this.logConfigChange(modelId, currentConfig, newConfig);
            await this.persistConfigs();
        } catch (error) {
            this.handleError('Failed to update configuration', error as Error);
            throw error;
        }
    }

    public getConfig(modelId: string): ModelConfig {
        return this.configMap.get(modelId) || this.getDefaultConfig(modelId);
    }

    public setDefaultConfig(modelId: string, config: ModelConfig): void {
        this.defaultConfigs.set(modelId, config);
        this.emit('defaultConfigSet', { modelId, config });
    }

    public async resetConfig(modelId: string): Promise<void> {
        try {
            const defaultConfig = this.getDefaultConfig(modelId);
            this.configMap.delete(modelId);
            this.emit('configReset', { modelId, config: defaultConfig });
            await this.persistConfigs();
        } catch (error) {
            this.handleError('Failed to reset configuration', error as Error);
            throw error;
        }
    }

    private getDefaultConfig(modelId: string): ModelConfig {
        return this.defaultConfigs.get(modelId) || {
            maxTokens: 2048,
            temperature: 0.7,
            topP: 0.9,
            presencePenalty: 0,
            frequencyPenalty: 0,
            stopSequences: []
        };
    }

    private async validateConfig(config: ModelConfig): Promise<void> {
        const errors: string[] = [];

        // Validate maxTokens
        if (config.maxTokens < 1) {
            errors.push('maxTokens must be greater than 0');
        }

        // Validate temperature
        if (config.temperature < 0 || config.temperature > 2) {
            errors.push('temperature must be between 0 and 2');
        }

        // Validate topP
        if (config.topP < 0 || config.topP > 1) {
            errors.push('topP must be between 0 and 1');
        }

        // Validate penalties
        if (config.presencePenalty < -2 || config.presencePenalty > 2) {
            errors.push('presencePenalty must be between -2 and 2');
        }
        if (config.frequencyPenalty < -2 || config.frequencyPenalty > 2) {
            errors.push('frequencyPenalty must be between -2 and 2');
        }

        // Validate stop sequences
        if (!Array.isArray(config.stopSequences)) {
            errors.push('stopSequences must be an array');
        }

        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }
    }

    private async persistConfigs(): Promise<void> {
        try {
            const configData = Array.from(this.configMap.entries()).map(([id, config]) => ({
                modelId: id,
                config
            }));

            await vscode.workspace.getConfiguration().update(
                this.storageKey,
                configData,
                vscode.ConfigurationTarget.Global
            );
        } catch (error) {
            this.handleError('Failed to persist configurations', error as Error);
        }
    }

    private async loadPersistedConfigs(): Promise<void> {
        try {
            const configData = vscode.workspace.getConfiguration().get<any[]>(this.storageKey) || [];
            
            for (const data of configData) {
                if (data.modelId && data.config) {
                    await this.validateConfig(data.config);
                    this.configMap.set(data.modelId, data.config);
                }
            }
        } catch (error) {
            this.handleError('Failed to load persisted configurations', error as Error);
        }
    }

    private logConfigChange(
        modelId: string, 
        oldConfig: ModelConfig, 
        newConfig: ModelConfig
    ): void {
        this.outputChannel.appendLine('\nModel Configuration Change:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine('Changes:');
        
        for (const key of Object.keys(newConfig) as Array<keyof ModelConfig>) {
            if (oldConfig[key] !== newConfig[key]) {
                this.outputChannel.appendLine(`  ${key}: ${oldConfig[key]} -> ${newConfig[key]}`);
            }
        }
        
        this.outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelConfigurationManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.configMap.clear();
        this.defaultConfigs.clear();
    }
}
