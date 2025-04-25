"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncOptimizer = void 0;
const performanceProfiler_1 = require("./performanceProfiler");
/**
 * Class to optimize asynchronous operations by providing
 * utilities for batching, throttling, and debouncing
 */
class AsyncOptimizer {
    static instance;
    logger;
    profiler;
    pendingBatches = new Map();
    throttleTimers = new Map();
    debounceTimers = new Map();
    config;
    stats;
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        this.profiler = performanceProfiler_1.PerformanceProfiler.getInstance();
        this.stats = {
            optimizedCount: 0,
            avgResponseTime: 0,
            successRate: 100,
            batchesProcessed: 0
        };
    }
    static getInstance() {
        if (!AsyncOptimizer.instance) {
            AsyncOptimizer.instance = new AsyncOptimizer();
        }
        return AsyncOptimizer.instance;
    }
    setConfig(config) {
        this.config = config;
    }
    getStats() {
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
    async addToBatch(batchId, item, processBatchFn, delayMs = 100, maxBatchSize = 50) {
        return new Promise((resolve) => {
            const existingBatch = this.pendingBatches.get(batchId);
            if (existingBatch) {
                // Add item to existing batch
                const itemIndex = existingBatch.items.length;
                existingBatch.items.push(item);
                // Save the resolver for this specific item
                const originalResolver = existingBatch.resolver;
                existingBatch.resolver = async (results) => {
                    originalResolver(results);
                    resolve(results[itemIndex]);
                };
                // Process immediately if we hit max batch size
                if (existingBatch.items.length >= maxBatchSize) {
                    clearTimeout(existingBatch.timer);
                    this.processBatch(batchId, processBatchFn);
                }
            }
            else {
                // Create a new batch
                const timer = setTimeout(() => {
                    this.processBatch(batchId, processBatchFn);
                }, delayMs);
                this.pendingBatches.set(batchId, {
                    items: [item],
                    resolver: (results) => resolve(results[0]),
                    timer
                });
            }
        });
    }
    /**
     * Process a batch of operations
     */
    async processBatch(batchId, processFn) {
        const batch = this.pendingBatches.get(batchId);
        if (!batch) {
            return;
        }
        this.pendingBatches.delete(batchId);
        try {
            this.profiler.startOperation(`batch.${batchId}`);
            const results = await processFn(batch.items);
            this.profiler.endOperation(`batch.${batchId}`, `Processed ${batch.items.length} items`);
            // Resolve the batch promise
            batch.resolver(results);
        }
        catch (error) {
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
    throttle(key, fn, limitMs = 1000) {
        return async (...args) => {
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
                        }
                        catch (error) {
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
    debounce(key, fn, waitMs = 300) {
        return (...args) => {
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
                    }
                    catch (error) {
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
    dispose() {
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
    async optimizeOperation(operation) {
        const startTime = Date.now();
        try {
            const result = await Promise.race([
                operation(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), this.config.timeoutMs))
            ]);
            this.updateStats(startTime, true);
            return result;
        }
        catch (error) {
            this.updateStats(startTime, false);
            throw error;
        }
    }
    async optimizeBatch(operations) {
        const results = [];
        const batches = this.createBatches(operations);
        for (const batch of batches) {
            const batchResults = await Promise.all(batch.map(op => this.optimizeOperation(op)));
            results.push(...batchResults);
            this.stats.batchesProcessed++;
        }
        return results;
    }
    createBatches(operations) {
        const batches = [];
        for (let i = 0; i < operations.length; i += this.config.batchSize) {
            batches.push(operations.slice(i, i + this.config.batchSize));
        }
        return batches;
    }
    updateStats(startTime, success) {
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
exports.AsyncOptimizer = AsyncOptimizer;
//# sourceMappingURL=asyncOptimizer.js.map