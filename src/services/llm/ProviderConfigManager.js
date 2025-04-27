"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderConfigManager = void 0;
var events_1 = require("events");
var errors_1 = require("./errors");
/**
 * Default configuration values
 */
var DEFAULT_CONFIG = {
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
var ProviderConfigManager = /** @class */ (function (_super) {
    __extends(ProviderConfigManager, _super);
    function ProviderConfigManager() {
        var _this = _super.call(this) || this;
        _this.configs = new Map();
        _this.defaults = new Map();
        return _this;
    }
    ProviderConfigManager.getInstance = function () {
        if (!this.instance) {
            this.instance = new ProviderConfigManager();
        }
        return this.instance;
    };
    /**
     * Set provider-specific default configuration
     */
    ProviderConfigManager.prototype.setProviderDefaults = function (providerId, defaults) {
        this.defaults.set(providerId, __assign(__assign({}, DEFAULT_CONFIG), defaults));
        // Update existing config if it exists
        var existing = this.configs.get(providerId);
        if (existing) {
            this.configs.set(providerId, __assign(__assign({}, this.defaults.get(providerId)), existing));
            this.emit('configUpdated', {
                providerId: providerId,
                config: this.getConfig(providerId)
            });
        }
    };
    /**
     * Set configuration for a provider
     */
    ProviderConfigManager.prototype.setConfig = function (providerId, config) {
        var defaults = this.defaults.get(providerId) || DEFAULT_CONFIG;
        var existing = this.configs.get(providerId) || {};
        this.configs.set(providerId, __assign(__assign(__assign({}, defaults), existing), config));
        this.validateConfig(providerId);
        this.emit('configUpdated', {
            providerId: providerId,
            config: this.getConfig(providerId)
        });
    };
    /**
     * Get configuration for a provider
     */
    ProviderConfigManager.prototype.getConfig = function (providerId) {
        var config = this.configs.get(providerId);
        var defaults = this.defaults.get(providerId) || DEFAULT_CONFIG;
        return __assign(__assign({}, defaults), config);
    };
    /**
     * Update specific configuration values for a provider
     */
    ProviderConfigManager.prototype.updateConfig = function (providerId, updates) {
        var current = this.getConfig(providerId);
        this.setConfig(providerId, __assign(__assign({}, current), updates));
    };
    /**
     * Reset provider configuration to defaults
     */
    ProviderConfigManager.prototype.resetConfig = function (providerId) {
        var defaults = this.defaults.get(providerId) || DEFAULT_CONFIG;
        this.configs.set(providerId, __assign({}, defaults));
        this.emit('configReset', {
            providerId: providerId,
            config: this.getConfig(providerId)
        });
    };
    /**
     * Clear all configuration for a provider
     */
    ProviderConfigManager.prototype.clearConfig = function (providerId) {
        this.configs.delete(providerId);
        this.defaults.delete(providerId);
        this.emit('configCleared', { providerId: providerId });
    };
    /**
     * Validate provider configuration
     */
    ProviderConfigManager.prototype.validateConfig = function (providerId) {
        var config = this.getConfig(providerId);
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
            providerId: providerId,
            config: this.getConfig(providerId)
        });
    };
    /**
     * Check if a provider has configuration
     */
    ProviderConfigManager.prototype.hasConfig = function (providerId) {
        return this.configs.has(providerId);
    };
    /**
     * Get all provider configurations
     */
    ProviderConfigManager.prototype.getAllConfigs = function () {
        var allConfigs = new Map();
        for (var _i = 0, _a = this.configs; _i < _a.length; _i++) {
            var providerId = _a[_i][0];
            allConfigs.set(providerId, this.getConfig(providerId));
        }
        return allConfigs;
    };
    ProviderConfigManager.prototype.dispose = function () {
        this.configs.clear();
        this.defaults.clear();
        this.removeAllListeners();
    };
    return ProviderConfigManager;
}(events_1.EventEmitter));
exports.ProviderConfigManager = ProviderConfigManager;
