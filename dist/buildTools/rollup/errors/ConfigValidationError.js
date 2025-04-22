"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigValidationError = void 0;
class ConfigValidationError extends Error {
    configPath;
    validationErrors;
    constructor(message, configPath, validationErrors) {
        super(message);
        this.configPath = configPath;
        this.validationErrors = validationErrors;
        this.name = 'ConfigValidationError';
        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ConfigValidationError);
        }
    }
}
exports.ConfigValidationError = ConfigValidationError;
//# sourceMappingURL=ConfigValidationError.js.map