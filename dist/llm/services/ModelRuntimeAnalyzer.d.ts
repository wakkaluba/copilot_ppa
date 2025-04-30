import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { ILogger } from '../../common/logging';
import { ModelMetricsManager } from './ModelMetricsManager';
import { ModelResourceMonitorV2 } from './ModelResourceMonitorV2';
import { ModelHealthMonitorV2 } from './ModelHealthMonitorV2';
export declare class ModelRuntimeAnalyzer extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly metricsManager;
    private readonly resourceMonitor;
    private readonly healthMonitor;
    private readonly config;
    private readonly metricsHistory;
    private readonly analysisIntervals;
    private readonly outputChannel;
    constructor(logger: ILogger, metricsManager: ModelMetricsManager, resourceMonitor: ModelResourceMonitorV2, healthMonitor: ModelHealthMonitorV2, config?: {
        analysisInterval: number;
        historyRetention: number;
        performanceThresholds: {
            responseTime: number;
            errorRate: number;
            cpuUsage: number;
            memoryUsage: number;
        };
    });
    startAnalysis(modelId: string): Promise<void>;
    stopAnalysis(modelId: string): void;
    private initializeAnalysis;
    private analyzeRuntime;
    private gatherMetrics;
    private analyzeMetrics;
    private analyzePerformance;
    private analyzeResources;
    private generateRecommendations;
    private calculateTrend;
    private updateMetricsHistory;
    private logAnalysis;
    private handleError;
    dispose(): void;
}
