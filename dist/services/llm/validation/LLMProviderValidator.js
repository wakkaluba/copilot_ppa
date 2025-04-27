"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderValidator = void 0;
class LLMProviderValidator {
    validateConfig(config) {
        const errors = [];
        // Check required fields
        for (const field of LLMProviderValidator.REQUIRED_CONFIG_FIELDS) {
            if (!config[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        // Validate connection config
        if (config.connection) {
            if (typeof config.connection.timeout !== 'number' || config.connection.timeout <= 0) {
                errors.push('Connection timeout must be a positive number');
            }
            if (config.connection.poolSize !== undefined) {
                if (typeof config.connection.poolSize !== 'number' ||
                    config.connection.poolSize < 1 ||
                    config.connection.poolSize > 20) {
                    errors.push('Connection pool size must be between 1 and 20');
                }
            }
            if (config.connection.retryAttempts !== undefined) {
                if (typeof config.connection.retryAttempts !== 'number' ||
                    config.connection.retryAttempts < 0) {
                    errors.push('Retry attempts must be a non-negative number');
                }
            }
        }
        // Validate API endpoint
        try {
            new URL(config.apiEndpoint);
        }
        catch {
            errors.push('Invalid API endpoint URL');
        }
        // Validate authentication if provided
        if (config.authentication) {
            if (!config.authentication.type) {
                errors.push('Authentication type is required when authentication is provided');
            }
            switch (config.authentication.type) {
                case 'apiKey':
                    if (!config.authentication.apiKey) {
                        errors.push('API key is required for apiKey authentication');
                    }
                    break;
                case 'bearer':
                    if (!config.authentication.token) {
                        errors.push('Token is required for bearer authentication');
                    }
                    break;
                case 'basic':
                    if (!config.authentication.username || !config.authentication.password) {
                        errors.push('Username and password are required for basic authentication');
                    }
                    break;
                default:
                    errors.push(`Unsupported authentication type: ${config.authentication.type}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateHealth(result) {
        const errors = [];
        if (typeof result.isHealthy !== 'boolean') {
            errors.push('Health check must return a boolean isHealthy status');
        }
        if (typeof result.latency !== 'number' || result.latency < 0) {
            errors.push('Health check latency must be a non-negative number');
        }
        if (typeof result.timestamp !== 'number' || result.timestamp < 0) {
            errors.push('Health check timestamp must be a non-negative number');
        }
        if (!result.isHealthy && !result.error) {
            errors.push('Unhealthy status must include an error description');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async validateProvider(provider) {
        const errors = [];
        try {
            // Validate required methods
            const requiredMethods = [
                'connect',
                'disconnect',
                'healthCheck',
                'generateCompletion',
                'generateChatCompletion'
            ];
            for (const method of requiredMethods) {
                if (typeof provider[method] !== 'function') {
                    errors.push(`Provider must implement ${method} method`);
                }
            }
            // Validate provider ID
            if (!provider.id || typeof provider.id !== 'string') {
                errors.push('Provider must have a valid string ID');
            }
            // Validate capabilities
            const capabilities = await provider.getCapabilities();
            if (!capabilities) {
                errors.push('Provider must return capabilities');
            }
            else {
                if (!Array.isArray(capabilities.supportedModels)) {
                    errors.push('Provider capabilities must include supportedModels array');
                }
                if (typeof capabilities.supportsStreaming !== 'boolean') {
                    errors.push('Provider capabilities must specify supportsStreaming');
                }
            }
            // Validate health check functionality
            const health = await provider.healthCheck();
            const healthValidation = this.validateHealth(health);
            if (!healthValidation.isValid) {
                errors.push(...healthValidation.errors);
            }
        }
        catch (error) {
            errors.push(`Provider validation failed: ${error.message}`);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateResponse(response) {
        const errors = [];
        if (!response) {
            errors.push('Response cannot be null or undefined');
            return { isValid: false, errors };
        }
        if (typeof response.content !== 'string' || response.content.length === 0) {
            errors.push('Response must contain non-empty content string');
        }
        if (response.usage) {
            const { promptTokens, completionTokens, totalTokens } = response.usage;
            if (!Number.isInteger(promptTokens) || promptTokens < 0) {
                errors.push('promptTokens must be a non-negative integer');
            }
            if (!Number.isInteger(completionTokens) || completionTokens < 0) {
                errors.push('completionTokens must be a non-negative integer');
            }
            if (!Number.isInteger(totalTokens) || totalTokens < 0) {
                errors.push('totalTokens must be a non-negative integer');
            }
            if (totalTokens !== (promptTokens + completionTokens)) {
                errors.push('totalTokens must equal promptTokens + completionTokens');
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.LLMProviderValidator = LLMProviderValidator;
LLMProviderValidator.REQUIRED_CONFIG_FIELDS = [
    'apiEndpoint',
    'connection'
];
//# sourceMappingURL=LLMProviderValidator.js.map