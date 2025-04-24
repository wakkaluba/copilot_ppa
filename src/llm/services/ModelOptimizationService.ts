import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
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

@injectable()
export class ModelOptimizationService extends EventEmitter implements vscode.Disposable {
    private readonly optimizationHistory = new Map<string, OptimizationResult[]>();
    private readonly activeOptimizations = new Set<string>();
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsManager) private readonly metricsManager: ModelMetricsManager,
        @inject(ModelPerformanceAnalyzer) private readonly performanceAnalyzer: ModelPerformanceAnalyzer,
        @inject(ModelBenchmarkManager) private readonly benchmarkManager: ModelBenchmarkManager
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Optimization');
    }

    public async optimizeModel(modelId: string, currentMetrics: OptimizationMetrics): Promise<OptimizationResult> {
        if (this.activeOptimizations.has(modelId)) {
            throw new Error('Optimization already in progress');
        }

        try {
            this.activeOptimizations.add(modelId);
            this.emit('optimizationStarted', { modelId, metrics: currentMetrics });

            const strategy = await this.determineOptimizationStrategy(modelId, currentMetrics);
            const result = await this.applyOptimization(modelId, strategy, currentMetrics);

            this.trackOptimizationResult(modelId, result);
            return result;

        } catch (error) {
            this.handleError('Failed to optimize model', error as Error);
            throw error;
        } finally {
            this.activeOptimizations.delete(modelId);
        }
    }

    private async determineOptimizationStrategy(
        modelId: string,
        metrics: OptimizationMetrics
    ): Promise<OptimizationStrategy> {
        const strategies = await this.generateOptimizationStrategies(metrics);
        return this.selectBestStrategy(strategies, metrics);
    }

    private async generateOptimizationStrategies(metrics: OptimizationMetrics): Promise<OptimizationStrategy[]> {
        const strategies: OptimizationStrategy[] = [];

        // Memory optimization strategy
        if (metrics.memoryUsage > 85) {
            strategies.push({
                name: 'Memory Optimization',
                description: 'Reduce memory usage through batch size and context length adjustments',
                priority: metrics.memoryUsage > 90 ? 1 : 2,
                parameters: {
                    batchSize: this.calculateOptimalBatchSize(metrics),
                    memoryLimit: this.calculateOptimalMemoryLimit(metrics),
                    maxContextLength: this.calculateOptimalContextLength(metrics)
                }
            });
        }

        // Throughput optimization strategy
        if (metrics.throughput < this.getTargetThroughput()) {
            strategies.push({
                name: 'Throughput Optimization',
                description: 'Improve processing speed through parallel processing and caching',
                priority: 2,
                parameters: {
                    threads: this.calculateOptimalThreads(metrics),
                    batchSize: this.calculateOptimalBatchSize(metrics) * 1.2
                }
            });
        }

        // GPU utilization strategy
        if (metrics.gpuUsage !== undefined && metrics.gpuUsage < 60) {
            strategies.push({
                name: 'GPU Optimization',
                description: 'Improve GPU utilization for better performance',
                priority: 3,
                parameters: {
                    gpuMemoryLimit: this.calculateOptimalGpuMemory(metrics),
                    batchSize: this.calculateOptimalBatchSize(metrics) * 1.5
                }
            });
        }

        return strategies;
    }

    private selectBestStrategy(strategies: OptimizationStrategy[], metrics: OptimizationMetrics): OptimizationStrategy {
        return strategies.sort((a, b) => {
            // Sort by priority first
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            
            // Then by expected impact
            return this.calculateExpectedImpact(b, metrics) - this.calculateExpectedImpact(a, metrics);
        })[0];
    }

    private calculateExpectedImpact(strategy: OptimizationStrategy, metrics: OptimizationMetrics): number {
        let impact = 0;

        if (strategy.parameters.batchSize) {
            impact += 0.3 * (1 - metrics.throughput / this.getTargetThroughput());
        }
        if (strategy.parameters.threads) {
            impact += 0.3 * (1 - metrics.cpuUsage / 100);
        }
        if (strategy.parameters.memoryLimit) {
            impact += 0.4 * (metrics.memoryUsage / 100);
        }

        return impact;
    }

    private async applyOptimization(
        modelId: string,
        strategy: OptimizationStrategy,
        currentMetrics: OptimizationMetrics
    ): Promise<OptimizationResult> {
        this.logOptimizationStrategy(strategy);

        // Apply the optimization parameters
        await this.benchmarkManager.configureModel(modelId, strategy.parameters);
        
        // Measure the impact
        const newMetrics = await this.gatherMetrics(modelId);
        const improvements = this.calculateImprovements(currentMetrics, newMetrics);
        
        return {
            modelId,
            timestamp: Date.now(),
            strategy,
            metrics: newMetrics,
            improvements,
            confidence: this.calculateConfidence(improvements)
        };
    }

    private getTargetThroughput(): number {
        return 100; // tokens/second - would be configurable in practice
    }

    private calculateOptimalBatchSize(metrics: OptimizationMetrics): number {
        const baseBatch = Math.ceil(1000 / metrics.latency);
        return Math.min(Math.max(baseBatch, 1), 32);
    }

    private calculateOptimalMemoryLimit(metrics: OptimizationMetrics): number {
        return Math.floor(metrics.memoryUsage * 0.8); // 80% of current usage
    }

    private calculateOptimalContextLength(metrics: OptimizationMetrics): number {
        const baseContext = 2048;
        const memoryFactor = 1 - (metrics.memoryUsage / 100);
        return Math.floor(baseContext * memoryFactor);
    }

    private calculateOptimalThreads(metrics: OptimizationMetrics): number {
        const baseThreads = Math.ceil(metrics.cpuUsage / 25);
        return Math.min(Math.max(baseThreads, 1), 8);
    }

    private calculateOptimalGpuMemory(metrics: OptimizationMetrics): number {
        if (!metrics.gpuUsage) {return 0;}
        return Math.floor(metrics.gpuUsage * 0.9); // 90% of available GPU memory
    }

    private async gatherMetrics(modelId: string): Promise<OptimizationMetrics> {
        const performance = await this.performanceAnalyzer.analyzeModel(modelId);
        const metrics = await this.metricsManager.getMetrics(modelId);

        return {
            latency: performance.averageLatency,
            throughput: performance.tokensPerSecond,
            memoryUsage: metrics.memoryUsage,
            cpuUsage: metrics.cpuUsage,
            gpuUsage: metrics.gpuUsage,
            errorRate: metrics.errorRate,
            timestamp: Date.now()
        };
    }

    private calculateImprovements(before: OptimizationMetrics, after: OptimizationMetrics): OptimizationResult['improvements'] {
        return {
            latency: ((before.latency - after.latency) / before.latency) * 100,
            throughput: ((after.throughput - before.throughput) / before.throughput) * 100,
            memoryUsage: ((before.memoryUsage - after.memoryUsage) / before.memoryUsage) * 100,
            errorRate: ((before.errorRate - after.errorRate) / before.errorRate) * 100
        };
    }

    private calculateConfidence(improvements: OptimizationResult['improvements']): number {
        const weights = {
            latency: 0.3,
            throughput: 0.3,
            memoryUsage: 0.2,
            errorRate: 0.2
        };

        let confidence = 0;
        let totalWeight = 0;

        for (const [metric, value] of Object.entries(improvements)) {
            if (value !== undefined) {
                confidence += (value * weights[metric as keyof typeof weights]);
                totalWeight += weights[metric as keyof typeof weights];
            }
        }

        return Math.max(0, Math.min(1, confidence / (totalWeight * 100)));
    }

    private trackOptimizationResult(modelId: string, result: OptimizationResult): void {
        const history = this.optimizationHistory.get(modelId) || [];
        history.push(result);
        this.optimizationHistory.set(modelId, history);

        this.logOptimizationResult(result);
        this.emit('optimizationCompleted', result);
    }

    private logOptimizationStrategy(strategy: OptimizationStrategy): void {
        this.outputChannel.appendLine('\nApplying Optimization Strategy:');
        this.outputChannel.appendLine(`Name: ${strategy.name}`);
        this.outputChannel.appendLine(`Description: ${strategy.description}`);
        this.outputChannel.appendLine(`Priority: ${strategy.priority}`);
        this.outputChannel.appendLine('Parameters:');
        Object.entries(strategy.parameters).forEach(([key, value]) => {
            this.outputChannel.appendLine(`  ${key}: ${value}`);
        });
    }

    private logOptimizationResult(result: OptimizationResult): void {
        this.outputChannel.appendLine('\nOptimization Result:');
        this.outputChannel.appendLine(`Model: ${result.modelId}`);
        this.outputChannel.appendLine(`Strategy: ${result.strategy.name}`);
        this.outputChannel.appendLine('\nImprovements:');
        Object.entries(result.improvements).forEach(([metric, value]) => {
            if (value !== undefined) {
                this.outputChannel.appendLine(`${metric}: ${value.toFixed(2)}%`);
            }
        });
        this.outputChannel.appendLine(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelOptimizationService]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public getOptimizationHistory(modelId: string): OptimizationResult[] {
        return this.optimizationHistory.get(modelId) || [];
    }

    public clearOptimizationHistory(modelId?: string): void {
        if (modelId) {
            this.optimizationHistory.delete(modelId);
        } else {
            this.optimizationHistory.clear();
        }
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.optimizationHistory.clear();
        this.activeOptimizations.clear();
    }
}
