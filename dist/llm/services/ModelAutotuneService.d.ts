import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../types';
import { ModelMetricsManager } from './ModelMetricsManager';
import { ModelBenchmarkManager } from './ModelBenchmarkManager';
import { ModelPerformanceAnalyzer } from './ModelPerformanceAnalyzer';
export interface AutotuneResult {
    modelId: string;
    timestamp: number;
    parameters: Record<string, any>;
    metrics: {
        latency: number;
        throughput: number;
        errorRate: number;
        memoryUsage: number;
    };
    confidence: number;
}
export declare class ModelAutotuneService extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly metricsManager;
    private readonly benchmarkManager;
    private readonly performanceAnalyzer;
    private readonly tuningHistory;
    private readonly activeTuning;
    private readonly outputChannel;
    constructor(logger: ILogger, metricsManager: ModelMetricsManager, benchmarkManager: ModelBenchmarkManager, performanceAnalyzer: ModelPerformanceAnalyzer);
    startAutotuning(modelId: string): Promise<void>;
    private runAutotuningCycle;
    private gatherBaselineMetrics;
    private defineParameterSpace;
    private generateNextParameters;
    private evaluateParameters;
    private calculateConfidence;
    private isBetterResult;
    private getBestResult;
    private recordTuningResult;
    private getCurrentParameters;
    private logTuningResult;
    private handleError;
    dispose(): void;
}
