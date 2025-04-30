import * as vscode from 'vscode';
/**
 * @deprecated Use PerformanceManager from './performance/performanceManager' instead.
 * This class will be removed in a future version.
 */
export declare class RuntimeAnalyzer {
    private readonly outputChannel;
    private readonly logger;
    private isRecording;
    constructor();
    /**
     * @deprecated Use PerformanceManager.startProfiling() instead
     */
    startRecording(): void;
    /**
     * @deprecated Use PerformanceManager.stopProfiling() instead
     */
    stopRecording(): void;
    /**
     * @deprecated Use PerformanceManager.getProfiler().startOperation() instead
     */
    markStart(markerId: string): void;
    /**
     * @deprecated Use PerformanceManager.getProfiler().endOperation() instead
     */
    markEnd(markerId: string): void;
    /**
     * @deprecated Use PerformanceManager.generatePerformanceReport() instead
     */
    generatePerformanceReport(): void;
    /**
     * @deprecated Use PerformanceManager.analyzeCurrentFile() instead
     */
    analyzeResults(): void;
    /**
     * @deprecated Use PerformanceManager.analyzeWorkspace() instead
     */
    generateVisualReport(): Promise<vscode.Uri | undefined>;
}
export declare const runtimeAnalyzer: RuntimeAnalyzer;
