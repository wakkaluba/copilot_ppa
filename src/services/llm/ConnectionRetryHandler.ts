import { EventEmitter } from 'events';
import { ConnectionErrorCode, HealthCheckResponse } from './interfaces';
import { LLMConnectionError } from './errors';

/**
 * Retry configuration
 */
interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
    retryableErrors: ConnectionErrorCode[];
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffFactor: 2,
    retryableErrors: [
        ConnectionErrorCode.NETWORK_ERROR,
        ConnectionErrorCode.PROVIDER_ERROR,
        ConnectionErrorCode.SERVICE_UNAVAILABLE,
        ConnectionErrorCode.TIMEOUT
    ]
};

/**
 * Handles retrying failed LLM operations
 */
export class ConnectionRetryHandler extends EventEmitter {
    private static instance: ConnectionRetryHandler;
    private configs: Map<string, RetryConfig> = new Map();
    private retryStats: Map<string, {
        attempts: number;
        successes: number;
        failures: number;
    }> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): ConnectionRetryHandler {
        if (!this.instance) {
            this.instance = new ConnectionRetryHandler();
        }
        return this.instance;
    }

    /**
     * Configure retry behavior for a provider
     */
    public configureProvider(providerId: string, config: Partial<RetryConfig>): void {
        this.configs.set(providerId, {
            ...DEFAULT_RETRY_CONFIG,
            ...config
        });
    }

    /**
     * Execute an operation with retries
     */
    public async executeWithRetry<T>(
        providerId: string,
        operation: () => Promise<T>,
        context: string = 'operation'
    ): Promise<T> {
        const config = this.configs.get(providerId) || DEFAULT_RETRY_CONFIG;
        let attempt = 0;
        let lastError: Error | undefined;
        let delay = config.initialDelayMs;

        while (attempt < config.maxRetries + 1) {
            try {
                const result = await operation();
                this.recordSuccess(providerId);
                return result;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                
                if (!this.shouldRetry(lastError, config)) {
                    this.recordFailure(providerId);
                    throw lastError;
                }

                attempt++;
                if (attempt > config.maxRetries) {
                    this.recordFailure(providerId);
                    throw new LLMConnectionError(
                        ConnectionErrorCode.PROVIDER_ERROR,
                        `${context} failed after ${config.maxRetries} retries`,
                        lastError
                    );
                }

                this.emit('retrying', {
                    providerId,
                    error: lastError,
                    attempt,
                    delay,
                    context
                });

                await this.delay(delay);
                delay = Math.min(delay * config.backoffFactor, config.maxDelayMs);
            }
        }

        // This should never happen due to the throw in the loop
        throw lastError || new Error('Retry failed');
    }

    /**
     * Check if a provider is healthy with retries
     */
    public async checkHealthWithRetry(
        providerId: string,
        healthCheck: () => Promise<HealthCheckResponse>
    ): Promise<HealthCheckResponse> {
        return this.executeWithRetry(providerId, healthCheck, 'health check');
    }

    /**
     * Get retry statistics for a provider
     */
    public getStats(providerId: string) {
        const stats = this.retryStats.get(providerId) || {
            attempts: 0,
            successes: 0,
            failures: 0
        };
        const config = this.configs.get(providerId) || DEFAULT_RETRY_CONFIG;

        return {
            stats,
            config: { ...config }
        };
    }

    private shouldRetry(error: Error, config: RetryConfig): boolean {
        if (error instanceof LLMConnectionError) {
            return config.retryableErrors.includes(error.code);
        }
        return true; // Retry unknown errors
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private recordSuccess(providerId: string): void {
        const stats = this.retryStats.get(providerId) || {
            attempts: 0,
            successes: 0,
            failures: 0
        };
        stats.successes++;
        stats.attempts++;
        this.retryStats.set(providerId, stats);
    }

    private recordFailure(providerId: string): void {
        const stats = this.retryStats.get(providerId) || {
            attempts: 0,
            successes: 0,
            failures: 0
        };
        stats.failures++;
        stats.attempts++;
        this.retryStats.set(providerId, stats);
    }

    /**
     * Clear retry state for a provider
     */
    public clearProvider(providerId: string): void {
        this.configs.delete(providerId);
        this.retryStats.delete(providerId);
    }

    public dispose(): void {
        this.configs.clear();
        this.retryStats.clear();
        this.removeAllListeners();
    }
}