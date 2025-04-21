/**
 * Error handling for LLM connections
 */
import { ConnectionErrorCode } from './interfaces';

/**
 * Base error class for LLM connection errors
 */
export class LLMConnectionError extends Error {
    constructor(
        public readonly code: ConnectionErrorCode,
        message: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'LLMConnectionError';
    }

    /**
     * Get full error details including cause
     */
    public getFullMessage(): string {
        const details = [
            `${this.name}: ${this.message}`,
            `Code: ${this.code}`
        ];

        if (this.cause) {
            details.push(`Caused by: ${this.cause.message}`);
            if (this.cause.stack) {
                details.push(this.cause.stack);
            }
        }

        return details.join('\n');
    }
}

/**
 * Error thrown when connection times out
 */
export class ConnectionTimeoutError extends LLMConnectionError {
    constructor(message: string = 'Connection timed out', cause?: Error) {
        super(ConnectionErrorCode.TIMEOUT, message, cause);
        this.name = 'ConnectionTimeoutError';
    }
}

/**
 * Error thrown when provider is not available
 */
export class ProviderUnavailableError extends LLMConnectionError {
    constructor(providerName: string, cause?: Error) {
        super(
            ConnectionErrorCode.PROVIDER_UNAVAILABLE,
            `Provider ${providerName} is not available`,
            cause
        );
        this.name = 'ProviderUnavailableError';
    }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends LLMConnectionError {
    constructor(message: string = 'Authentication failed', cause?: Error) {
        super(ConnectionErrorCode.AUTHENTICATION_FAILED, message, cause);
        this.name = 'AuthenticationError';
    }
}

/**
 * Error thrown when model is not found or unavailable
 */
export class ModelNotFoundError extends LLMConnectionError {
    constructor(modelId: string, cause?: Error) {
        super(
            ConnectionErrorCode.MODEL_NOT_FOUND,
            `Model ${modelId} not found or unavailable`,
            cause
        );
        this.name = 'ModelNotFoundError';
    }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends LLMConnectionError {
    constructor(message: string = 'Rate limit exceeded', cause?: Error) {
        super(ConnectionErrorCode.RATE_LIMIT_EXCEEDED, message, cause);
        this.name = 'RateLimitError';
    }
}