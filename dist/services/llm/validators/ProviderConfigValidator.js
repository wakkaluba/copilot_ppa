"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderConfigValidator = void 0;
class ProviderConfigValidator {
    async validateConfig(config) {
        const errors = [];
        // Validate required fields
        if (!config.apiEndpoint) {
            errors.push('Configuration must include apiEndpoint');
        }
        // Validate connection settings
        if (config.connection) {
            if (typeof config.connection.timeout !== 'number' || config.connection.timeout <= 0) {
                errors.push('Connection timeout must be a positive number');
            }
            if (config.connection.retries !== undefined) {
                if (typeof config.connection.retries !== 'number' || config.connection.retries < 0) {
                    errors.push('Connection retries must be a non-negative number');
                }
            }
            if (config.connection.poolSize !== undefined) {
                if (typeof config.connection.poolSize !== 'number' || config.connection.poolSize <= 0) {
                    errors.push('Connection pool size must be a positive number');
                }
            }
        }
        // Validate model settings
        if (config.model) {
            if (!config.model.name) {
                errors.push('Model configuration must include model name');
            }
            if (config.model.contextLength !== undefined) {
                if (typeof config.model.contextLength !== 'number' || config.model.contextLength <= 0) {
                    errors.push('Model context length must be a positive number');
                }
            }
        }
        // Validate request settings
        if (config.requestDefaults) {
            const validTemperatureRange = config.requestDefaults.temperature === undefined ||
                (typeof config.requestDefaults.temperature === 'number' &&
                    config.requestDefaults.temperature >= 0 &&
                    config.requestDefaults.temperature <= 1);
            if (!validTemperatureRange) {
                errors.push('Temperature must be between 0 and 1');
            }
            if (config.requestDefaults.maxTokens !== undefined) {
                if (typeof config.requestDefaults.maxTokens !== 'number' || config.requestDefaults.maxTokens <= 0) {
                    errors.push('Max tokens must be a positive number');
                }
            }
        }
        // Validate health check settings
        if (config.healthCheck) {
            if (typeof config.healthCheck.interval !== 'number' || config.healthCheck.interval < 5000) {
                errors.push('Health check interval must be at least 5000ms');
            }
            if (typeof config.healthCheck.timeout !== 'number' || config.healthCheck.timeout <= 0) {
                errors.push('Health check timeout must be a positive number');
            }
        }
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}
exports.ProviderConfigValidator = ProviderConfigValidator;
//# sourceMappingURL=ProviderConfigValidator.js.map