import { ConnectionErrorCode } from './interfaces';

/**
 * Custom error class for LLM connection errors
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
}

/**
 * Calculate delay for retry attempts using exponential backoff
 */
export function calculateRetryDelay(
    attempt: number,
    options: { baseRetryDelay: number; maxRetryDelay: number }
): number {
    const delay = Math.min(
        options.baseRetryDelay * Math.pow(2, attempt),
        options.maxRetryDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * (delay * 0.1);
}

/**
 * Test connection to an LLM endpoint
 */
export async function testConnection(
    endpoint: string,
    timeout: number
): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(endpoint, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Create a promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a promise that rejects after the specified timeout
 */
export function createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new LLMConnectionError(
                ConnectionErrorCode.TIMEOUT,
                `Operation timed out after ${ms}ms`
            ));
        }, ms);
    });
}

/**
 * Execute a promise with a timeout
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation = 'Operation'
): Promise<T> {
    const result = await Promise.race([
        promise,
        createTimeout(timeoutMs)
    ]);
    return result;
}