"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConfigurationService = void 0;
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
class ModelConfigurationService {
    persistenceIntervalMs;
    _configEmitter = new events_1.EventEmitter();
    _configurations = new Map();
    _logger;
    _persistenceInterval = null;
    constructor(persistenceIntervalMs = 5000) {
        this.persistenceIntervalMs = persistenceIntervalMs;
        this._logger = logger_1.Logger.for('ModelConfigurationService');
        this.startPersistence();
    }
    async getConfiguration(modelId) {
        try {
            return this._configurations.get(modelId);
        }
        catch (error) {
            this._logger.error('Failed to get configuration', { modelId, error });
            throw error;
        }
    }
    async setConfiguration(modelId, config) {
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
            });
            await this.persistConfiguration(modelId);
        }
        catch (error) {
            this._logger.error('Failed to set configuration', { modelId, error });
            throw error;
        }
    }
    async validateConfiguration(config) {
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
        }
        catch (error) {
            this._logger.error('Configuration validation failed', { config, error });
            throw error;
        }
    }
    startPersistence() {
        if (this._persistenceInterval)
            return;
        this._persistenceInterval = setInterval(() => this.persistAllConfigurations(), this.persistenceIntervalMs);
    }
    async persistConfiguration(modelId) {
        try {
            const config = this._configurations.get(modelId);
            if (!config)
                return;
            // Add persistence logic here
            // This could write to disk, database, etc.
        }
        catch (error) {
            this._logger.error('Failed to persist configuration', { modelId, error });
            throw error;
        }
    }
    async persistAllConfigurations() {
        try {
            const persistPromises = Array.from(this._configurations.entries())
                .map(([modelId]) => this.persistConfiguration(modelId));
            await Promise.all(persistPromises);
        }
        catch (error) {
            this._logger.error('Failed to persist configurations', { error });
        }
    }
    onConfigurationChanged(listener) {
        this._configEmitter.on('configChanged', listener);
        return {
            dispose: () => this._configEmitter.removeListener('configChanged', listener)
        };
    }
    dispose() {
        if (this._persistenceInterval) {
            clearInterval(this._persistenceInterval);
            this._persistenceInterval = null;
        }
        this._configEmitter.removeAllListeners();
        this._configurations.clear();
    }
}
exports.ModelConfigurationService = ModelConfigurationService;
//# sourceMappingURL=ModelConfigurationService.js.map