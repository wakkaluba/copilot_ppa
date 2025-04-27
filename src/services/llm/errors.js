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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = exports.TokenError = exports.RequestError = exports.HealthCheckError = exports.ConfigurationError = exports.ValidationError = exports.ModelError = exports.ConnectionError = exports.ProviderError = exports.Error = exports.RateLimitError = exports.ModelNotFoundError = exports.AuthenticationError = exports.ProviderUnavailableError = exports.ConnectionTimeoutError = exports.LLMConnectionError = void 0;
/**
 * Error handling for LLM connections
 */
var interfaces_1 = require("./interfaces");
/**
 * Base error class for LLM connection errors
 */
var LLMConnectionError = /** @class */ (function (_super) {
    __extends(LLMConnectionError, _super);
    function LLMConnectionError(code, message, cause) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.cause = cause;
        _this.name = 'LLMConnectionError';
        return _this;
    }
    /**
     * Get full error details including cause
     */
    LLMConnectionError.prototype.getFullMessage = function () {
        var details = [
            "".concat(this.name, ": ").concat(this.message),
            "Code: ".concat(this.code)
        ];
        if (this.cause) {
            details.push("Caused by: ".concat(this.cause.message));
            if (this.cause.stack) {
                details.push(this.cause.stack);
            }
        }
        return details.join('\n');
    };
    return LLMConnectionError;
}(Error));
exports.LLMConnectionError = LLMConnectionError;
/**
 * Error thrown when connection times out
 */
var ConnectionTimeoutError = /** @class */ (function (_super) {
    __extends(ConnectionTimeoutError, _super);
    function ConnectionTimeoutError(message, cause) {
        if (message === void 0) { message = 'Connection timed out'; }
        var _this = _super.call(this, interfaces_1.ConnectionErrorCode.TIMEOUT, message, cause) || this;
        _this.name = 'ConnectionTimeoutError';
        return _this;
    }
    return ConnectionTimeoutError;
}(LLMConnectionError));
exports.ConnectionTimeoutError = ConnectionTimeoutError;
/**
 * Error thrown when provider is not available
 */
var ProviderUnavailableError = /** @class */ (function (_super) {
    __extends(ProviderUnavailableError, _super);
    function ProviderUnavailableError(providerName, cause) {
        var _this = _super.call(this, interfaces_1.ConnectionErrorCode.PROVIDER_UNAVAILABLE, "Provider ".concat(providerName, " is not available"), cause) || this;
        _this.name = 'ProviderUnavailableError';
        return _this;
    }
    return ProviderUnavailableError;
}(LLMConnectionError));
exports.ProviderUnavailableError = ProviderUnavailableError;
/**
 * Error thrown when authentication fails
 */
var AuthenticationError = /** @class */ (function (_super) {
    __extends(AuthenticationError, _super);
    function AuthenticationError(message, cause) {
        if (message === void 0) { message = 'Authentication failed'; }
        var _this = _super.call(this, interfaces_1.ConnectionErrorCode.AUTHENTICATION_FAILED, message, cause) || this;
        _this.name = 'AuthenticationError';
        return _this;
    }
    return AuthenticationError;
}(LLMConnectionError));
exports.AuthenticationError = AuthenticationError;
/**
 * Error thrown when model is not found or unavailable
 */
var ModelNotFoundError = /** @class */ (function (_super) {
    __extends(ModelNotFoundError, _super);
    function ModelNotFoundError(modelId, cause) {
        var _this = _super.call(this, interfaces_1.ConnectionErrorCode.MODEL_NOT_FOUND, "Model ".concat(modelId, " not found or unavailable"), cause) || this;
        _this.name = 'ModelNotFoundError';
        return _this;
    }
    return ModelNotFoundError;
}(LLMConnectionError));
exports.ModelNotFoundError = ModelNotFoundError;
/**
 * Error thrown when rate limit is exceeded
 */
var RateLimitError = /** @class */ (function (_super) {
    __extends(RateLimitError, _super);
    function RateLimitError(message, cause) {
        if (message === void 0) { message = 'Rate limit exceeded'; }
        var _this = _super.call(this, interfaces_1.ConnectionErrorCode.RATE_LIMIT_EXCEEDED, message, cause) || this;
        _this.name = 'RateLimitError';
        return _this;
    }
    return RateLimitError;
}(LLMConnectionError));
exports.RateLimitError = RateLimitError;
var Error = /** @class */ (function () {
    function Error(message) {
        this.message = message;
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    return Error;
}());
exports.Error = Error;
var ProviderError = /** @class */ (function (_super) {
    __extends(ProviderError, _super);
    function ProviderError(message, providerId, cause) {
        var _this = _super.call(this, message) || this;
        _this.providerId = providerId;
        _this.cause = cause;
        _this.name = 'ProviderError';
        return _this;
    }
    return ProviderError;
}(Error));
exports.ProviderError = ProviderError;
var ConnectionError = /** @class */ (function (_super) {
    __extends(ConnectionError, _super);
    function ConnectionError(message, providerId, code, cause) {
        var _this = _super.call(this, message) || this;
        _this.providerId = providerId;
        _this.code = code;
        _this.cause = cause;
        _this.name = 'ConnectionError';
        return _this;
    }
    return ConnectionError;
}(Error));
exports.ConnectionError = ConnectionError;
var ModelError = /** @class */ (function (_super) {
    __extends(ModelError, _super);
    function ModelError(message, providerId, modelId, cause) {
        var _this = _super.call(this, message) || this;
        _this.providerId = providerId;
        _this.modelId = modelId;
        _this.cause = cause;
        _this.name = 'ModelError';
        return _this;
    }
    return ModelError;
}(Error));
exports.ModelError = ModelError;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message, errors, cause) {
        var _this = _super.call(this, message) || this;
        _this.errors = errors;
        _this.cause = cause;
        _this.name = 'ValidationError';
        return _this;
    }
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
var ConfigurationError = /** @class */ (function (_super) {
    __extends(ConfigurationError, _super);
    function ConfigurationError(message, providerId, propertyPath, cause) {
        var _this = _super.call(this, message) || this;
        _this.providerId = providerId;
        _this.propertyPath = propertyPath;
        _this.cause = cause;
        _this.name = 'ConfigurationError';
        return _this;
    }
    return ConfigurationError;
}(Error));
exports.ConfigurationError = ConfigurationError;
var HealthCheckError = /** @class */ (function (_super) {
    __extends(HealthCheckError, _super);
    function HealthCheckError(message, providerId, checkResult, cause) {
        var _this = _super.call(this, message) || this;
        _this.providerId = providerId;
        _this.checkResult = checkResult;
        _this.cause = cause;
        _this.name = 'HealthCheckError';
        return _this;
    }
    return HealthCheckError;
}(Error));
exports.HealthCheckError = HealthCheckError;
var RequestError = /** @class */ (function (_super) {
    __extends(RequestError, _super);
    function RequestError(message, providerId, requestId, statusCode, cause) {
        var _this = _super.call(this, message) || this;
        _this.providerId = providerId;
        _this.requestId = requestId;
        _this.statusCode = statusCode;
        _this.cause = cause;
        _this.name = 'RequestError';
        return _this;
    }
    return RequestError;
}(Error));
exports.RequestError = RequestError;
var TokenError = /** @class */ (function (_super) {
    __extends(TokenError, _super);
    function TokenError(message, providerId, requestId, tokenCount, maxTokens, cause) {
        var _this = _super.call(this, message) || this;
        _this.providerId = providerId;
        _this.requestId = requestId;
        _this.tokenCount = tokenCount;
        _this.maxTokens = maxTokens;
        _this.cause = cause;
        _this.name = 'TokenError';
        return _this;
    }
    return TokenError;
}(Error));
exports.TokenError = TokenError;
var TimeoutError = /** @class */ (function (_super) {
    __extends(TimeoutError, _super);
    function TimeoutError(message, providerId, operationType, timeoutMs, cause) {
        var _this = _super.call(this, message) || this;
        _this.providerId = providerId;
        _this.operationType = operationType;
        _this.timeoutMs = timeoutMs;
        _this.cause = cause;
        _this.name = 'TimeoutError';
        return _this;
    }
    return TimeoutError;
}(Error));
exports.TimeoutError = TimeoutError;
