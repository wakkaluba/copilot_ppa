import { ConnectionOptions } from '../types';
export declare class RetryManagerService {
    private retryTimeout;
    private maxRetries;
    private retryDelay;
    constructor(options?: Partial<ConnectionOptions>);
    handleConnectionFailure<T>(operation: () => Promise<T>): Promise<T>;
    clearRetryTimeout(): void;
    private delay;
}
