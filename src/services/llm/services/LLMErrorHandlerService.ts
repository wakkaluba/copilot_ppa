import { EventEmitter } from 'events';
import { LLMConnectionError, LLMConnectionErrorCode, RetryStrategy } from '../types';

export class LLMErrorHandlerService extends EventEmitter {
    private maxRetries = 3;
    private baseDelay = 1000; // 1 second
    private retryCount: Map<string, number> = new Map();

    constructor() {
        super();
    }

    public async handleError(error: unknown, errorContext?: string): Promise<void> {
        const formattedError = this.formatError(error);
        const errorId = this.generateErrorId(formattedError);
        
        this.emit('error', { error: formattedError, errorId });

        if (this.shouldRetry(formattedError)) {
            await this.handleRetry(errorId, formattedError);
        } else {
            this.retryCount.delete(errorId);
            throw formattedError;
        }
    }

    private formatError(error: unknown): LLMConnectionError {
        if (error instanceof LLMConnectionError) {
            return error;
        }

        const message = error instanceof Error ? error.message : String(error);
        return new LLMConnectionError(message, LLMConnectionErrorCode.Unknown);
    }

    private generateErrorId(error: LLMConnectionError): string {
        return `${error.code}-${Date.now()}`;
    }

    private shouldRetry(error: LLMConnectionError): boolean {
        const retryableErrors = [
            LLMConnectionErrorCode.NetworkError,
            LLMConnectionErrorCode.Timeout,
            LLMConnectionErrorCode.RateLimited,
            LLMConnectionErrorCode.ServiceUnavailable
        ];

        return retryableErrors.includes(error.code);
    }

    private async handleRetry(errorId: string, error: LLMConnectionError): Promise<void> {
        const currentRetries = this.retryCount.get(errorId) || 0;
        
        if (currentRetries >= this.maxRetries) {
            this.retryCount.delete(errorId);
            throw error;
        }

        const delay = this.calculateRetryDelay(currentRetries);
        this.retryCount.set(errorId, currentRetries + 1);

        this.emit('retrying', { 
            error,
            retryCount: currentRetries + 1,
            delay
        });

        await new Promise(resolve => setTimeout(resolve, delay));
    }

    private calculateRetryDelay(retryCount: number): number {
        // Exponential backoff with jitter
        const exponentialDelay = this.baseDelay * Math.pow(2, retryCount);
        const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
        return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
    }

    public setRetryStrategy(strategy: RetryStrategy): void {
        this.maxRetries = strategy.maxRetries ?? this.maxRetries;
        this.baseDelay = strategy.baseDelay ?? this.baseDelay;
    }

    public dispose(): void {
        this.removeAllListeners();
        this.retryCount.clear();
    }
}