import * as vscode from 'vscode';
/**
 * PerformanceProfiler measures, collects, and analyzes performance data
 * for various operations in the extension
 */
export declare class PerformanceProfiler {
    private static instance;
    private sessionService;
    private captureService;
    private persistenceService;
    private bottleneckService;
    private cacheService;
    private constructor();
    static getInstance(context: vscode.ExtensionContext): PerformanceProfiler;
    setEnabled(enabled: boolean): void;
    startOperation(id: string): void;
    endOperation(id: string, note?: string): void;
    getStats(id: string): any;
    getTrend(id: string): any;
    getResourceStats(id: string): any;
    resetStats(): void;
    clearStoredMetrics(): Promise<void>;
    dispose(): void;
}
