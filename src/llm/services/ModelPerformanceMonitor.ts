import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMRequest, ILLMResponse } from '../types';

export interface IPerformanceThresholds {
    maxLatencyMs: number;
    maxTokensPerSecond: number;
    maxMemoryUsageMB: number;
    maxErrorRate: number;
    maxConcurrentRequests: number;
}

export interface IPerformanceSnapshot {
    timestamp: number;
    latency: number;
    throughput: number;
    errorRate: number;
    memoryUsage: number;
    activeRequests: number;
}

export interface IModelMetrics {
    modelId: string;
    snapshots: IPerformanceSnapshot[];
    aggregates: {
        avgLatency: number;
        avgThroughput: number;
        avgErrorRate: number;
        avgMemoryUsage: number;
        p95Latency: number;
        p99Latency: number;
    };
}

export interface IPerformanceAlert {
    modelId: string;
    timestamp: number;
    type: 'latency' | 'throughput' | 'error_rate' | 'memory' | 'concurrent_requests';
    value: number;
    threshold: number;
    message: string;
}

@injectable()
export class ModelPerformanceMonitor extends EventEmitter {
    private readonly metrics = new Map<string, IModelMetrics>();
    private readonly alerts: IPerformanceAlert[] = [];
    private readonly thresholds: IPerformanceThresholds = {
        maxLatencyMs: 5000,
        maxTokensPerSecond: 100,
        maxMemoryUsageMB: 1024,
        maxErrorRate: 0.05,
        maxConcurrentRequests: 10
    };

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public recordMetrics(
        modelId: string,
        request: ILLMRequest,
        response: ILLMResponse,
        metrics: {
            startTime: number;
            endTime: number;
            tokenCount: number;
            memoryUsage: number;
        }
    ): void {
        try {
            const snapshot = this.createSnapshot(modelId, request, response, metrics);
            this.updateMetrics(modelId, snapshot);
            this.checkThresholds(modelId, snapshot);
        } catch (error) {
            this.handleError('Failed to record metrics', error as Error);
        }
    }

    private createSnapshot(
        modelId: string,
        request: ILLMRequest,
        response: ILLMResponse,
        metrics: {
            startTime: number;
            endTime: number;
            tokenCount: number;
            memoryUsage: number;
        }
    ): IPerformanceSnapshot {
        const latency = metrics.endTime - metrics.startTime;
        const durationSeconds = latency / 1000;

        return {
            timestamp: Date.now(),
            latency,
            throughput: metrics.tokenCount / durationSeconds,
            errorRate: 0, // Would be calculated based on error tracking
            memoryUsage: metrics.memoryUsage,
            activeRequests: this.getActiveRequestCount(modelId)
        };
    }

    private updateMetrics(modelId: string, snapshot: IPerformanceSnapshot): void {
        let modelMetrics = this.metrics.get(modelId);

        if (!modelMetrics) {
            modelMetrics = {
                modelId,
                snapshots: [],
                aggregates: {
                    avgLatency: 0,
                    avgThroughput: 0,
                    avgErrorRate: 0,
                    avgMemoryUsage: 0,
                    p95Latency: 0,
                    p99Latency: 0
                }
            };
            this.metrics.set(modelId, modelMetrics);
        }

        modelMetrics.snapshots.push(snapshot);
        this.updateAggregates(modelMetrics);
        this.pruneSnapshots(modelMetrics);
    }

    private updateAggregates(metrics: IModelMetrics): void {
        const snapshots = metrics.snapshots;
        if (snapshots.length === 0) return;

        metrics.aggregates = {
            avgLatency: this.calculateAverage(snapshots.map(s => s.latency)),
            avgThroughput: this.calculateAverage(snapshots.map(s => s.throughput)),
            avgErrorRate: this.calculateAverage(snapshots.map(s => s.errorRate)),
            avgMemoryUsage: this.calculateAverage(snapshots.map(s => s.memoryUsage)),
            p95Latency: this.calculatePercentile(snapshots.map(s => s.latency), 95),
            p99Latency: this.calculatePercentile(snapshots.map(s => s.latency), 99)
        };

        this.emit('metricsUpdated', {
            modelId: metrics.modelId,
            aggregates: metrics.aggregates
        });
    }

    private checkThresholds(modelId: string, snapshot: IPerformanceSnapshot): void {
        if (snapshot.latency > this.thresholds.maxLatencyMs) {
            this.raiseAlert(modelId, {
                type: 'latency',
                value: snapshot.latency,
                threshold: this.thresholds.maxLatencyMs,
                message: `High latency detected: ${snapshot.latency}ms`
            });
        }

        if (snapshot.activeRequests > this.thresholds.maxConcurrentRequests) {
            this.raiseAlert(modelId, {
                type: 'concurrent_requests',
                value: snapshot.activeRequests,
                threshold: this.thresholds.maxConcurrentRequests,
                message: `Too many concurrent requests: ${snapshot.activeRequests}`
            });
        }

        // Additional threshold checks would be implemented here
    }

    private raiseAlert(modelId: string, alert: Omit<IPerformanceAlert, 'modelId' | 'timestamp'>): void {
        const fullAlert: IPerformanceAlert = {
            modelId,
            timestamp: Date.now(),
            ...alert
        };

        this.alerts.push(fullAlert);
        this.emit('alertRaised', fullAlert);
    }

    public getModelMetrics(modelId: string): IModelMetrics | undefined {
        return this.metrics.get(modelId);
    }

    public getRecentAlerts(modelId?: string): IPerformanceAlert[] {
        if (modelId) {
            return this.alerts.filter(alert => alert.modelId === modelId);
        }
        return [...this.alerts];
    }

    public updateThresholds(updates: Partial<IPerformanceThresholds>): void {
        this.thresholds = { ...this.thresholds, ...updates };
        this.emit('thresholdsUpdated', this.thresholds);
    }

    private getActiveRequestCount(modelId: string): number {
        // This would integrate with request tracking
        return 0;
    }

    private calculateAverage(values: number[]): number {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    private calculatePercentile(values: number[], percentile: number): number {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[index];
    }

    private pruneSnapshots(metrics: IModelMetrics): void {
        // Keep last 24 hours of snapshots
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        metrics.snapshots = metrics.snapshots.filter(s => s.timestamp >= cutoff);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelPerformanceMonitor]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.metrics.clear();
        this.alerts.length = 0;
        this.removeAllListeners();
    }
}
