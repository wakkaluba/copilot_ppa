import { EventEmitter } from 'events';
import { RetryConfig } from './types';
export declare class ConnectionRetryHandler extends EventEmitter {
    private static instance;
    private retryTimeouts;
    private constructor();
    static getInstance(): ConnectionRetryHandler;
    retry(providerId: string, operation: () => Promise<void>, config: RetryConfig): Promise<void>;
    private isRetryableError;
    private calculateBackoff;
    private scheduleRetry;
    private clearExistingRetry;
    resetRetry(providerId: string): void;
    dispose(): void;
}
