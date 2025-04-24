import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { ILogger } from '../../common/logging';
import { ModelResourceMonitorV2 } from './ModelResourceMonitorV2';
import { ModelMetricsManager } from './ModelMetricsManager';

interface PerformanceMetrics {
    timestamp: number;
    responseTime: number;
    tokensPerSecond: number;
    requestsPerMinute: number;
    errorRate: number;
    resourceUtilization: {
        cpu: number;
        memory: number;
        gpu?: number;
    };
}

@injectable()
export class ModelPerformanceAnalyzer extends EventEmitter {
    private readonly metricsHistory = new Map<string, PerformanceMetrics[]>();
    private readonly analysisIntervals = new Map<string, NodeJS.Timer>();
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelResourceMonitorV2) private readonly resourceMonitor: ModelResourceMonitorV2,
        @inject(ModelMetricsManager) private readonly metricsManager: ModelMetricsManager
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Performance Analyzer');
    }

    public async startAnalysis(modelId: string): Promise<void> {
        try {
            if (this.analysisIntervals.has(modelId)) {
                return;
            }

            await this.initializeAnalysis(modelId);
            const interval = setInterval(() => this.analyze(modelId), 60000); // Analyze every minute
            this.analysisIntervals.set(modelId, interval);

            this.emit('analysisStarted', { modelId });
            this.logger.info(`Started performance analysis for model ${modelId}`);

        } catch (error) {
            this.handleError(`Failed to start analysis for model ${modelId}`, error as Error);
            throw error;
        }
    }

    public stopAnalysis(modelId: string): void {
        try {
            const interval = this.analysisIntervals.get(modelId);
            if (interval) {
                clearInterval(interval);
                this.analysisIntervals.delete(modelId);
                this.emit('analysisStopped', { modelId });
                this.logger.info(`Stopped performance analysis for model ${modelId}`);
            }
        } catch (error) {
            this.handleError(`Failed to stop analysis for model ${modelId}`, error as Error);
        }
    }

    private async initializeAnalysis(modelId: string): Promise<void> {
        const initialMetrics = await this.gatherPerformanceMetrics(modelId);
        this.metricsHistory.set(modelId, [initialMetrics]);
    }

    private async analyze(modelId: string): Promise<void> {
        try {
            const metrics = await this.gatherPerformanceMetrics(modelId);
            const history = this.metricsHistory.get(modelId) || [];
            history.push(metrics);

            // Keep last 24 hours of metrics (1440 samples at 1-minute interval)
            while (history.length > 1440) {
                history.shift();
            }

            this.metricsHistory.set(modelId, history);
            await this.analyzePerformanceTrends(modelId, history);
            this.emit('metricsUpdated', { modelId, metrics });
            this.logMetrics(modelId, metrics);

        } catch (error) {
            this.handleError(`Failed to analyze performance for model ${modelId}`, error as Error);
        }
    }

    private async gatherPerformanceMetrics(modelId: string): Promise<PerformanceMetrics> {
        const resourceMetrics = await this.resourceMonitor.getLatestMetrics(modelId);
        const modelMetrics = await this.metricsManager.getMetrics(modelId);

        return {
            timestamp: Date.now(),
            responseTime: modelMetrics.averageResponseTime,
            tokensPerSecond: modelMetrics.tokensPerSecond,
            requestsPerMinute: modelMetrics.requestsPerMinute,
            errorRate: modelMetrics.errorRate,
            resourceUtilization: {
                cpu: resourceMetrics?.cpu.usage || 0,
                memory: resourceMetrics?.memory.percent || 0,
                ...(resourceMetrics?.gpu ? { gpu: resourceMetrics.gpu.usage } : {})
            }
        };
    }

    private async analyzePerformanceTrends(modelId: string, history: PerformanceMetrics[]): Promise<void> {
        if (history.length < 2) return;

        const current = history[history.length - 1];
        const previous = history[history.length - 2];

        // Analyze response time trend
        const responseTimeDelta = ((current.responseTime - previous.responseTime) / previous.responseTime) * 100;
        if (responseTimeDelta > 10) {
            this.emit('performanceWarning', {
                modelId,
                metric: 'responseTime',
                message: `Response time increased by ${responseTimeDelta.toFixed(1)}%`
            });
        }

        // Analyze throughput trend
        const throughputDelta = ((current.tokensPerSecond - previous.tokensPerSecond) / previous.tokensPerSecond) * 100;
        if (throughputDelta < -10) {
            this.emit('performanceWarning', {
                modelId,
                metric: 'throughput',
                message: `Throughput decreased by ${Math.abs(throughputDelta).toFixed(1)}%`
            });
        }

        // Analyze error rate trend
        if (current.errorRate > previous.errorRate && current.errorRate > 0.05) {
            this.emit('performanceWarning', {
                modelId,
                metric: 'errorRate',
                message: `Error rate increased to ${(current.errorRate * 100).toFixed(1)}%`
            });
        }
    }

    public getPerformanceHistory(modelId: string): PerformanceMetrics[] {
        return [...(this.metricsHistory.get(modelId) || [])];
    }

    public getLatestPerformance(modelId: string): PerformanceMetrics | undefined {
        const history = this.metricsHistory.get(modelId);
        return history?.[history.length - 1];
    }

    private logMetrics(modelId: string, metrics: PerformanceMetrics): void {
        this.outputChannel.appendLine('\nPerformance Metrics:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine(`Timestamp: ${new Date(metrics.timestamp).toISOString()}`);
        this.outputChannel.appendLine(`Response Time: ${metrics.responseTime.toFixed(2)}ms`);
        this.outputChannel.appendLine(`Tokens/s: ${metrics.tokensPerSecond.toFixed(1)}`);
        this.outputChannel.appendLine(`Requests/min: ${metrics.requestsPerMinute.toFixed(1)}`);
        this.outputChannel.appendLine(`Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
        this.outputChannel.appendLine('Resource Utilization:');
        this.outputChannel.appendLine(`  CPU: ${metrics.resourceUtilization.cpu.toFixed(1)}%`);
        this.outputChannel.appendLine(`  Memory: ${metrics.resourceUtilization.memory.toFixed(1)}%`);
        if (metrics.resourceUtilization.gpu !== undefined) {
            this.outputChannel.appendLine(`  GPU: ${metrics.resourceUtilization.gpu.toFixed(1)}%`);
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelPerformanceAnalyzer]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        for (const timer of this.analysisIntervals.values()) {
            clearInterval(timer);
        }
        this.analysisIntervals.clear();
        this.metricsHistory.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}
