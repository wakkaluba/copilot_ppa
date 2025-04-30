export interface ValidationErrorDetails {
    field?: string;
    value?: any;
    expected?: any;
}
/**
 * Custom error class for Vite configuration validation errors
 */
export declare class ConfigValidationError extends Error {
    readonly code: string;
    readonly details?: ValidationErrorDetails;
    constructor(message: string, code: string, details?: ValidationErrorDetails);
    toString(): string;
}
