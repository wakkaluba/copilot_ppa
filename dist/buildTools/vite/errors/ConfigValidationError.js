"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigValidationError = void 0;
/**
 * Custom error class for Vite configuration validation errors
 */
class ConfigValidationError extends Error {
    constructor(message, code, details) {
        super(message);
        this.name = 'ConfigValidationError';
        this.code = code;
        this.details = details;
        // Ensure proper prototype chain for ES5
        Object.setPrototypeOf(this, ConfigValidationError.prototype);
    }
    toString() {
        let result = `${this.name}: ${this.message}`;
        if (this.details) {
            result += `\nDetails: ${JSON.stringify(this.details, null, 2)}`;
        }
        return result;
    }
}
exports.ConfigValidationError = ConfigValidationError;
//# sourceMappingURL=ConfigValidationError.js.map