import { ConnectionErrorCode } from './interfaces';
/**
 * Custom error class for LLM connection errors
 */
export declare class LLMConnectionError extends Error {
    readonly code: ConnectionErrorCode;
    readonly cause?: Error | undefined;
    constructor(code: ConnectionErrorCode, message: string, cause?: Error | undefined);
}
/**
 * Calculate delay for retry attempts using exponential backoff
 */
export declare function calculateRetryDelay(attempt: number, options: {
    baseRetryDelay: number;
    maxRetryDelay: number;
}): number;
/**
 * Test connection to an LLM endpoint
 */
export declare function testConnection(endpoint: string, timeout: number): Promise<boolean>;
/**
 * Create a promise that resolves after the specified delay
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Create a promise that rejects after the specified timeout
 */
export declare function createTimeout(ms: number): Promise<never>;
/**
 * Execute a promise with a timeout
 */
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation?: string): Promise<T>;
