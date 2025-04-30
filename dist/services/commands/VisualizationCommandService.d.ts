import * as vscode from 'vscode';
import { ErrorHandler } from '../error/ErrorHandler';
export declare class VisualizationCommandService {
    private readonly context;
    private readonly errorHandler;
    constructor(context: vscode.ExtensionContext, errorHandler: ErrorHandler);
    showMetrics(): Promise<void>;
    showMemoryVisualization(): Promise<void>;
    showPerformanceMetrics(): Promise<void>;
    exportMetrics(): Promise<void>;
    private createWebviewPanel;
    private getMetricsDashboardHtml;
    private getPerformanceMetricsHtml;
}
