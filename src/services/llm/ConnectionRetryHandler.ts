import { EventEmitter } from 'events';
import { RetryConfig, LLMConnectionError, LLMConnectionErrorCode } from './types';

export class ConnectionRetryHandler extends EventEmitter {
    private static instance: ConnectionRetryHandler;
    private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): ConnectionRetryHandler {
        if (!this.instance) {
            this.instance = new ConnectionRetryHandler();
        }
        return this.instance;
    }

    public async retry(
        providerId: string,
        operation: () => Promise<void>,
        config: RetryConfig
    ): Promise<void> {
        try {
            await operation();
            this.resetRetry(providerId);
        } catch (error) {
            if (!this.isRetryableError(error) || config.currentAttempt >= config.maxAttempts) {
                throw error;
            }

            const delay = this.calculateBackoff(config);
            config.currentAttempt++;

            this.emit('retrying', {
                providerId,
                attempt: config.currentAttempt,
                delay,
                error
            });

            await this.scheduleRetry(providerId, operation, config, delay);
        }
    }

    private isRetryableError(error: unknown): boolean {
        if (error instanceof LLMConnectionError) {
            return [
                LLMConnectionErrorCode.ConnectionFailed,
                LLMConnectionErrorCode.NetworkError,
                LLMConnectionErrorCode.Timeout
            ].includes(error.code);
        }
        return true;
    }

    private calculateBackoff(config: RetryConfig): number {
        const backoffDelay = config.baseDelay * Math.pow(config.backoffFactor, config.currentAttempt);
        return Math.min(backoffDelay, config.maxDelay);
    }

    private async scheduleRetry(
        providerId: string,
        operation: () => Promise<void>,
        config: RetryConfig,
        delay: number
    ): Promise<void> {
        this.clearExistingRetry(providerId);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(async () => {
                try {
                    await this.retry(providerId, operation, config);
                    resolve();
                } catch (error) {
                    reject(error);
                } finally {
                    this.retryTimeouts.delete(providerId);
                }
            }, delay);

            this.retryTimeouts.set(providerId, timeout);
        });
    }

    private clearExistingRetry(providerId: string): void {
        const existingTimeout = this.retryTimeouts.get(providerId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            this.retryTimeouts.delete(providerId);
        }
    }

    public resetRetry(providerId: string): void {
        this.clearExistingRetry(providerId);
    }

    public dispose(): void {
        for (const timeout of this.retryTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.retryTimeouts.clear();
        this.removeAllListeners();
    }
}