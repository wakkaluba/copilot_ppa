import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { LLMModelInfo, BenchmarkResult } from '../types';
export declare class ModelBenchmarkManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly benchmarkCache;
    private readonly outputChannel;
    private isRunning;
    constructor(logger: ILogger);
    runBenchmark(model: LLMModelInfo, options?: {
        promptSizes?: number[];
        iterations?: number;
        warmupRuns?: number;
        timeoutMs?: number;
    }): Promise<BenchmarkResult>;
    private collectBenchmarkMetrics;
    private runSingleIteration;
    getLastBenchmark(modelId: string): BenchmarkResult | undefined;
    clearBenchmarks(): void;
    private getSystemInfo;
    private calculateAverage;
    private calculateP95;
    private calculateOverallAverage;
    private calculateOverallP95;
    private logBenchmarkResult;
    private handleError;
    dispose(): void;
}
