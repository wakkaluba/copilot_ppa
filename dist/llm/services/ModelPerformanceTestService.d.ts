import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../types';
import { ModelMetricsManager } from './ModelMetricsManager';
import { ModelPerformanceAnalyzer } from './ModelPerformanceAnalyzer';
import { ModelBenchmarkManager } from './ModelBenchmarkManager';
export interface TestScenario {
    name: string;
    prompts: string[];
    expectedPatterns?: RegExp[];
    config: {
        temperature: number;
        maxTokens?: number;
        repetitions: number;
        timeoutMs: number;
    };
}
export interface TestResult {
    scenarioName: string;
    metrics: {
        averageLatency: number;
        p95Latency: number;
        successRate: number;
        tokensPerSecond: number;
        memoryUsage: number;
    };
    timestamps: number[];
    errors: Error[];
}
export declare class ModelPerformanceTestService extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly metricsManager;
    private readonly performanceAnalyzer;
    private readonly benchmarkManager;
    private readonly testResults;
    private readonly outputChannel;
    private isRunning;
    constructor(logger: ILogger, metricsManager: ModelMetricsManager, performanceAnalyzer: ModelPerformanceAnalyzer, benchmarkManager: ModelBenchmarkManager);
    runTestScenario(modelId: string, scenario: TestScenario): Promise<TestResult>;
    private runWarmup;
    private validateResponse;
    private calculateAverage;
    private calculateP95;
    private logTestResult;
    private handleError;
    getTestResults(modelId: string): TestResult[];
    clearTestResults(modelId?: string): void;
    dispose(): void;
}
