"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderConfigManager = void 0;
const events_1 = require("events");
const errors_1 = require("./errors");
/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
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
class ProviderConfigManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.configs = new Map();
        this.defaults = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProviderConfigManager();
        }
        return this.instance;
    }
    /**
     * Set provider-specific default configuration
     */
    setProviderDefaults(providerId, defaults) {
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
    setConfig(providerId, config) {
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
    getConfig(providerId) {
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
    updateConfig(providerId, updates) {
        const current = this.getConfig(providerId);
        this.setConfig(providerId, {
            ...current,
            ...updates
        });
    }
    /**
     * Reset provider configuration to defaults
     */
    resetConfig(providerId) {
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
    clearConfig(providerId) {
        this.configs.delete(providerId);
        this.defaults.delete(providerId);
        this.emit('configCleared', { providerId });
    }
    /**
     * Validate provider configuration
     */
    validateConfig(providerId) {
        const config = this.getConfig(providerId);
        // Validate required fields based on provider type
        if (config.timeout && config.timeout < 0) {
            throw new errors_1.LLMConnectionError('CONFIG_ERROR', 'Timeout must be a positive number');
        }
        if (config.maxRetries && config.maxRetries < 0) {
            throw new errors_1.LLMConnectionError('CONFIG_ERROR', 'Max retries must be a positive number');
        }
        if (config.temperature && (config.temperature < 0 || config.temperature > 1)) {
            throw new errors_1.LLMConnectionError('CONFIG_ERROR', 'Temperature must be between 0 and 1');
        }
        if (config.maxTokens && config.maxTokens < 1) {
            throw new errors_1.LLMConnectionError('CONFIG_ERROR', 'Max tokens must be greater than 0');
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
    hasConfig(providerId) {
        return this.configs.has(providerId);
    }
    /**
     * Get all provider configurations
     */
    getAllConfigs() {
        const allConfigs = new Map();
        for (const [providerId] of this.configs) {
            allConfigs.set(providerId, this.getConfig(providerId));
        }
        return allConfigs;
    }
    dispose() {
        this.configs.clear();
        this.defaults.clear();
        this.removeAllListeners();
    }
}
exports.ProviderConfigManager = ProviderConfigManager;
//# sourceMappingURL=ProviderConfigManager.js.map