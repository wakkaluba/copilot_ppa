import { ConnectionOptions } from '../types';

export class RetryManagerService {
    private retryTimeout: NodeJS.Timeout | null = null;
    private maxRetries: number;
    private retryDelay: number;

    constructor(options: Partial<ConnectionOptions> = {}) {
        this.maxRetries = options.retryConfig?.maxRetries || 3;
        this.retryDelay = options.retryConfig?.retryDelay || 1000;
    }

    public async handleConnectionFailure<T>(operation: () => Promise<T>): Promise<T> {
        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                return await operation();
            } catch (error) {
                retries++;
                if (retries >= this.maxRetries) {
                    throw error;
                }
                await this.delay(this.retryDelay * Math.pow(2, retries - 1));
            }
        }
        throw new Error('Max retries exceeded');
    }

    public clearRetryTimeout(): void {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => {
            this.retryTimeout = setTimeout(resolve, ms);
        });
    }
}