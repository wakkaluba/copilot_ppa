import { EventEmitter } from 'events';
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
 * Manages configuration for LLM providers
 */
export declare class ProviderConfigManager extends EventEmitter {
    private static instance;
    private configs;
    private defaults;
    private constructor();
    static getInstance(): ProviderConfigManager;
    /**
     * Set provider-specific default configuration
     */
    setProviderDefaults(providerId: string, defaults: Partial<ProviderConfig>): void;
    /**
     * Set configuration for a provider
     */
    setConfig(providerId: string, config: Partial<ProviderConfig>): void;
    /**
     * Get configuration for a provider
     */
    getConfig(providerId: string): ProviderConfig;
    /**
     * Update specific configuration values for a provider
     */
    updateConfig(providerId: string, updates: Partial<ProviderConfig>): void;
    /**
     * Reset provider configuration to defaults
     */
    resetConfig(providerId: string): void;
    /**
     * Clear all configuration for a provider
     */
    clearConfig(providerId: string): void;
    /**
     * Validate provider configuration
     */
    private validateConfig;
    /**
     * Check if a provider has configuration
     */
    hasConfig(providerId: string): boolean;
    /**
     * Get all provider configurations
     */
    getAllConfigs(): Map<string, ProviderConfig>;
    dispose(): void;
}
export {};
