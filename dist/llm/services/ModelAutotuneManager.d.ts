import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { LLMModelInfo, OptimizationResult, AutotuneConfig } from '../types';
import { ModelBenchmarkManager } from './ModelBenchmarkManager';
export declare class ModelAutotuneManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly benchmarkManager;
    private readonly outputChannel;
    private readonly optimizationCache;
    private isRunning;
    constructor(logger: ILogger, benchmarkManager: ModelBenchmarkManager);
    optimizeModel(model: LLMModelInfo, config?: AutotuneConfig): Promise<OptimizationResult>;
    private evaluateConfiguration;
    private generateNextParameters;
    private getDefaultParameterRanges;
    private gatherOptimizationMetrics;
    getLastOptimization(modelId: string): OptimizationResult | undefined;
    clearOptimizations(): void;
    private logOptimizationResult;
    private handleError;
    dispose(): void;
}
