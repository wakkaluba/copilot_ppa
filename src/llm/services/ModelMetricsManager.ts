import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { Logger } from '../../utils/logger';
import { ModelPerformanceMetrics } from '../types';

interface MetricsSnapshot {
    timestamp: number;
    metrics: ModelPerformanceMetrics;
}

export class ModelMetricsManager extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly metricsHistory = new Map<string, MetricsSnapshot[]>();
    private readonly retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    private readonly samplingInterval = 60 * 1000; // 1 minute
    private cleanupInterval: NodeJS.Timeout | null = null;
    private readonly logger = new Logger();

    constructor() {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Metrics');
        this.startPeriodicCleanup();
    }

    public async trackMetrics(modelId: string, metrics: ModelPerformanceMetrics): Promise<void> {
        try {
            this.addMetricsSnapshot(modelId, metrics);
            this.analyzePerformanceTrends(modelId);
            this.emitMetricsUpdate(modelId, metrics);
            this.logMetricsUpdate(modelId, metrics);
        } catch (error) {
            this.handleError('Failed to track metrics', error as Error);
        }
    }

    public getMetricsHistory(modelId: string): MetricsSnapshot[] {
        return this.metricsHistory.get(modelId) || [];
    }

    private getLatestSnapshot(history: MetricsSnapshot[]): MetricsSnapshot | undefined {
        return history.length > 0 ? history[history.length - 1] : undefined;
    }

    public getLatestMetrics(modelId: string): ModelPerformanceMetrics | undefined {
        const history = this.getMetricsHistory(modelId);
        return this.getLatestSnapshot(history)?.metrics;
    }

    public getAggregateMetrics(modelId: string): ModelPerformanceMetrics | undefined {
        const history = this.getMetricsHistory(modelId);
        const latest = this.getLatestSnapshot(history);
        if (!latest) {return undefined;}

        return {
            averageResponseTime: this.calculateAverageResponseTime(history),
            tokenThroughput: this.calculateAverageThroughput(history),
            errorRate: this.calculateAverageErrorRate(history),
            totalRequests: this.calculateTotalRequests(history),
            totalTokens: this.calculateTotalTokens(history),
            lastUsed: new Date(latest.timestamp)
        };
    }

    private addMetricsSnapshot(modelId: string, metrics: ModelPerformanceMetrics): void {
        const history = this.metricsHistory.get(modelId) || [];
        history.push({
            timestamp: new Date(),
            metrics: { ...metrics }
        });
        this.metricsHistory.set(modelId, history);
    }

    private analyzePerformanceTrends(modelId: string): void {
        const history = this.getMetricsHistory(modelId);
        if (history.length < 2) {return;}

        const recentSnapshots = history.slice(-10); // Analyze last 10 snapshots
        
        // Analyze response time trend
        const responseTimeTrend = this.calculateTrend(
            recentSnapshots.map(s => s.metrics.averageResponseTime)
        );

        // Analyze throughput trend
        const throughputTrend = this.calculateTrend(
            recentSnapshots.map(s => s.metrics.tokenThroughput)
        );

        // Analyze error rate trend
        const errorRateTrend = this.calculateTrend(
            recentSnapshots.map(s => s.metrics.errorRate)
        );

        this.emit('performanceTrend', {
            modelId,
            responseTimeTrend,
            throughputTrend,
            errorRateTrend
        });

        this.logPerformanceTrends(modelId, {
            responseTimeTrend,
            throughputTrend,
            errorRateTrend
        });
    }

    private calculateTrend(values: number[]): number {
        if (values.length < 2) {return 0;}

        const n = values.length;
        const sumX = values.reduce((sum, _, i) => sum + i, 0);
        const sumY = values.reduce((sum, value) => sum + value, 0);
        const sumXY = values.reduce((sum, value, i) => sum + i * value, 0);
        const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);

        // Calculate slope of linear regression
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    private calculateAverageResponseTime(history: MetricsSnapshot[]): number {
        return this.calculateAverage(history.map(s => s.metrics.averageResponseTime));
    }

    private calculateAverageThroughput(history: MetricsSnapshot[]): number {
        return this.calculateAverage(history.map(s => s.metrics.tokenThroughput));
    }

    private calculateAverageErrorRate(history: MetricsSnapshot[]): number {
        return this.calculateAverage(history.map(s => s.metrics.errorRate));
    }

    private calculateTotalRequests(history: MetricsSnapshot[]): number {
        return history.reduce((sum, s) => sum + s.metrics.totalRequests, 0);
    }

    private calculateTotalTokens(history: MetricsSnapshot[]): number {
        return history.reduce((sum, s) => sum + s.metrics.totalTokens, 0);
    }

    private calculateAverage(values: number[]): number {
        if (values.length === 0) {return 0;}
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    private emitMetricsUpdate(modelId: string, metrics: ModelPerformanceMetrics): void {
        this.emit('metricsUpdated', { modelId, metrics });
    }

    private startPeriodicCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.cleanupInterval = setInterval(() => {
            try {
                this.cleanupOldMetrics();
            } catch (error) {
                this.handleError('Failed to cleanup metrics', error as Error);
            }
        }, this.samplingInterval);
    }

    private cleanupOldMetrics(): void {
        const cutoffTime = Date.now() - this.retentionPeriod;

        for (const [modelId, history] of this.metricsHistory.entries()) {
            const filteredHistory = history.filter(s => s.timestamp >= cutoffTime);
            if (filteredHistory.length !== history.length) {
                this.metricsHistory.set(modelId, filteredHistory);
                this.logMetricsCleanup(modelId, history.length - filteredHistory.length);
            }
        }
    }

    private logMetricsUpdate(modelId: string, metrics: ModelPerformanceMetrics): void {
        this.outputChannel.appendLine('\nMetrics Update:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine(`Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
        this.outputChannel.appendLine(`Throughput: ${metrics.tokenThroughput.toFixed(2)} tokens/sec`);
        this.outputChannel.appendLine(`Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
    }

    private logPerformanceTrends(modelId: string, trends: Record<string, number>): void {
        this.outputChannel.appendLine('\nPerformance Trends:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        Object.entries(trends).forEach(([metric, trend]) => {
            const direction = trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable';
            this.outputChannel.appendLine(`${metric}: ${direction} (${Math.abs(trend).toFixed(4)})`);
        });
    }

    private logMetricsCleanup(modelId: string, removedCount: number): void {
        this.outputChannel.appendLine(`\nCleaned up ${removedCount} old metrics for model ${modelId}`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error(`[ModelMetricsManager] ${message}: ${error.message}`);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.metricsHistory.clear();
    }
}
