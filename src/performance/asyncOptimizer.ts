import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { PerformanceProfiler } from './performanceProfiler';
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
export class AsyncOptimizer {
    private static instance: AsyncOptimizer;
    private logger: Logger;
    private profiler: PerformanceProfiler;
    private pendingBatches: Map<string, { items: any[], resolver: Function, timer: NodeJS.Timeout }> = new Map();
    private throttleTimers: Map<string, { lastExecuted: number, timer: NodeJS.Timeout | null }> = new Map();
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
    private config: AsyncOptions;
    private stats: AsyncStats;

    private constructor() {
        this.logger = Logger.getInstance();
        this.profiler = PerformanceProfiler.getInstance();
        this.stats = {
            optimizedCount: 0,
            avgResponseTime: 0,
            successRate: 100,
            batchesProcessed: 0
        };
    }

    public static getInstance(): AsyncOptimizer {
        if (!AsyncOptimizer.instance) {
            AsyncOptimizer.instance = new AsyncOptimizer();
        }
        return AsyncOptimizer.instance;
    }

    public setConfig(config: AsyncOptions): void {
        this.config = config;
    }

    public getStats(): AsyncStats {
        return { ...this.stats };
    }

    /**
     * Batch multiple operations into a single execution
     * @param batchId Identifier for the batch
     * @param item Item to add to the batch
     * @param processBatchFn Function to process the batch
     * @param delayMs Delay before processing the batch (default: 100ms)
     * @param maxBatchSize Maximum batch size before forced processing
     */
    public async addToBatch<T, R>(
        batchId: string,
        item: T,
        processBatchFn: (items: T[]) => Promise<R[]>,
        delayMs: number = 100,
        maxBatchSize: number = 50
    ): Promise<R> {
        return new Promise((resolve) => {
            const existingBatch = this.pendingBatches.get(batchId);
            
            if (existingBatch) {
                // Add item to existing batch
                const itemIndex = existingBatch.items.length;
                existingBatch.items.push(item);
                
                // Save the resolver for this specific item
                const originalResolver = existingBatch.resolver;
                existingBatch.resolver = async (results: R[]) => {
                    originalResolver(results);
                    resolve(results[itemIndex]);
                };
                
                // Process immediately if we hit max batch size
                if (existingBatch.items.length >= maxBatchSize) {
                    clearTimeout(existingBatch.timer);
                    this.processBatch(batchId, processBatchFn);
                }
            } else {
                // Create a new batch
                const timer = setTimeout(() => {
                    this.processBatch(batchId, processBatchFn);
                }, delayMs);
                
                this.pendingBatches.set(batchId, {
                    items: [item],
                    resolver: (results: R[]) => resolve(results[0]),
                    timer
                });
            }
        });
    }
    
    /**
     * Process a batch of operations
     */
    private async processBatch<T, R>(batchId: string, processFn: (items: T[]) => Promise<R[]>): Promise<void> {
        const batch = this.pendingBatches.get(batchId);
        if (!batch) {return;}
        
        this.pendingBatches.delete(batchId);
        
        try {
            this.profiler.startOperation(`batch.${batchId}`);
            const results = await processFn(batch.items);
            this.profiler.endOperation(`batch.${batchId}`, `Processed ${batch.items.length} items`);
            
            // Resolve the batch promise
            batch.resolver(results);
        } catch (error) {
            this.logger.error(`Error processing batch ${batchId}: ${error}`);
            // Resolve with empty results in case of error
            batch.resolver([]);
        }
    }
    
    /**
     * Throttle a function to avoid excessive calls
     * @param key Identifier for this throttled function
     * @param fn Function to execute
     * @param limitMs Minimum time between executions (default: 1000ms)
     */
    public throttle<T extends any[], R>(
        key: string,
        fn: (...args: T) => Promise<R>,
        limitMs: number = 1000
    ): (...args: T) => Promise<R> {
        return async (...args: T): Promise<R> => {
            const now = Date.now();
            const throttleInfo = this.throttleTimers.get(key) || { lastExecuted: 0, timer: null };
            
            // Calculate time since last execution
            const timeSinceLast = now - throttleInfo.lastExecuted;
            
            // If we're within the limit, schedule for later execution
            if (timeSinceLast < limitMs) {
                const delayMs = limitMs - timeSinceLast;
                
                return new Promise((resolve) => {
                    // Clear existing timer if any
                    if (throttleInfo.timer) {
                        clearTimeout(throttleInfo.timer);
                    }
                    
                    // Set new timer
                    const timer = setTimeout(async () => {
                        this.throttleTimers.set(key, {
                            lastExecuted: Date.now(),
                            timer: null
                        });
                        
                        try {
                            const result = await fn(...args);
                            resolve(result);
                        } catch (error) {
                            this.logger.error(`Error in throttled function ${key}: ${error}`);
                            throw error;
                        }
                    }, delayMs);
                    
                    this.throttleTimers.set(key, {
                        ...throttleInfo,
                        timer
                    });
                });
            }
            
            // Execute immediately if outside the limit
            this.throttleTimers.set(key, {
                lastExecuted: now,
                timer: null
            });
            
            return fn(...args);
        };
    }
    
    /**
     * Debounce a function to delay execution until after a period of inactivity
     * @param key Identifier for this debounced function
     * @param fn Function to execute
     * @param waitMs Time to wait after last call before executing (default: 300ms)
     */
    public debounce<T extends any[], R>(
        key: string,
        fn: (...args: T) => Promise<R>,
        waitMs: number = 300
    ): (...args: T) => Promise<R> {
        return (...args: T): Promise<R> => {
            return new Promise((resolve) => {
                // Clear existing timer
                if (this.debounceTimers.has(key)) {
                    clearTimeout(this.debounceTimers.get(key));
                }
                
                // Set new timer
                const timer = setTimeout(async () => {
                    this.debounceTimers.delete(key);
                    try {
                        const result = await fn(...args);
                        resolve(result);
                    } catch (error) {
                        this.logger.error(`Error in debounced function ${key}: ${error}`);
                        throw error;
                    }
                }, waitMs);
                
                this.debounceTimers.set(key, timer);
            });
        };
    }
    
    /**
     * Clear all pending operations and timers
     */
    public dispose(): void {
        // Clear all batch timers
        for (const batch of this.pendingBatches.values()) {
            clearTimeout(batch.timer);
            batch.resolver([]);
        }
        this.pendingBatches.clear();
        
        // Clear all throttle timers
        for (const throttleInfo of this.throttleTimers.values()) {
            if (throttleInfo.timer) {
                clearTimeout(throttleInfo.timer);
            }
        }
        this.throttleTimers.clear();
        
        // Clear all debounce timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
    }

    public async optimizeOperation<T>(operation: () => Promise<T>): Promise<T> {
        const startTime = Date.now();
        try {
            const result = await Promise.race([
                operation(),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('Operation timed out')), this.config.timeoutMs)
                )
            ]);

            this.updateStats(startTime, true);
            return result;
        } catch (error) {
            this.updateStats(startTime, false);
            throw error;
        }
    }

    public async optimizeBatch<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
        const results: T[] = [];
        const batches = this.createBatches(operations);

        for (const batch of batches) {
            const batchResults = await Promise.all(
                batch.map(op => this.optimizeOperation(op))
            );
            results.push(...batchResults);
            this.stats.batchesProcessed++;
        }

        return results;
    }

    private createBatches<T>(operations: (() => Promise<T>)[]): (() => Promise<T>)[][] {
        const batches: (() => Promise<T>)[][] = [];
        for (let i = 0; i < operations.length; i += this.config.batchSize) {
            batches.push(operations.slice(i, i + this.config.batchSize));
        }
        return batches;
    }

    private updateStats(startTime: number, success: boolean): void {
        const duration = Date.now() - startTime;
        this.stats.optimizedCount++;
        this.stats.avgResponseTime = (this.stats.avgResponseTime * (this.stats.optimizedCount - 1) + duration) / this.stats.optimizedCount;
        
        // Update success rate
        const totalOps = this.stats.optimizedCount;
        const successfulOps = Math.round(this.stats.successRate * (totalOps - 1) / 100);
        const newSuccessfulOps = success ? successfulOps + 1 : successfulOps;
        this.stats.successRate = (newSuccessfulOps / totalOps) * 100;
    }
}
