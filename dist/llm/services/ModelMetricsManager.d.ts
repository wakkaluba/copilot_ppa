import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ModelPerformanceMetrics } from '../types';
interface MetricsSnapshot {
    timestamp: number;
    metrics: ModelPerformanceMetrics;
}
export declare class ModelMetricsManager extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel;
    private readonly metricsHistory;
    private readonly retentionPeriod;
    private readonly samplingInterval;
    private cleanupInterval;
    private readonly logger;
    constructor();
    trackMetrics(modelId: string, metrics: ModelPerformanceMetrics): Promise<void>;
    getMetricsHistory(modelId: string): MetricsSnapshot[];
    private getLatestSnapshot;
    getLatestMetrics(modelId: string): ModelPerformanceMetrics | undefined;
    getAggregateMetrics(modelId: string): ModelPerformanceMetrics | undefined;
    private addMetricsSnapshot;
    private analyzePerformanceTrends;
    private calculateTrend;
    private calculateAverageResponseTime;
    private calculateAverageThroughput;
    private calculateAverageErrorRate;
    private calculateTotalRequests;
    private calculateTotalTokens;
    private calculateAverage;
    private emitMetricsUpdate;
    private startPeriodicCleanup;
    private cleanupOldMetrics;
    private logMetricsUpdate;
    private logPerformanceTrends;
    private logMetricsCleanup;
    private handleError;
    dispose(): void;
}
export {};
