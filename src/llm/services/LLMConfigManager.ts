import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';

export interface IModelConfig {
    modelId: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    systemPrompt?: string;
    stopSequences?: string[];
}

export interface IProviderConfig {
    id: string;
    apiKey?: string;
    endpoint?: string;
    timeout?: number;
    maxRetries?: number;
    maxParallelRequests?: number;
}

export interface IGlobalConfig {
    defaultModel: string;
    defaultProvider: string;
    cacheEnabled: boolean;
    cacheTTL: number;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface IConfigValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

@injectable()
export class LLMConfigManager extends EventEmitter {
    private readonly modelConfigs = new Map<string, IModelConfig>();
    private readonly providerConfigs = new Map<string, IProviderConfig>();
    private globalConfig: IGlobalConfig;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.initializeDefaultConfig();
    }

    private initializeDefaultConfig(): void {
        this.globalConfig = {
            defaultModel: '',
            defaultProvider: '',
            cacheEnabled: true,
            cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
            debugMode: false,
            logLevel: 'info'
        };
    }

    public async setModelConfig(config: IModelConfig): Promise<void> {
        try {
            const validation = this.validateModelConfig(config);
            if (!validation.isValid) {
                throw new Error(`Invalid model config: ${validation.errors.join(', ')}`);
            }

            this.modelConfigs.set(config.modelId, { ...config });
            this.emit('modelConfigUpdated', { modelId: config.modelId, config });
        } catch (error) {
            this.handleError(`Failed to set config for model ${config.modelId}`, error as Error);
            throw error;
        }
    }

    public async setProviderConfig(config: IProviderConfig): Promise<void> {
        try {
            const validation = this.validateProviderConfig(config);
            if (!validation.isValid) {
                throw new Error(`Invalid provider config: ${validation.errors.join(', ')}`);
            }

            this.providerConfigs.set(config.id, { ...config });
            this.emit('providerConfigUpdated', { providerId: config.id, config });
        } catch (error) {
            this.handleError(`Failed to set config for provider ${config.id}`, error as Error);
            throw error;
        }
    }

    public async updateGlobalConfig(config: Partial<IGlobalConfig>): Promise<void> {
        try {
            const validation = this.validateGlobalConfig({ ...this.globalConfig, ...config });
            if (!validation.isValid) {
                throw new Error(`Invalid global config: ${validation.errors.join(', ')}`);
            }

            this.globalConfig = { ...this.globalConfig, ...config };
            this.emit('globalConfigUpdated', { config: this.globalConfig });
        } catch (error) {
            this.handleError('Failed to update global config', error as Error);
            throw error;
        }
    }

    public getModelConfig(modelId: string): IModelConfig {
        const config = this.modelConfigs.get(modelId);
        if (!config) {
            throw new Error(`No configuration found for model ${modelId}`);
        }
        return { ...config };
    }

    public getProviderConfig(providerId: string): IProviderConfig {
        const config = this.providerConfigs.get(providerId);
        if (!config) {
            throw new Error(`No configuration found for provider ${providerId}`);
        }
        return { ...config };
    }

    public getGlobalConfig(): IGlobalConfig {
        return { ...this.globalConfig };
    }

    private validateModelConfig(config: IModelConfig): IConfigValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!config.modelId) {
            errors.push('Model ID is required');
        }

        if (config.temperature < 0 || config.temperature > 1) {
            errors.push('Temperature must be between 0 and 1');
        }

        if (config.maxTokens <= 0) {
            errors.push('Max tokens must be greater than 0');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    private validateProviderConfig(config: IProviderConfig): IConfigValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!config.id) {
            errors.push('Provider ID is required');
        }

        if (config.maxRetries !== undefined && config.maxRetries < 0) {
            errors.push('Max retries cannot be negative');
        }

        if (config.maxParallelRequests !== undefined && config.maxParallelRequests < 1) {
            errors.push('Max parallel requests must be at least 1');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    private validateGlobalConfig(config: IGlobalConfig): IConfigValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!config.defaultModel) {
            warnings.push('No default model specified');
        }

        if (!config.defaultProvider) {
            warnings.push('No default provider specified');
        }

        if (config.cacheTTL < 0) {
            errors.push('Cache TTL cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    public listModelConfigs(): IModelConfig[] {
        return Array.from(this.modelConfigs.values()).map(config => ({ ...config }));
    }

    public listProviderConfigs(): IProviderConfig[] {
        return Array.from(this.providerConfigs.values()).map(config => ({ ...config }));
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[LLMConfigManager]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.modelConfigs.clear();
        this.providerConfigs.clear();
        this.removeAllListeners();
    }
}
