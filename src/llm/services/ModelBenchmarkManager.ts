import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { LLMModelInfo, BenchmarkResult, BenchmarkMetrics } from '../types';

@injectable()
export class ModelBenchmarkManager extends EventEmitter implements vscode.Disposable {
    private readonly benchmarkCache = new Map<string, BenchmarkResult>();
    private readonly outputChannel: vscode.OutputChannel;
    private isRunning = false;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Benchmarks');
    }

    public async runBenchmark(
        model: LLMModelInfo,
        options: {
            promptSizes?: number[];
            iterations?: number;
            warmupRuns?: number;
            timeoutMs?: number;
        } = {}
    ): Promise<BenchmarkResult> {
        if (this.isRunning) {
            throw new Error('Benchmark already in progress');
        }

        try {
            this.isRunning = true;
            this.emit('benchmarkStarted', model.id);

            const {
                promptSizes = [128, 512, 1024],
                iterations = 5,
                warmupRuns = 2,
                timeoutMs = 30000
            } = options;

            // Run warmup to stabilize performance
            for (let i = 0; i < warmupRuns; i++) {
                await this.runSingleIteration(model, 256);
            }

            const metrics = await this.collectBenchmarkMetrics(
                model,
                promptSizes,
                iterations,
                timeoutMs
            );

            const result: BenchmarkResult = {
                modelId: model.id,
                timestamp: new Date(),
                metrics,
                systemInfo: await this.getSystemInfo()
            };

            this.benchmarkCache.set(model.id, result);
            this.logBenchmarkResult(result);
            this.emit('benchmarkCompleted', result);

            return result;
        } catch (error) {
            this.handleError('Failed to run benchmark', error as Error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    private async collectBenchmarkMetrics(
        model: LLMModelInfo,
        promptSizes: number[],
        iterations: number,
        timeoutMs: number
    ): Promise<BenchmarkMetrics> {
        const metrics: BenchmarkMetrics = {
            averageLatency: 0,
            p95Latency: 0,
            maxRss: 0,
            tokensPerSecond: 0,
            promptSizeMetrics: new Map()
        };

        for (const size of promptSizes) {
            const latencies: number[] = [];
            const memoryUsage: number[] = [];
            const tokenRates: number[] = [];

            for (let i = 0; i < iterations; i++) {
                const iterationMetrics = await this.runSingleIteration(
                    model,
                    size,
                    timeoutMs
                );

                latencies.push(iterationMetrics.latency);
                memoryUsage.push(iterationMetrics.memoryUsage);
                tokenRates.push(iterationMetrics.tokensPerSecond);

                this.emit('iterationCompleted', {
                    modelId: model.id,
                    size,
                    iteration: i + 1,
                    metrics: iterationMetrics
                });
            }

            metrics.promptSizeMetrics.set(size, {
                avgLatency: this.calculateAverage(latencies),
                p95Latency: this.calculateP95(latencies),
                avgMemoryUsage: this.calculateAverage(memoryUsage),
                avgTokensPerSecond: this.calculateAverage(tokenRates)
            });
        }

        // Calculate aggregate metrics
        metrics.averageLatency = this.calculateOverallAverage(
            Array.from(metrics.promptSizeMetrics.values()),
            m => m.avgLatency
        );
        metrics.p95Latency = this.calculateOverallP95(
            Array.from(metrics.promptSizeMetrics.values()),
            m => m.avgLatency
        );
        metrics.maxRss = process.memoryUsage().heapUsed;
        metrics.tokensPerSecond = this.calculateOverallAverage(
            Array.from(metrics.promptSizeMetrics.values()),
            m => m.avgTokensPerSecond
        );

        return metrics;
    }

    private async runSingleIteration(
        model: LLMModelInfo,
        promptSize: number,
        timeoutMs = 30000
    ): Promise<{
        latency: number;
        memoryUsage: number;
        tokensPerSecond: number;
    }> {
        const prompt = 'A'.repeat(promptSize);
        const startTime = process.hrtime();
        const startMem = process.memoryUsage().heapUsed;

        try {
            // Run model inference with timeout
            await Promise.race([
                model.provider.generateText(prompt),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Benchmark timeout')), timeoutMs)
                )
            ]);

            const [seconds, nanoseconds] = process.hrtime(startTime);
            const latency = seconds * 1000 + nanoseconds / 1000000;
            const memoryUsage = process.memoryUsage().heapUsed - startMem;
            const tokensPerSecond = promptSize / (latency / 1000);

            return { latency, memoryUsage, tokensPerSecond };
        } catch (error) {
            this.handleError('Failed to run iteration', error as Error);
            throw error;
        }
    }

    public getLastBenchmark(modelId: string): BenchmarkResult | undefined {
        return this.benchmarkCache.get(modelId);
    }

    public clearBenchmarks(): void {
        this.benchmarkCache.clear();
        this.emit('benchmarksCleared');
    }

    private async getSystemInfo() {
        return {
            platform: process.platform,
            cpuCores: require('os').cpus().length,
            totalMemory: require('os').totalmem(),
            nodeVersion: process.version,
            timestamp: new Date()
        };
    }

    private calculateAverage(numbers: number[]): number {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    private calculateP95(numbers: number[]): number {
        const sorted = [...numbers].sort((a, b) => a - b);
        const index = Math.ceil(numbers.length * 0.95) - 1;
        return sorted[index];
    }

    private calculateOverallAverage<T>(
        items: T[],
        selector: (item: T) => number
    ): number {
        return this.calculateAverage(items.map(selector));
    }

    private calculateOverallP95<T>(
        items: T[],
        selector: (item: T) => number
    ): number {
        return this.calculateP95(items.map(selector));
    }

    private logBenchmarkResult(result: BenchmarkResult): void {
        this.outputChannel.appendLine('\nBenchmark Results:');
        this.outputChannel.appendLine(`Model: ${result.modelId}`);
        this.outputChannel.appendLine(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
        this.outputChannel.appendLine('\nAggregate Metrics:');
        this.outputChannel.appendLine(`Average Latency: ${result.metrics.averageLatency.toFixed(2)}ms`);
        this.outputChannel.appendLine(`P95 Latency: ${result.metrics.p95Latency.toFixed(2)}ms`);
        this.outputChannel.appendLine(`Max RSS: ${(result.metrics.maxRss / 1024 / 1024).toFixed(2)}MB`);
        this.outputChannel.appendLine(`Tokens/Second: ${result.metrics.tokensPerSecond.toFixed(2)}`);

        this.outputChannel.appendLine('\nDetailed Metrics by Prompt Size:');
        result.metrics.promptSizeMetrics.forEach((metrics, size) => {
            this.outputChannel.appendLine(`\nPrompt Size: ${size} chars`);
            this.outputChannel.appendLine(`  Avg Latency: ${metrics.avgLatency.toFixed(2)}ms`);
            this.outputChannel.appendLine(`  P95 Latency: ${metrics.p95Latency.toFixed(2)}ms`);
            this.outputChannel.appendLine(`  Avg Memory: ${(metrics.avgMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
            this.outputChannel.appendLine(`  Tokens/Second: ${metrics.avgTokensPerSecond.toFixed(2)}`);
        });

        this.outputChannel.appendLine('\nSystem Info:');
        this.outputChannel.appendLine(`Platform: ${result.systemInfo.platform}`);
        this.outputChannel.appendLine(`CPU Cores: ${result.systemInfo.cpuCores}`);
        this.outputChannel.appendLine(`Total Memory: ${(result.systemInfo.totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB`);
        this.outputChannel.appendLine(`Node Version: ${result.systemInfo.nodeVersion}`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelBenchmarkManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.benchmarkCache.clear();
    }
}
