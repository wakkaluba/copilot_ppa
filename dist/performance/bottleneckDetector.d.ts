import { EventEmitter } from 'events';
/**
 * Threshold configuration for bottleneck detection
 */
export interface BottleneckThresholds {
    warning: number;
    critical: number;
    samplesRequired: number;
}
interface PerformanceIssue {
    type: 'execution-time' | 'memory-usage' | 'operations-count' | 'memory-leak-suspected' | 'operation-count-growth';
    metric: number;
    threshold: number;
    sessionId: string;
    timestamp?: number;
    context?: any;
}
/**
 * BottleneckDetector analyzes performance data to identify operations
 * that are potentially causing performance issues
 */
export declare class BottleneckDetector extends EventEmitter {
    private static instance;
    private service;
    private constructor();
    static getInstance(): BottleneckDetector;
    /**
     * Enable or disable bottleneck detection
     */
    setEnabled(enabled: boolean): void;
    /**
     * Reset all bottleneck statistics
     */
    resetStats(): void;
    /**
     * Set performance thresholds for a specific operation
     */
    setThreshold(operationId: string, thresholds: BottleneckThresholds): void;
    /**
     * Analyze a completed operation for bottlenecks
     */
    analyzeOperation(operationId: string): void;
    /**
     * Analyze all operations to find bottlenecks
     */
    analyzeAll(): {
        critical: string[];
        warnings: string[];
    };
    /**
     * Gets optimization suggestions for a specific operation
     */
    getOptimizationSuggestions(operationId: string): string[];
    reportPerformanceIssue(issue: PerformanceIssue): void;
    getIssues(sessionId: string): PerformanceIssue[];
    getOperationsCount(): number;
    incrementOperationsCount(): void;
    resetOperationsCount(): void;
    getPatternAnalysis(sessionId: string): any;
    getSummary(): any;
    clear(): void;
}
export {};
