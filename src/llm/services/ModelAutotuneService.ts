import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
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

@injectable()
export class ModelAutotuneService extends EventEmitter implements vscode.Disposable {
    private readonly tuningHistory = new Map<string, AutotuneResult[]>();
    private readonly activeTuning = new Set<string>();
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsManager) private readonly metricsManager: ModelMetricsManager,
        @inject(ModelBenchmarkManager) private readonly benchmarkManager: ModelBenchmarkManager,
        @inject(ModelPerformanceAnalyzer) private readonly performanceAnalyzer: ModelPerformanceAnalyzer
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Auto-tuning');
    }

    public async startAutotuning(modelId: string): Promise<void> {
        if (this.activeTuning.has(modelId)) {
            throw new Error('Auto-tuning already in progress');
        }

        try {
            this.activeTuning.add(modelId);
            this.emit('autotuningStarted', { modelId });

            await this.runAutotuningCycle(modelId);

        } catch (error) {
            this.handleError(`Auto-tuning failed for model ${modelId}`, error as Error);
            throw error;
        } finally {
            this.activeTuning.delete(modelId);
        }
    }

    private async runAutotuningCycle(modelId: string): Promise<void> {
        const baseMetrics = await this.gatherBaselineMetrics(modelId);
        const parameterRanges = this.defineParameterSpace(baseMetrics);
        let currentParams = this.getCurrentParameters(modelId);
        
        for (let i = 0; i < 10; i++) { // Run 10 optimization iterations
            const candidateParams = this.generateNextParameters(currentParams, parameterRanges, i / 10);
            const result = await this.evaluateParameters(modelId, candidateParams);
            
            if (this.isBetterResult(result, this.getBestResult(modelId))) {
                currentParams = candidateParams;
                this.recordTuningResult(result);
                this.emit('betterParametersFound', result);
            }

            this.emit('iterationCompleted', {
                modelId,
                iteration: i + 1,
                currentParams,
                metrics: result.metrics
            });
        }
    }

    private async gatherBaselineMetrics(modelId: string): Promise<any> {
        const metrics = await this.metricsManager.getLatestMetrics(modelId);
        if (!metrics) {
            throw new Error('No baseline metrics available');
        }
        return metrics;
    }

    private defineParameterSpace(baseMetrics: any): Map<string, [number, number]> {
        const ranges = new Map<string, [number, number]>();
        ranges.set('temperature', [0.1, 1.0]);
        ranges.set('topP', [0.1, 1.0]);
        ranges.set('maxTokens', [256, 4096]);
        ranges.set('frequencyPenalty', [-2.0, 2.0]);
        ranges.set('presencePenalty', [-2.0, 2.0]);
        return ranges;
    }

    private generateNextParameters(
        current: Record<string, any>,
        ranges: Map<string, [number, number]>,
        progress: number
    ): Record<string, any> {
        const params = { ...current };
        const explorationFactor = Math.max(0.1, 1 - progress);

        for (const [param, [min, max]] of ranges.entries()) {
            const range = max - min;
            const mutation = (Math.random() - 0.5) * range * explorationFactor;
            params[param] = Math.max(min, Math.min(max, 
                (current[param] || (min + max) / 2) + mutation
            ));
        }

        return params;
    }

    private async evaluateParameters(
        modelId: string,
        parameters: Record<string, any>
    ): Promise<AutotuneResult> {
        const benchmark = await this.benchmarkManager.runBenchmark(
            { id: modelId, parameters },
            { iterations: 3, warmupRuns: 1 }
        );

        return {
            modelId,
            timestamp: Date.now(),
            parameters,
            metrics: {
                latency: benchmark.metrics.averageLatency,
                throughput: benchmark.metrics.tokensPerSecond,
                errorRate: 0, // Would come from error tracking
                memoryUsage: benchmark.metrics.maxRss
            },
            confidence: this.calculateConfidence(benchmark.metrics)
        };
    }

    private calculateConfidence(metrics: any): number {
        // Normalize and weight different metrics
        const latencyScore = Math.max(0, 1 - metrics.averageLatency / 1000);
        const throughputScore = Math.min(metrics.tokensPerSecond / 100, 1);
        return (latencyScore * 0.4 + throughputScore * 0.6);
    }

    private isBetterResult(current: AutotuneResult, previous?: AutotuneResult): boolean {
        if (!previous) return true;
        return current.confidence > previous.confidence;
    }

    private getBestResult(modelId: string): AutotuneResult | undefined {
        const history = this.tuningHistory.get(modelId) || [];
        return history.length > 0 ? history[history.length - 1] : undefined;
    }

    private recordTuningResult(result: AutotuneResult): void {
        const history = this.tuningHistory.get(result.modelId) || [];
        history.push(result);
        this.tuningHistory.set(result.modelId, history);
        this.logTuningResult(result);
    }

    private getCurrentParameters(modelId: string): Record<string, any> {
        const lastResult = this.getBestResult(modelId);
        return lastResult?.parameters || {
            temperature: 0.7,
            topP: 1.0,
            maxTokens: 2048,
            frequencyPenalty: 0,
            presencePenalty: 0
        };
    }

    private logTuningResult(result: AutotuneResult): void {
        this.outputChannel.appendLine('\nTuning Result:');
        this.outputChannel.appendLine(`Model: ${result.modelId}`);
        this.outputChannel.appendLine(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
        this.outputChannel.appendLine(`Confidence: ${result.confidence.toFixed(4)}`);
        this.outputChannel.appendLine('\nParameters:');
        Object.entries(result.parameters).forEach(([key, value]) => {
            this.outputChannel.appendLine(`${key}: ${value}`);
        });
        this.outputChannel.appendLine('\nMetrics:');
        Object.entries(result.metrics).forEach(([key, value]) => {
            this.outputChannel.appendLine(`${key}: ${value}`);
        });
    }

    private handleError(message: string, error: Error): void {
        this.logger.error(message, error);
        this.emit('error', { message, error });
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.tuningHistory.clear();
        this.activeTuning.clear();
        this.removeAllListeners();
    }
}
