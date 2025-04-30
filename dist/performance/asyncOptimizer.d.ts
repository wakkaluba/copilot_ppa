import { AsyncOptions } from './services/PerformanceConfigService';
interface AsyncStats {
    optimizedCount: number;
    avgResponseTime: number;
    successRate: number;
    batchesProcessed: number;
}
/**
 * Class to optimize asynchronous operations by providing
 * utilities for batching, throttling, and debouncing
 */
export declare class AsyncOptimizer {
    private static instance;
    private logger;
    private profiler;
    private pendingBatches;
    private throttleTimers;
    private debounceTimers;
    private config;
    private stats;
    private constructor();
    static getInstance(): AsyncOptimizer;
    setConfig(config: AsyncOptions): void;
    getStats(): AsyncStats;
    /**
     * Batch multiple operations into a single execution
     * @param batchId Identifier for the batch
     * @param item Item to add to the batch
     * @param processBatchFn Function to process the batch
     * @param delayMs Delay before processing the batch (default: 100ms)
     * @param maxBatchSize Maximum batch size before forced processing
     */
    addToBatch<T, R>(batchId: string, item: T, processBatchFn: (items: T[]) => Promise<R[]>, delayMs?: number, maxBatchSize?: number): Promise<R>;
    /**
     * Process a batch of operations
     */
    private processBatch;
    /**
     * Throttle a function to avoid excessive calls
     * @param key Identifier for this throttled function
     * @param fn Function to execute
     * @param limitMs Minimum time between executions (default: 1000ms)
     */
    throttle<T extends any[], R>(key: string, fn: (...args: T) => Promise<R>, limitMs?: number): (...args: T) => Promise<R>;
    /**
     * Debounce a function to delay execution until after a period of inactivity
     * @param key Identifier for this debounced function
     * @param fn Function to execute
     * @param waitMs Time to wait after last call before executing (default: 300ms)
     */
    debounce<T extends any[], R>(key: string, fn: (...args: T) => Promise<R>, waitMs?: number): (...args: T) => Promise<R>;
    /**
     * Clear all pending operations and timers
     */
    dispose(): void;
    optimizeOperation<T>(operation: () => Promise<T>): Promise<T>;
    optimizeBatch<T>(operations: (() => Promise<T>)[]): Promise<T[]>;
    private createBatches;
    private updateStats;
}
export {};
