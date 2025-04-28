/**
 * Error codes for LLM connection errors
 */
export enum ConnectionErrorCode {
    UNAVAILABLE = 'unavailable',
    TIMEOUT = 'timeout',
    AUTHENTICATION = 'authentication',
    RATE_LIMIT = 'rate_limit',
    PROVIDER_ERROR = 'provider_error',
    UNEXPECTED = 'unexpected'
}

/**
 * Base error class for LLM connection errors
 */
export class LLMConnectionError extends globalThis.Error {
    constructor(
        public readonly code: ConnectionErrorCode,
        message: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'LLMConnectionError';
        // Fix prototype chain for Error inheritance in transpiled code
        Object.setPrototypeOf(this, LLMConnectionError.prototype);
    }

    toString(): string {
        return `${this.name}[${this.code}]: ${this.message}${this.cause ? `\nCaused by: ${this.cause}` : ''}`;
    }
}