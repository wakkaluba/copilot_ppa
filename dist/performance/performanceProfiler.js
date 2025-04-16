"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceProfiler = void 0;
const logger_1 = require("../utils/logger");
/**
 * PerformanceProfiler measures, collects, and analyzes performance data
 * for various operations in the extension
 */
class PerformanceProfiler {
    constructor() {
        this.profilerEnabled = false;
        this.operationTimes = new Map();
        this.operationStartTimes = new Map();
        this.logger = logger_1.Logger.getInstance();
    }
    static getInstance() {
        if (!PerformanceProfiler.instance) {
            PerformanceProfiler.instance = new PerformanceProfiler();
        }
        return PerformanceProfiler.instance;
    }
    /**
     * Enable or disable the performance profiler
     */
    setEnabled(enabled) {
        this.profilerEnabled = enabled;
        this.logger.log(`Performance profiler ${enabled ? 'enabled' : 'disabled'}`);
        if (!enabled) {
            // Clear data when disabling
            this.operationTimes.clear();
            this.operationStartTimes.clear();
        }
    }
    /**
     * Start timing an operation
     */
    startOperation(operationId) {
        if (!this.profilerEnabled)
            return;
        this.operationStartTimes.set(operationId, performance.now());
    }
    /**
     * End timing an operation and record its duration
     */
    endOperation(operationId, note) {
        if (!this.profilerEnabled)
            return;
        const startTime = this.operationStartTimes.get(operationId);
        if (!startTime) {
            this.logger.warn(`No start time found for operation: ${operationId}`);
            return;
        }
        const duration = performance.now() - startTime;
        if (!this.operationTimes.has(operationId)) {
            this.operationTimes.set(operationId, []);
        }
        this.operationTimes.get(operationId)?.push(duration);
        // Log the operation time
        const message = note
            ? `Operation ${operationId} completed in ${duration.toFixed(2)}ms: ${note}`
            : `Operation ${operationId} completed in ${duration.toFixed(2)}ms`;
        this.logger.log(message);
        this.operationStartTimes.delete(operationId);
    }
    /**
     * Get performance statistics for an operation
     */
    getOperationStats(operationId) {
        const times = this.operationTimes.get(operationId);
        if (!times || times.length === 0) {
            return undefined;
        }
        const total = times.reduce((sum, time) => sum + time, 0);
        return {
            avg: total / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
            count: times.length
        };
    }
    /**
     * Get stats for all operations
     */
    getAllStats() {
        const stats = new Map();
        for (const [opId, times] of this.operationTimes.entries()) {
            if (times.length === 0)
                continue;
            const total = times.reduce((sum, time) => sum + time, 0);
            stats.set(opId, {
                avg: total / times.length,
                min: Math.min(...times),
                max: Math.max(...times),
                count: times.length
            });
        }
        return stats;
    }
    /**
     * Reset all collected stats
     */
    resetStats() {
        this.operationTimes.clear();
        this.operationStartTimes.clear();
    }
}
exports.PerformanceProfiler = PerformanceProfiler;
//# sourceMappingURL=performanceProfiler.js.map