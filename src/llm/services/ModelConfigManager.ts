import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { Logger } from '../../logging/logger';

export interface ModelConfig {
    contextLength?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    maxTokens?: number;
    [key: string]: unknown;
}

interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

@injectable()
export class ModelConfigManager extends EventEmitter implements vscode.Disposable {
    private configStore: Map<string, ModelConfig> = new Map();
    private outputChannel: vscode.OutputChannel;
    private storage: vscode.Memento;
    private pendingUpdates: Set<string> = new Set();
    private batchSaveTimeout: NodeJS.Timeout | null = null;
    private readonly BATCH_SAVE_DELAY = 1000; // 1 second

    constructor(
        @inject(Logger) private readonly logger: Logger,
        @inject('GlobalState') storage: vscode.Memento
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Configuration');
        this.storage = storage;
        this.loadPersistedConfigs();
    }

    public async getConfig(modelId: string): Promise<ModelConfig | undefined> {
        try {
            return this.configStore.get(modelId);
        } catch (error) {
            this.handleError('Failed to get model config', error as Error);
            return undefined;
        }
    }

    public async updateConfig(modelId: string, config: Partial<ModelConfig>): Promise<void> {
        try {
            const currentConfig = this.configStore.get(modelId) || this.createDefaultConfig();
            const newConfig = { ...currentConfig, ...config };

            const validation = await this.validateConfig(newConfig);
            if (!validation.isValid) {
                throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
            }

            this.configStore.set(modelId, newConfig);
            this.scheduleBatchSave(modelId);

            this.emit('configUpdated', modelId, newConfig);
            this.logConfigUpdate(modelId, newConfig);
        } catch (error) {
            this.handleError('Failed to update model config', error as Error);
            throw error;
        }
    }

    public async validateConfig(config: ModelConfig): Promise<ConfigValidationResult> {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate required fields
        if (!this.validateRequiredFields(config, errors)) {
            return { isValid: false, errors, warnings };
        }

        // Validate numerical ranges
        this.validateNumericalRanges(config, errors, warnings);

        // Validate compatibility
        await this.validateCompatibility(config, errors, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    private validateRequiredFields(config: ModelConfig, errors: string[]): boolean {
        const requiredFields = ['contextLength', 'temperature', 'topP'];
        const missingFields = requiredFields.filter(field => config[field] === undefined);

        if (missingFields.length > 0) {
            errors.push(`Missing required fields: ${missingFields.join(', ')}`);
            return false;
        }

        return true;
    }

    private validateNumericalRanges(
        config: ModelConfig,
        errors: string[],
        warnings: string[]
    ): void {
        // Temperature validation
        if (config.temperature !== undefined) {
            if (config.temperature < 0 || config.temperature > 2) {
                errors.push('Temperature must be between 0 and 2');
            } else if (config.temperature > 1.5) {
                warnings.push('High temperature values may lead to less focused outputs');
            }
        }

        // Top-p validation
        if (config.topP !== undefined) {
            if (config.topP < 0 || config.topP > 1) {
                errors.push('Top-p must be between 0 and 1');
            }
        }

        // Context length validation
        if (config.contextLength !== undefined) {
            if (config.contextLength < 0) {
                errors.push('Context length must be positive');
            } else if (config.contextLength > 32768) {
                warnings.push('Very large context lengths may impact performance');
            }
        }
    }

    private async validateCompatibility(
        config: ModelConfig,
        errors: string[],
        warnings: string[]
    ): Promise<void> {
        // Memory requirement validation
        const estimatedMemory = this.estimateMemoryRequirement(config);
        const availableMemory = await this.getAvailableMemory();

        if (estimatedMemory > availableMemory) {
            errors.push('Configuration exceeds available system memory');
        } else if (estimatedMemory > availableMemory * 0.8) {
            warnings.push('Configuration may use most available memory');
        }
    }

    private estimateMemoryRequirement(config: ModelConfig): number {
        // Basic memory estimation based on context length and model size
        const bytesPerToken = 4; // Approximate bytes per token
        const baseMemory = 512 * 1024 * 1024; // 512MB base memory

        return baseMemory + (config.contextLength || 2048) * bytesPerToken;
    }

    private async getAvailableMemory(): Promise<number> {
        // In a real implementation, this would check system memory
        return 16 * 1024 * 1024 * 1024; // Example: 16GB
    }

    private createDefaultConfig(): ModelConfig {
        return {
            contextLength: 2048,
            temperature: 0.7,
            topP: 0.95,
            frequencyPenalty: 0,
            presencePenalty: 0,
            stopSequences: [],
            maxTokens: undefined
        };
    }

    private async persistConfig(modelId: string, config: ModelConfig): Promise<void> {
        try {
            const key = `model-config-${modelId}`;
            await this.storage.update(key, config);
        } catch (error) {
            this.handleError('Failed to persist config', error as Error);
        }
    }

    private async loadPersistedConfigs(): Promise<void> {
        try {
            const keys = await this.storage.keys();
            const configKeys = keys.filter(key => key.startsWith('model-config-'));

            for (const key of configKeys) {
                const modelId = key.replace('model-config-', '');
                const config = await this.storage.get<ModelConfig>(key);
                if (config) {
                    this.configStore.set(modelId, config);
                }
            }

            this.logConfigLoad(configKeys.length);
        } catch (error) {
            this.handleError('Failed to load persisted configs', error as Error);
        }
    }

    private scheduleBatchSave(modelId: string): void {
        this.pendingUpdates.add(modelId);

        if (this.batchSaveTimeout) {
            clearTimeout(this.batchSaveTimeout);
        }

        this.batchSaveTimeout = setTimeout(() => {
            this.persistPendingUpdates();
        }, this.BATCH_SAVE_DELAY);
    }

    private async persistPendingUpdates(): Promise<void> {
        if (this.pendingUpdates.size === 0) return;

        try {
            for (const modelId of this.pendingUpdates) {
                const config = this.configStore.get(modelId);
                if (config) {
                    const key = `model-config-${modelId}`;
                    await this.storage.update(key, config);
                }
            }
            this.pendingUpdates.clear();
        } catch (error) {
            this.handleError('Failed to persist configs', error as Error);
        }
    }

    private logConfigUpdate(modelId: string, config: ModelConfig): void {
        this.outputChannel.appendLine('\nConfiguration Updated:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine(JSON.stringify(config, null, 2));
    }

    private logConfigLoad(count: number): void {
        this.outputChannel.appendLine(`\nLoaded ${count} model configurations`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelConfigManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.configStore.clear();
    }
}
