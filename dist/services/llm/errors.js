"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelNotFoundError = exports.ProviderError = exports.ConfigurationError = exports.LLMConnectionError = void 0;
class LLMConnectionError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'LLMConnectionError';
    }
}
exports.LLMConnectionError = LLMConnectionError;
class ConfigurationError extends Error {
    constructor(message, providerId, setting) {
        super(message);
        this.providerId = providerId;
        this.setting = setting;
        this.name = 'ConfigurationError';
    }
}
exports.ConfigurationError = ConfigurationError;
class ProviderError extends Error {
    constructor(message, providerId) {
        super(message);
        this.providerId = providerId;
        this.name = 'ProviderError';
    }
}
exports.ProviderError = ProviderError;
class ModelNotFoundError extends Error {
    constructor(modelId) {
        super(`Model ${modelId} not found`);
        this.name = 'ModelNotFoundError';
    }
}
exports.ModelNotFoundError = ModelNotFoundError;
//# sourceMappingURL=errors.js.map