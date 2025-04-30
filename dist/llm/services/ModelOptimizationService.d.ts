import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../types';
import { ModelMetricsManager } from './ModelMetricsManager';
import { ModelPerformanceAnalyzer } from './ModelPerformanceAnalyzer';
import { ModelBenchmarkManager } from './ModelBenchmarkManager';
export interface OptimizationStrategy {
    name: string;
    description: string;
    priority: number;
    parameters: {
        batchSize?: number;
        threads?: number;
        memoryLimit?: number;
        gpuMemoryLimit?: number;
        maxContextLength?: number;
    };
}
export interface OptimizationMetrics {
    latency: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
    gpuUsage?: number;
    errorRate: number;
    timestamp: number;
}
export interface OptimizationResult {
    modelId: string;
    timestamp: number;
    strategy: OptimizationStrategy;
    metrics: OptimizationMetrics;
    improvements: {
        latency?: number;
        throughput?: number;
        memoryUsage?: number;
        errorRate?: number;
    };
    confidence: number;
}
export declare class ModelOptimizationService extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly metricsManager;
    private readonly performanceAnalyzer;
    private readonly benchmarkManager;
    private readonly optimizationHistory;
    private readonly activeOptimizations;
    private readonly outputChannel;
    constructor(logger: ILogger, metricsManager: ModelMetricsManager, performanceAnalyzer: ModelPerformanceAnalyzer, benchmarkManager: ModelBenchmarkManager);
    optimizeModel(modelId: string, currentMetrics: OptimizationMetrics): Promise<OptimizationResult>;
    private determineOptimizationStrategy;
    private generateOptimizationStrategies;
    private selectBestStrategy;
    private calculateExpectedImpact;
    private applyOptimization;
    private getTargetThroughput;
    private calculateOptimalBatchSize;
    private calculateOptimalMemoryLimit;
    private calculateOptimalContextLength;
    private calculateOptimalThreads;
    private calculateOptimalGpuMemory;
    private gatherMetrics;
    private calculateImprovements;
    private calculateConfidence;
    private trackOptimizationResult;
    private logOptimizationStrategy;
    private logOptimizationResult;
    private handleError;
    getOptimizationHistory(modelId: string): OptimizationResult[];
    clearOptimizationHistory(modelId?: string): void;
    dispose(): void;
}
