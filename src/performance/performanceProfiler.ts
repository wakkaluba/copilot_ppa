import * as vscode from 'vscode';
import { Logger } from '../utils/logger';

/**
 * PerformanceProfiler measures, collects, and analyzes performance data
 * for various operations in the extension
 */
export class PerformanceProfiler {
    private static instance: PerformanceProfiler;
    private profilerEnabled: boolean = false;
    private operationTimes: Map<string, number[]> = new Map();
    private operationStartTimes: Map<string, number> = new Map();
    private logger: Logger;
    
    private constructor() {
        this.logger = Logger.getInstance();
    }
    
    public static getInstance(): PerformanceProfiler {
        if (!PerformanceProfiler.instance) {
            PerformanceProfiler.instance = new PerformanceProfiler();
        }
        return PerformanceProfiler.instance;
    }
    
    /**
     * Enable or disable the performance profiler
     */
    public setEnabled(enabled: boolean): void {
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
    public startOperation(operationId: string): void {
        if (!this.profilerEnabled) return;
        
        this.operationStartTimes.set(operationId, performance.now());
    }
    
    /**
     * End timing an operation and record its duration
     */
    public endOperation(operationId: string, note?: string): void {
        if (!this.profilerEnabled) return;
        
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
    public getOperationStats(operationId: string): { avg: number, min: number, max: number, count: number } | undefined {
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
    public getAllStats(): Map<string, { avg: number, min: number, max: number, count: number }> {
        const stats = new Map();
        
        for (const [opId, times] of this.operationTimes.entries()) {
            if (times.length === 0) continue;
            
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
    public resetStats(): void {
        this.operationTimes.clear();
        this.operationStartTimes.clear();
    }
}
