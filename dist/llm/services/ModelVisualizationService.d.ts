import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../types';
import { ModelMetricsManager } from './ModelMetricsManager';
import { ModelPerformanceAnalyzer } from './ModelPerformanceAnalyzer';
export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        fill: boolean;
    }[];
}
export interface ChartOptions {
    type: 'line' | 'bar' | 'radar';
    title: string;
    yAxisLabel: string;
    showLegend?: boolean;
}
export declare class ModelVisualizationService extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly metricsManager;
    private readonly performanceAnalyzer;
    private readonly webviewPanels;
    private readonly outputChannel;
    constructor(logger: ILogger, metricsManager: ModelMetricsManager, performanceAnalyzer: ModelPerformanceAnalyzer);
    showPerformanceDashboard(modelId: string): Promise<void>;
    private createWebviewPanel;
    private updateDashboard;
    private preparePerformanceData;
    private generateDashboardHtml;
    private generateEmptyDashboard;
    private handleError;
    dispose(): void;
}
