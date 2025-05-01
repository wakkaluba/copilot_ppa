import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { LLMConnectionError } from './errors';

/**
 * Provider configuration options
 */
interface ProviderConfig {
    apiKey?: string;
    apiEndpoint?: string;
    timeout?: number;
    maxRetries?: number;
    batchSize?: number;
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
    contextWindow?: number;
    customHeaders?: Record<string, string>;
    proxySettings?: {
        host: string;
        port: number;
        auth?: {
            username: string;
            password: string;
        };
    };
    _timestamp?: number;
    [key: string]: unknown;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<Omit<ProviderConfig, 'apiKey' | 'apiEndpoint' | 'customHeaders' | 'proxySettings'>> = {
    timeout: 30000,
    maxRetries: 3,
    batchSize: 10,
    modelName: 'default',
    temperature: 0.7,
    maxTokens: 2048,
    contextWindow: 4096
};

/**
 * Manages configuration for LLM providers
 */
export class ProviderConfigManager extends EventEmitter {
    private static instance: ProviderConfigManager;
    private configs: Map<string, ProviderConfig> = new Map();
    private defaults: Map<string, Partial<ProviderConfig>> = new Map();
    private configCache: Map<string, ProviderConfig> = new Map();
    private pendingUpdates: Set<string> = new Set();
    private batchSaveTimeout: NodeJS.Timeout | null = null;
    private readonly BATCH_SAVE_DELAY = 1000; // 1 second
    private readonly CACHE_TTL = 5000; // 5 seconds

    private constructor() {
        super();
        this.loadPersistedConfigs();
    }

    public static getInstance(): ProviderConfigManager {
        if (!ProviderConfigManager.instance) {
            ProviderConfigManager.instance = new ProviderConfigManager();
        }
        return ProviderConfigManager.instance;
    }

    private async loadPersistedConfigs(): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration('llm.providers');
            for (const providerId of Object.keys(config)) {
                const providerConfig = config.get<ProviderConfig>(providerId);
                if (providerConfig) {
                    this.configs.set(providerId, providerConfig);
                }
            }
        } catch (error) {
            console.error('Failed to load persisted provider configs:', error);
        }
    }

    private getCachedConfig(providerId: string): ProviderConfig | undefined {
        const cached = this.configCache.get(providerId);
        if (cached && cached._timestamp && Date.now() - cached._timestamp < this.CACHE_TTL) {
            return cached;
        }
        return undefined;
    }

    private setCachedConfig(providerId: string, config: ProviderConfig): void {
        this.configCache.set(providerId, {
            ...config,
            _timestamp: Date.now()
        });
    }

    public setProviderDefaults(providerId: string, defaults: Partial<ProviderConfig>): void {
        this.defaults.set(providerId, {
            ...DEFAULT_CONFIG,
            ...defaults
        });

        const existing = this.configs.get(providerId);
        if (existing) {
            this.configs.set(providerId, {
                ...this.defaults.get(providerId),
                ...existing
            });
            this.configCache.delete(providerId);
            this.scheduleBatchSave(providerId);
            this.emit('configUpdated', {
                providerId,
                config: this.getConfig(providerId)
            });
        }
    }

    public getConfig(providerId: string): ProviderConfig {
        const cached = this.getCachedConfig(providerId);
        if (cached) {
            return cached;
        }

        const config = this.configs.get(providerId);
        const defaults = this.defaults.get(providerId) || DEFAULT_CONFIG;
        const mergedConfig = {
            ...defaults,
            ...config
        };

        this.setCachedConfig(providerId, mergedConfig);
        return mergedConfig;
    }

    public setConfig(providerId: string, config: Partial<ProviderConfig>): void {
        const defaults = this.defaults.get(providerId) || DEFAULT_CONFIG;
        const existing = this.configs.get(providerId) || {};

        this.configs.set(providerId, {
            ...defaults,
            ...existing,
            ...config
        });

        this.configCache.delete(providerId);
        this.validateConfig(providerId);
        this.scheduleBatchSave(providerId);

        this.emit('configUpdated', {
            providerId,
            config: this.getConfig(providerId)
        });
    }

    private scheduleBatchSave(providerId: string): void {
        this.pendingUpdates.add(providerId);

        if (this.batchSaveTimeout) {
            clearTimeout(this.batchSaveTimeout);
        }

        this.batchSaveTimeout = setTimeout(async () => {
            await this.persistPendingUpdates();
        }, this.BATCH_SAVE_DELAY);
    }

    private async persistPendingUpdates(): Promise<void> {
        if (this.pendingUpdates.size === 0) return;

        try {
            const config = vscode.workspace.getConfiguration('llm.providers');
            for (const providerId of this.pendingUpdates) {
                const providerConfig = this.configs.get(providerId);
                if (providerConfig) {
                    await config.update(providerId, providerConfig, vscode.ConfigurationTarget.Global);
                }
            }
            this.pendingUpdates.clear();
        } catch (error) {
            console.error('Failed to persist provider configs:', error);
        }
    }

    public updateConfig(
        providerId: string,
        updates: Partial<ProviderConfig>
    ): void {
        const current = this.getConfig(providerId);
        this.setConfig(providerId, {
            ...current,
            ...updates
        });
    }

    public resetConfig(providerId: string): void {
        const defaults = this.defaults.get(providerId) || DEFAULT_CONFIG;
        this.configs.set(providerId, { ...defaults });

        this.emit('configReset', {
            providerId,
            config: this.getConfig(providerId)
        });
    }

    public clearConfig(providerId: string): void {
        this.configs.delete(providerId);
        this.defaults.delete(providerId);

        this.emit('configCleared', { providerId });
    }

    private validateConfig(providerId: string): void {
        const config = this.getConfig(providerId);

        if (config.timeout && config.timeout < 0) {
            throw new LLMConnectionError(
                'CONFIG_ERROR',
                'Timeout must be a positive number'
            );
        }

        if (config.maxRetries && config.maxRetries < 0) {
            throw new LLMConnectionError(
                'CONFIG_ERROR',
                'Max retries must be a positive number'
            );
        }

        if (config.temperature && (config.temperature < 0 || config.temperature > 1)) {
            throw new LLMConnectionError(
                'CONFIG_ERROR',
                'Temperature must be between 0 and 1'
            );
        }

        if (config.maxTokens && config.maxTokens < 1) {
            throw new LLMConnectionError(
                'CONFIG_ERROR',
                'Max tokens must be greater than 0'
            );
        }

        this.emit('configValidated', {
            providerId,
            config: this.getConfig(providerId)
        });
    }

    public hasConfig(providerId: string): boolean {
        return this.configs.has(providerId);
    }

    public getAllConfigs(): Map<string, ProviderConfig> {
        const allConfigs = new Map<string, ProviderConfig>();

        for (const [providerId] of this.configs) {
            allConfigs.set(providerId, this.getConfig(providerId));
        }

        return allConfigs;
    }

    public dispose(): void {
        if (this.batchSaveTimeout) {
            clearTimeout(this.batchSaveTimeout);
        }
        this.persistPendingUpdates().catch(console.error);
        this.configs.clear();
        this.defaults.clear();
        this.configCache.clear();
        this.removeAllListeners();
    }
}
