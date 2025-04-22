"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = exports.TokenError = exports.RequestError = exports.HealthCheckError = exports.ConfigurationError = exports.ValidationError = exports.ModelError = exports.ConnectionError = exports.ProviderError = exports.Error = exports.RateLimitError = exports.ModelNotFoundError = exports.AuthenticationError = exports.ProviderUnavailableError = exports.ConnectionTimeoutError = exports.LLMConnectionError = void 0;
/**
 * Error handling for LLM connections
 */
const interfaces_1 = require("./interfaces");
/**
 * Base error class for LLM connection errors
 */
class LLMConnectionError extends Error {
    code;
    cause;
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'LLMConnectionError';
    }
    /**
     * Get full error details including cause
     */
    getFullMessage() {
        const details = [
            `${this.name}: ${this.message}`,
            `Code: ${this.code}`
        ];
        if (this.cause) {
            details.push(`Caused by: ${this.cause.message}`);
            if (this.cause.stack) {
                details.push(this.cause.stack);
            }
        }
        return details.join('\n');
    }
}
exports.LLMConnectionError = LLMConnectionError;
/**
 * Error thrown when connection times out
 */
class ConnectionTimeoutError extends LLMConnectionError {
    constructor(message = 'Connection timed out', cause) {
        super(interfaces_1.ConnectionErrorCode.TIMEOUT, message, cause);
        this.name = 'ConnectionTimeoutError';
    }
}
exports.ConnectionTimeoutError = ConnectionTimeoutError;
/**
 * Error thrown when provider is not available
 */
class ProviderUnavailableError extends LLMConnectionError {
    constructor(providerName, cause) {
        super(interfaces_1.ConnectionErrorCode.PROVIDER_UNAVAILABLE, `Provider ${providerName} is not available`, cause);
        this.name = 'ProviderUnavailableError';
    }
}
exports.ProviderUnavailableError = ProviderUnavailableError;
/**
 * Error thrown when authentication fails
 */
class AuthenticationError extends LLMConnectionError {
    constructor(message = 'Authentication failed', cause) {
        super(interfaces_1.ConnectionErrorCode.AUTHENTICATION_FAILED, message, cause);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Error thrown when model is not found or unavailable
 */
class ModelNotFoundError extends LLMConnectionError {
    constructor(modelId, cause) {
        super(interfaces_1.ConnectionErrorCode.MODEL_NOT_FOUND, `Model ${modelId} not found or unavailable`, cause);
        this.name = 'ModelNotFoundError';
    }
}
exports.ModelNotFoundError = ModelNotFoundError;
/**
 * Error thrown when rate limit is exceeded
 */
class RateLimitError extends LLMConnectionError {
    constructor(message = 'Rate limit exceeded', cause) {
        super(interfaces_1.ConnectionErrorCode.RATE_LIMIT_EXCEEDED, message, cause);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class Error {
    constructor(message) {
        this.message = message;
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    message;
    name;
    stack;
}
exports.Error = Error;
class ProviderError extends Error {
    providerId;
    cause;
    constructor(message, providerId, cause) {
        super(message);
        this.providerId = providerId;
        this.cause = cause;
        this.name = 'ProviderError';
    }
}
exports.ProviderError = ProviderError;
class ConnectionError extends Error {
    providerId;
    code;
    cause;
    constructor(message, providerId, code, cause) {
        super(message);
        this.providerId = providerId;
        this.code = code;
        this.cause = cause;
        this.name = 'ConnectionError';
    }
}
exports.ConnectionError = ConnectionError;
class ModelError extends Error {
    providerId;
    modelId;
    cause;
    constructor(message, providerId, modelId, cause) {
        super(message);
        this.providerId = providerId;
        this.modelId = modelId;
        this.cause = cause;
        this.name = 'ModelError';
    }
}
exports.ModelError = ModelError;
class ValidationError extends Error {
    errors;
    cause;
    constructor(message, errors, cause) {
        super(message);
        this.errors = errors;
        this.cause = cause;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class ConfigurationError extends Error {
    providerId;
    propertyPath;
    cause;
    constructor(message, providerId, propertyPath, cause) {
        super(message);
        this.providerId = providerId;
        this.propertyPath = propertyPath;
        this.cause = cause;
        this.name = 'ConfigurationError';
    }
}
exports.ConfigurationError = ConfigurationError;
class HealthCheckError extends Error {
    providerId;
    checkResult;
    cause;
    constructor(message, providerId, checkResult, cause) {
        super(message);
        this.providerId = providerId;
        this.checkResult = checkResult;
        this.cause = cause;
        this.name = 'HealthCheckError';
    }
}
exports.HealthCheckError = HealthCheckError;
class RequestError extends Error {
    providerId;
    requestId;
    statusCode;
    cause;
    constructor(message, providerId, requestId, statusCode, cause) {
        super(message);
        this.providerId = providerId;
        this.requestId = requestId;
        this.statusCode = statusCode;
        this.cause = cause;
        this.name = 'RequestError';
    }
}
exports.RequestError = RequestError;
class TokenError extends Error {
    providerId;
    requestId;
    tokenCount;
    maxTokens;
    cause;
    constructor(message, providerId, requestId, tokenCount, maxTokens, cause) {
        super(message);
        this.providerId = providerId;
        this.requestId = requestId;
        this.tokenCount = tokenCount;
        this.maxTokens = maxTokens;
        this.cause = cause;
        this.name = 'TokenError';
    }
}
exports.TokenError = TokenError;
class TimeoutError extends Error {
    providerId;
    operationType;
    timeoutMs;
    cause;
    constructor(message, providerId, operationType, timeoutMs, cause) {
        super(message);
        this.providerId = providerId;
        this.operationType = operationType;
        this.timeoutMs = timeoutMs;
        this.cause = cause;
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
//# sourceMappingURL=errors.js.map