export interface ValidationErrorDetails {
    field?: string;
    value?: any;
    expected?: any;
}

/**
 * Custom error class for Vite configuration validation errors
 */
export class ConfigValidationError extends Error {
    public readonly code: string;
    public readonly details?: ValidationErrorDetails;

    constructor(message: string, code: string, details?: ValidationErrorDetails) {
        super(message);
        this.name = 'ConfigValidationError';
        this.code = code;
        this.details = details;

        // Ensure proper prototype chain for ES5
        Object.setPrototypeOf(this, ConfigValidationError.prototype);
    }

    toString(): string {
        let result = `${this.name}: ${this.message}`;
        if (this.details) {
            result += `\nDetails: ${JSON.stringify(this.details, null, 2)}`;
        }
        return result;
    }
}