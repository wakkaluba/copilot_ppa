import * as vscode from 'vscode';
import { WorkspacePerformanceResult, PerformanceAnalysisResult } from './types';
import { PerformanceProfiler } from './performanceProfiler';
import { BottleneckDetector } from './bottleneckDetector';
import { CachingService } from './cachingService';
import { AsyncOptimizer } from './asyncOptimizer';
/**
 * Central manager for all performance-related functionality in the extension.
 * Coordinates analysis, profiling, monitoring and reporting of performance metrics.
 */
export declare class PerformanceManager implements vscode.Disposable {
    private static instance;
    private readonly analyzerService;
    private readonly statusService;
    private readonly diagnosticsService;
    private readonly fileMonitorService;
    private readonly configService;
    private readonly profiler;
    private readonly bottleneckDetector;
    private readonly cachingService;
    private readonly asyncOptimizer;
    private readonly eventEmitter;
    private readonly logger;
    private constructor();
    static getInstance(context?: vscode.ExtensionContext): PerformanceManager;
    private initializeServices;
    /**
     * Analyzes the performance of the entire workspace.
     * This includes analyzing all relevant files and collecting workspace-wide metrics.
     */
    analyzeWorkspace(): Promise<WorkspacePerformanceResult>;
    /**
     * Analyzes a specific file for performance issues.
     * @param document The document to analyze
     */
    analyzeFile(document: vscode.TextDocument): Promise<PerformanceAnalysisResult | null>;
    /**
     * Analyzes the currently active file in the editor.
     */
    analyzeCurrentFile(): Promise<PerformanceAnalysisResult | null>;
    /**
     * Generates a performance report with current metrics and bottleneck analysis.
     */
    generatePerformanceReport(): void;
    private setupEventListeners;
    private handleDocumentChange;
    private updateWorkspaceMetrics;
    private updateFileMetrics;
    getProfiler(): PerformanceProfiler;
    getBottleneckDetector(): BottleneckDetector;
    getCachingService(): CachingService;
    getAsyncOptimizer(): AsyncOptimizer;
    on(event: string, listener: (...args: unknown[]) => void): void;
    off(event: string, listener: (...args: unknown[]) => void): void;
    dispose(): void;
}
