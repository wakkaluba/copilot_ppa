"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMErrorHandlingService = void 0;
var types_1 = require("../types");
var LLMErrorHandlingService = /** @class */ (function () {
    function LLMErrorHandlingService() {
    }
    LLMErrorHandlingService.prototype.createError = function (code, message, cause) {
        return new types_1.LLMConnectionError(code, message, cause);
    };
    LLMErrorHandlingService.prototype.formatError = function (error) {
        if (error instanceof types_1.LLMConnectionError) {
            return error;
        }
        var message = error instanceof Error ? error.message : String(error);
        return this.createError(types_1.LLMConnectionErrorCode.InternalError, message);
    };
    LLMErrorHandlingService.prototype.isRetryableError = function (error) {
        if (error instanceof types_1.LLMConnectionError) {
            return [
                types_1.LLMConnectionErrorCode.ConnectionFailed,
                types_1.LLMConnectionErrorCode.Timeout
            ].includes(error.code);
        }
        // Network-related errors are generally retryable
        if (error instanceof Error) {
            var networkErrors = [
                'ECONNREFUSED',
                'ECONNRESET',
                'ETIMEDOUT',
                'ENOTFOUND'
            ];
            return networkErrors.some(function (code) { return error.message.includes(code); });
        }
        return false;
    };
    return LLMErrorHandlingService;
}());
exports.LLMErrorHandlingService = LLMErrorHandlingService;
