import { EventEmitter } from 'events';
import { RetryStrategy } from '../types';
export declare class LLMErrorHandlerService extends EventEmitter {
    private maxRetries;
    private baseDelay;
    private retryCount;
    constructor();
    handleError(error: unknown, errorContext?: string): Promise<void>;
    private formatError;
    private generateErrorId;
    private shouldRetry;
    private handleRetry;
    private calculateRetryDelay;
    setRetryStrategy(strategy: RetryStrategy): void;
    dispose(): void;
}
