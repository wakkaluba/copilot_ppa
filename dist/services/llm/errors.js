"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConnectionError = exports.ConnectionErrorCode = void 0;
/**
 * Error codes for LLM connection errors
 */
var ConnectionErrorCode;
(function (ConnectionErrorCode) {
    ConnectionErrorCode["UNAVAILABLE"] = "unavailable";
    ConnectionErrorCode["TIMEOUT"] = "timeout";
    ConnectionErrorCode["AUTHENTICATION"] = "authentication";
    ConnectionErrorCode["RATE_LIMIT"] = "rate_limit";
    ConnectionErrorCode["PROVIDER_ERROR"] = "provider_error";
    ConnectionErrorCode["UNEXPECTED"] = "unexpected";
})(ConnectionErrorCode || (exports.ConnectionErrorCode = ConnectionErrorCode = {}));
/**
 * Base error class for LLM connection errors
 */
class LLMConnectionError extends globalThis.Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'LLMConnectionError';
        // Fix prototype chain for Error inheritance in transpiled code
        Object.setPrototypeOf(this, LLMConnectionError.prototype);
    }
    toString() {
        return `${this.name}[${this.code}]: ${this.message}${this.cause ? `\nCaused by: ${this.cause}` : ''}`;
    }
}
exports.LLMConnectionError = LLMConnectionError;
//# sourceMappingURL=errors.js.map