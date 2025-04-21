import { EventEmitter } from 'events';
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

    private constructor() {
        super();
    }

    public static getInstance(): ProviderConfigManager {
        if (!this.instance) {
            this.instance = new ProviderConfigManager();
        }
        return this.instance;
    }

    /**
     * Set provider-specific default configuration
     */
    public setProviderDefaults(
        providerId: string,
        defaults: Partial<ProviderConfig>
    ): void {
        this.defaults.set(providerId, {
            ...DEFAULT_CONFIG,
            ...defaults
        });

        // Update existing config if it exists
        const existing = this.configs.get(providerId);
        if (existing) {
            this.configs.set(providerId, {
                ...this.defaults.get(providerId),
                ...existing
            });
            this.emit('configUpdated', {
                providerId,
                config: this.getConfig(providerId)
            });
        }
    }

    /**
     * Set configuration for a provider
     */
    public setConfig(
        providerId: string,
        config: Partial<ProviderConfig>
    ): void {
        const defaults = this.defaults.get(providerId) || DEFAULT_CONFIG;
        const existing = this.configs.get(providerId) || {};

        this.configs.set(providerId, {
            ...defaults,
            ...existing,
            ...config
        });

        this.validateConfig(providerId);
        
        this.emit('configUpdated', {
            providerId,
            config: this.getConfig(providerId)
        });
    }

    /**
     * Get configuration for a provider
     */
    public getConfig(providerId: string): ProviderConfig {
        const config = this.configs.get(providerId);
        const defaults = this.defaults.get(providerId) || DEFAULT_CONFIG;

        return {
            ...defaults,
            ...config
        };
    }

    /**
     * Update specific configuration values for a provider
     */
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

    /**
     * Reset provider configuration to defaults
     */
    public resetConfig(providerId: string): void {
        const defaults = this.defaults.get(providerId) || DEFAULT_CONFIG;
        this.configs.set(providerId, { ...defaults });
        
        this.emit('configReset', {
            providerId,
            config: this.getConfig(providerId)
        });
    }

    /**
     * Clear all configuration for a provider
     */
    public clearConfig(providerId: string): void {
        this.configs.delete(providerId);
        this.defaults.delete(providerId);
        
        this.emit('configCleared', { providerId });
    }

    /**
     * Validate provider configuration
     */
    private validateConfig(providerId: string): void {
        const config = this.getConfig(providerId);

        // Validate required fields based on provider type
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

        // Provider-specific validation can be added here
        this.emit('configValidated', {
            providerId,
            config: this.getConfig(providerId)
        });
    }

    /**
     * Check if a provider has configuration
     */
    public hasConfig(providerId: string): boolean {
        return this.configs.has(providerId);
    }

    /**
     * Get all provider configurations
     */
    public getAllConfigs(): Map<string, ProviderConfig> {
        const allConfigs = new Map<string, ProviderConfig>();
        
        for (const [providerId] of this.configs) {
            allConfigs.set(providerId, this.getConfig(providerId));
        }
        
        return allConfigs;
    }

    public dispose(): void {
        this.configs.clear();
        this.defaults.clear();
        this.removeAllListeners();
    }
}