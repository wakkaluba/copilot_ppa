"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMErrorHandlingService = void 0;
const types_1 = require("../types");
class LLMErrorHandlingService {
    createError(code, message, cause) {
        return new types_1.LLMConnectionError(code, message, cause);
    }
    formatError(error) {
        if (error instanceof types_1.LLMConnectionError) {
            return error;
        }
        const message = error instanceof Error ? error.message : String(error);
        return this.createError(types_1.LLMConnectionErrorCode.InternalError, message);
    }
    isRetryableError(error) {
        if (error instanceof types_1.LLMConnectionError) {
            return [
                types_1.LLMConnectionErrorCode.ConnectionFailed,
                types_1.LLMConnectionErrorCode.Timeout
            ].includes(error.code);
        }
        // Network-related errors are generally retryable
        if (error instanceof Error) {
            const networkErrors = [
                'ECONNREFUSED',
                'ECONNRESET',
                'ETIMEDOUT',
                'ENOTFOUND'
            ];
            return networkErrors.some(code => error.message.includes(code));
        }
        return false;
    }
}
exports.LLMErrorHandlingService = LLMErrorHandlingService;
//# sourceMappingURL=LLMErrorHandlingService.js.map