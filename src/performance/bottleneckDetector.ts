import * as vscode from 'vscode';
import { PerformanceProfiler } from './performanceProfiler';
import { Logger } from '../utils/logger';
import { EventEmitter } from 'events';
import { BottleneckDetectionService } from './services/BottleneckDetectionService';

/**
 * Threshold configuration for bottleneck detection
 */
export interface BottleneckThresholds {
    warning: number;   // Time in ms that triggers a warning
    critical: number;  // Time in ms that triggers a critical alert
    samplesRequired: number; // Minimum samples needed before analysis
}

interface PerformanceIssue {
    type: 'execution-time' | 'memory-usage' | 'operations-count' | 'memory-leak-suspected' | 'operation-count-growth';
    metric: number;
    threshold: number;
    sessionId: string;
    timestamp?: number;
    context?: any;
}

interface OperationPattern {
    operationId: string;
    avgDuration: number;
    frequency: number;
    memoryImpact: number;
    dependencies: string[];
}

/**
 * BottleneckDetector analyzes performance data to identify operations
 * that are potentially causing performance issues
 */
export class BottleneckDetector extends EventEmitter {
    private static instance: BottleneckDetector;
    private service: BottleneckDetectionService;

    private constructor() {
        super();
        this.service = new BottleneckDetectionService();
    }

    public static getInstance(): BottleneckDetector {
        if (!BottleneckDetector.instance) {
            BottleneckDetector.instance = new BottleneckDetector();
        }
        return BottleneckDetector.instance;
    }

    /**
     * Enable or disable bottleneck detection
     */
    public setEnabled(enabled: boolean): void {
        this.service.setEnabled(enabled);
    }

    /**
     * Reset all bottleneck statistics
     */
    public resetStats(): void {
        this.service.resetStats();
    }

    /**
     * Set performance thresholds for a specific operation
     */
    public setThreshold(operationId: string, thresholds: BottleneckThresholds): void {
        this.service.setThreshold(operationId, thresholds);
    }

    /**
     * Analyze a completed operation for bottlenecks
     */
    public analyzeOperation(operationId: string): void {
        this.service.analyzeOperation(operationId);
    }

    /**
     * Analyze all operations to find bottlenecks
     */
    public analyzeAll(): { critical: string[], warnings: string[] } {
        return this.service.analyzeAll();
    }

    /**
     * Gets optimization suggestions for a specific operation
     */
    public getOptimizationSuggestions(operationId: string): string[] {
        return this.service.getOptimizationSuggestions(operationId);
    }

    public reportPerformanceIssue(issue: PerformanceIssue): void {
        this.service.reportPerformanceIssue(issue);
    }

    public getIssues(sessionId: string): PerformanceIssue[] {
        return this.service.getIssues(sessionId);
    }

    public getOperationsCount(): number {
        return this.service.getOperationsCount();
    }

    public incrementOperationsCount(): void {
        this.service.incrementOperationsCount();
    }

    public resetOperationsCount(): void {
        this.service.resetOperationsCount();
    }

    public getPatternAnalysis(sessionId: string) {
        return this.service.getPatternAnalysis(sessionId);
    }

    public getSummary() {
        return this.service.getSummary();
    }

    public clear(): void {
        this.service.clear();
    }
}
