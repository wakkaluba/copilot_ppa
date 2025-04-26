import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { LLMModelInfo, OptimizationResult, AutotuneConfig, ModelMetrics } from '../types';
import { ModelBenchmarkManager } from './ModelBenchmarkManager';

@injectable()
export class ModelAutotuneManager extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly optimizationCache = new Map<string, OptimizationResult>();
    private isRunning = false;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelBenchmarkManager) private readonly benchmarkManager: ModelBenchmarkManager
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Autotuning');
    }

    public async optimizeModel(
        model: LLMModelInfo,
        config: AutotuneConfig = {}
    ): Promise<OptimizationResult> {
        if (this.isRunning) {
            throw new Error('Optimization already in progress');
        }

        try {
            this.isRunning = true;
            this.emit('optimizationStarted', model.id);

            const {
                maxIterations = 10,
                convergenceThreshold = 0.01,
                targetMetric = 'tokensPerSecond',
                parameterRanges = this.getDefaultParameterRanges(model)
            } = config;

            let bestParams = { ...model.config };
            let bestScore = await this.evaluateConfiguration(model, bestParams);
            
            for (let i = 0; i < maxIterations; i++) {
                const candidateParams = this.generateNextParameters(
                    bestParams,
                    parameterRanges,
                    i / maxIterations
                );

                const score = await this.evaluateConfiguration(model, candidateParams);
                
                if (score > bestScore * (1 + convergenceThreshold)) {
                    bestParams = candidateParams;
                    bestScore = score;
                    this.emit('betterConfigurationFound', {
                        modelId: model.id,
                        params: bestParams,
                        score: bestScore
                    });
                }

                this.emit('iterationCompleted', {
                    modelId: model.id,
                    iteration: i + 1,
                    currentScore: score,
                    bestScore
                });
            }

            const result: OptimizationResult = {
                modelId: model.id,
                timestamp: new Date(),
                bestConfiguration: bestParams,
                score: bestScore,
                metrics: await this.gatherOptimizationMetrics(model, bestParams)
            };

            this.optimizationCache.set(model.id, result);
            this.logOptimizationResult(result);
            this.emit('optimizationCompleted', result);

            return result;
        } catch (error) {
            this.handleError('Failed to optimize model', error as Error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    private async evaluateConfiguration(
        model: LLMModelInfo,
        params: any
    ): Promise<number> {
        // Run benchmarks with the given parameters
        const benchmarkResult = await this.benchmarkManager.runBenchmark(
            { ...model, config: params },
            { iterations: 3, warmupRuns: 1 }
        );

        return benchmarkResult.metrics.tokensPerSecond;
    }

    private generateNextParameters(
        currentParams: any,
        ranges: Map<string, [number, number]>,
        progress: number
    ): any {
        const newParams = { ...currentParams };
        const explorationFactor = Math.max(0.1, 1 - progress); // Reduce exploration over time

        for (const [param, [min, max]] of ranges.entries()) {
            const range = max - min;
            const mutation = (Math.random() - 0.5) * range * explorationFactor;
            
            newParams[param] = Math.max(min, Math.min(max,
                currentParams[param] + mutation
            ));
        }

        return newParams;
    }

    private getDefaultParameterRanges(model: LLMModelInfo): Map<string, [number, number]> {
        const ranges = new Map<string, [number, number]>();
        
        ranges.set('temperature', [0.1, 1.0]);
        ranges.set('topP', [0.1, 1.0]);
        ranges.set('frequencyPenalty', [-2.0, 2.0]);
        ranges.set('presencePenalty', [-2.0, 2.0]);

        if (model.config.maxTokens) {
            const maxContextSize = model.contextLength || 4096;
            ranges.set('maxTokens', [256, maxContextSize]);
        }

        return ranges;
    }

    private async gatherOptimizationMetrics(
        model: LLMModelInfo,
        params: any
    ): Promise<ModelMetrics> {
        const benchmark = await this.benchmarkManager.runBenchmark(
            { ...model, config: params },
            { iterations: 5, warmupRuns: 2 }
        );

        return {
            averageLatency: benchmark.metrics.averageLatency,
            p95Latency: benchmark.metrics.p95Latency,
            tokensPerSecond: benchmark.metrics.tokensPerSecond,
            memoryUsage: benchmark.metrics.maxRss,
            timestamp: new Date()
        };
    }

    public getLastOptimization(modelId: string): OptimizationResult | undefined {
        return this.optimizationCache.get(modelId);
    }

    public clearOptimizations(): void {
        this.optimizationCache.clear();
        this.emit('optimizationsCleared');
    }

    private logOptimizationResult(result: OptimizationResult): void {
        this.outputChannel.appendLine('\nOptimization Results:');
        this.outputChannel.appendLine(`Model: ${result.modelId}`);
        this.outputChannel.appendLine(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
        this.outputChannel.appendLine(`Best Score: ${result.score.toFixed(2)}`);
        
        this.outputChannel.appendLine('\nOptimized Configuration:');
        Object.entries(result.bestConfiguration).forEach(([key, value]) => {
            this.outputChannel.appendLine(`${key}: ${value}`);
        });

        this.outputChannel.appendLine('\nPerformance Metrics:');
        this.outputChannel.appendLine(`Average Latency: ${result.metrics.averageLatency.toFixed(2)}ms`);
        this.outputChannel.appendLine(`P95 Latency: ${result.metrics.p95Latency.toFixed(2)}ms`);
        this.outputChannel.appendLine(`Tokens/Second: ${result.metrics.tokensPerSecond.toFixed(2)}`);
        this.outputChannel.appendLine(`Memory Usage: ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelAutotuneManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.optimizationCache.clear();
    }
}
