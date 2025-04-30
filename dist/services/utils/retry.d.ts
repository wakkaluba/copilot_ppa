export interface IRetryOptions {
    retries?: number;
    backoff?: boolean;
    initialDelay?: number;
    maxDelay?: number;
}
export declare function retry<T>(fn: () => Promise<T>, options?: IRetryOptions): Promise<T>;
