/**
 * Utility functions for LLM connection management
 */
import { LLMConnectionOptions } from '../../types/llm';

/**
 * Calculates the retry delay with exponential backoff
 * 
 * @param retryCount Current retry attempt number
 * @param options Connection options
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(retryCount: number, options: LLMConnectionOptions): number {
    const { baseRetryDelay, maxRetryDelay } = options;
    const delay = baseRetryDelay * Math.pow(2, retryCount);
    return Math.min(delay, maxRetryDelay);
}

/**
 * Tests a connection to the LLM service
 * 
 * @param healthEndpoint URL to the health endpoint
 * @param timeout Connection timeout in ms
 * @returns Promise resolving to true if connection successful
 */
export async function testConnection(healthEndpoint: string, timeout = 5000): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(healthEndpoint, { 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            return response.ok;
        } catch (e) {
            clearTimeout(timeoutId);
            throw e;
        }
    } catch (error) {
        console.error('Connection test failed:', error);
        return false;
    }
}

/**
 * Creates a promise that resolves after the specified delay
 * 
 * @param ms Delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a promise that rejects after the specified timeout
 * 
 * @param ms Timeout in milliseconds
 * @param errorMessage Optional error message
 * @returns Promise that rejects after the timeout
 */
export function createTimeout(ms: number, errorMessage = 'Operation timed out'): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), ms);
    });
}

/**
 * Executes a promise with a timeout
 * 
 * @param promise Promise to execute
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Optional error message
 * @returns Promise that resolves with the result or rejects with timeout
 */
export async function withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number,
    errorMessage = 'Operation timed out'
): Promise<T> {
    return Promise.race([
        promise,
        createTimeout(timeoutMs, errorMessage)
    ]);
}