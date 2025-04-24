import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
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

@injectable()
export class ModelPerformanceTestService extends EventEmitter implements vscode.Disposable {
    private readonly testResults = new Map<string, TestResult[]>();
    private readonly outputChannel: vscode.OutputChannel;
    private isRunning = false;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsManager) private readonly metricsManager: ModelMetricsManager,
        @inject(ModelPerformanceAnalyzer) private readonly performanceAnalyzer: ModelPerformanceAnalyzer,
        @inject(ModelBenchmarkManager) private readonly benchmarkManager: ModelBenchmarkManager
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Performance Tests');
    }

    public async runTestScenario(modelId: string, scenario: TestScenario): Promise<TestResult> {
        if (this.isRunning) {
            throw new Error('Test already in progress');
        }

        try {
            this.isRunning = true;
            this.emit('testStarted', { modelId, scenario });

            const result: TestResult = {
                scenarioName: scenario.name,
                metrics: {
                    averageLatency: 0,
                    p95Latency: 0,
                    successRate: 0,
                    tokensPerSecond: 0,
                    memoryUsage: 0
                },
                timestamps: [],
                errors: []
            };

            const latencies: number[] = [];
            const tokenRates: number[] = [];
            let successCount = 0;
            
            // Warm up runs
            await this.runWarmup(modelId, scenario);

            // Main test runs
            for (let i = 0; i < scenario.config.repetitions; i++) {
                for (const prompt of scenario.prompts) {
                    try {
                        const startTime = process.hrtime();
                        const startMem = process.memoryUsage().heapUsed;

                        // Run model inference with timeout
                        const response = await Promise.race([
                            this.performanceAnalyzer.analyzeModelResponse(modelId, prompt, scenario.config),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Test timeout')), scenario.config.timeoutMs)
                            )
                        ]);

                        const [seconds, nanoseconds] = process.hrtime(startTime);
                        const latency = seconds * 1000 + nanoseconds / 1000000;
                        const memoryUsed = process.memoryUsage().heapUsed - startMem;

                        latencies.push(latency);
                        tokenRates.push(response.tokens / (latency / 1000));
                        result.timestamps.push(Date.now());

                        if (this.validateResponse(response.content, scenario.expectedPatterns)) {
                            successCount++;
                        }

                        this.emit('iterationCompleted', {
                            modelId,
                            scenario: scenario.name,
                            iteration: i + 1,
                            latency,
                            memoryUsed,
                            success: true
                        });

                    } catch (error) {
                        result.errors.push(error as Error);
                        this.handleError('Test iteration failed', error as Error);
                        this.emit('iterationCompleted', {
                            modelId,
                            scenario: scenario.name,
                            iteration: i + 1,
                            success: false,
                            error
                        });
                    }
                }
            }

            // Calculate final metrics
            const totalIterations = scenario.config.repetitions * scenario.prompts.length;
            result.metrics = {
                averageLatency: this.calculateAverage(latencies),
                p95Latency: this.calculateP95(latencies),
                successRate: (successCount / totalIterations) * 100,
                tokensPerSecond: this.calculateAverage(tokenRates),
                memoryUsage: process.memoryUsage().heapUsed
            };

            // Store and log results
            this.testResults.get(modelId)?.push(result) ?? this.testResults.set(modelId, [result]);
            this.logTestResult(modelId, result);
            this.emit('testCompleted', { modelId, scenario, result });

            return result;

        } catch (error) {
            this.handleError('Test scenario failed', error as Error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    private async runWarmup(modelId: string, scenario: TestScenario): Promise<void> {
        const warmupRuns = 2;
        const warmupPrompt = scenario.prompts[0];

        for (let i = 0; i < warmupRuns; i++) {
            try {
                await this.performanceAnalyzer.analyzeModelResponse(
                    modelId,
                    warmupPrompt,
                    scenario.config
                );
            } catch (error) {
                this.logger.warn('Warmup run failed', error as Error);
            }
        }
    }

    private validateResponse(content: string, patterns?: RegExp[]): boolean {
        if (!patterns || patterns.length === 0) {
            return true;
        }
        return patterns.some(pattern => pattern.test(content));
    }

    private calculateAverage(numbers: number[]): number {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    private calculateP95(numbers: number[]): number {
        const sorted = [...numbers].sort((a, b) => a - b);
        const index = Math.ceil(numbers.length * 0.95) - 1;
        return sorted[index];
    }

    private logTestResult(modelId: string, result: TestResult): void {
        this.outputChannel.appendLine('\nTest Results:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine(`Scenario: ${result.scenarioName}`);
        this.outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
        this.outputChannel.appendLine('\nMetrics:');
        this.outputChannel.appendLine(`Average Latency: ${result.metrics.averageLatency.toFixed(2)}ms`);
        this.outputChannel.appendLine(`P95 Latency: ${result.metrics.p95Latency.toFixed(2)}ms`);
        this.outputChannel.appendLine(`Success Rate: ${result.metrics.successRate.toFixed(2)}%`);
        this.outputChannel.appendLine(`Tokens/Second: ${result.metrics.tokensPerSecond.toFixed(2)}`);
        this.outputChannel.appendLine(`Memory Usage: ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
        
        if (result.errors.length > 0) {
            this.outputChannel.appendLine('\nErrors:');
            result.errors.forEach(error => {
                this.outputChannel.appendLine(`- ${error.message}`);
            });
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error(message, error);
        this.emit('error', { message, error });
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public getTestResults(modelId: string): TestResult[] {
        return this.testResults.get(modelId) || [];
    }

    public clearTestResults(modelId?: string): void {
        if (modelId) {
            this.testResults.delete(modelId);
        } else {
            this.testResults.clear();
        }
        this.emit('resultsCleared', { modelId });
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.testResults.clear();
    }
}
