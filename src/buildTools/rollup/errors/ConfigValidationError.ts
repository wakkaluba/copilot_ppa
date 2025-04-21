export class ConfigValidationError extends Error {
    constructor(
        message: string,
        public readonly configPath: string,
        public readonly validationErrors: string[]
    ) {
        super(message);
        this.name = 'ConfigValidationError';

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ConfigValidationError);
        }
    }
}