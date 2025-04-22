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

export class Error {
    constructor(message: string) {
        this.message = message;
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    public readonly message: string;
    public readonly name: string;
    public readonly stack?: string;
}

export class ProviderError extends Error {
    constructor(
        message: string,
        public readonly providerId: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'ProviderError';
    }
}

export class ConnectionError extends Error {
    constructor(
        message: string,
        public readonly providerId: string,
        public readonly code: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'ConnectionError';
    }
}

export class ModelError extends Error {
    constructor(
        message: string,
        public readonly providerId: string,
        public readonly modelId: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'ModelError';
    }
}

export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly errors: string[],
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ConfigurationError extends Error {
    constructor(
        message: string,
        public readonly providerId: string,
        public readonly propertyPath: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'ConfigurationError';
    }
}

export class HealthCheckError extends Error {
    constructor(
        message: string,
        public readonly providerId: string,
        public readonly checkResult: {
            isHealthy: boolean;
            latency: number;
            timestamp: number;
            error?: Error;
        },
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'HealthCheckError';
    }
}

export class RequestError extends Error {
    constructor(
        message: string,
        public readonly providerId: string,
        public readonly requestId: string,
        public readonly statusCode?: number,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'RequestError';
    }
}

export class TokenError extends Error {
    constructor(
        message: string,
        public readonly providerId: string,
        public readonly requestId: string,
        public readonly tokenCount: number,
        public readonly maxTokens: number,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'TokenError';
    }
}

export class TimeoutError extends Error {
    constructor(
        message: string,
        public readonly providerId: string,
        public readonly operationType: string,
        public readonly timeoutMs: number,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'TimeoutError';
    }
}