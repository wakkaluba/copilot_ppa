export class ConfigValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConfigValidationError';
        // Ensure prototype chain is properly maintained in transpiled code
        Object.setPrototypeOf(this, ConfigValidationError.prototype);
    }
}