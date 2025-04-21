import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ModelPerformanceMetrics } from '../types';

/**
 * Service for tracking model performance metrics
 */
export class ModelMetricsService implements vscode.Disposable {
    private readonly metrics = new Map<string, ModelPerformanceMetrics>();
    private readonly eventEmitter = new EventEmitter();

    /**
     * Record metrics for a model invocation
     */
    public recordMetrics(
        modelId: string,
        responseTime: number,
        tokens: number,
        error?: boolean
    ): void {
        let modelMetrics = this.metrics.get(modelId);
        if (!modelMetrics) {
            modelMetrics = {
                averageResponseTime: 0,
                tokenThroughput: 0,
                errorRate: 0,
                totalRequests: 0,
                totalTokens: 0,
                lastUsed: new Date()
            };
            this.metrics.set(modelId, modelMetrics);
        }

        // Update metrics
        modelMetrics.totalRequests++;
        modelMetrics.totalTokens += tokens;
        const oldLastUsed = modelMetrics.lastUsed;
        modelMetrics.lastUsed = new Date();

        // Update moving averages
        modelMetrics.averageResponseTime = this.calculateMovingAverage(
            modelMetrics.averageResponseTime,
            responseTime,
            modelMetrics.totalRequests
        );

        const timespan = (modelMetrics.lastUsed.getTime() - oldLastUsed.getTime()) / 1000;
        if (timespan > 0) {
            modelMetrics.tokenThroughput = tokens / timespan;
        }

        if (error) {
            modelMetrics.errorRate = this.calculateMovingAverage(
                modelMetrics.errorRate,
                1,
                modelMetrics.totalRequests
            );
        }

        this.eventEmitter.emit('metricsUpdated', modelId, modelMetrics);
    }

    /**
     * Get metrics for a specific model
     */
    public getMetrics(modelId: string): ModelPerformanceMetrics | undefined {
        return this.metrics.get(modelId);
    }

    /**
     * Get metrics for all models
     */
    public getAllMetrics(): Map<string, ModelPerformanceMetrics> {
        return new Map(this.metrics);
    }

    /**
     * Reset metrics for a model
     */
    public resetMetrics(modelId: string): void {
        this.metrics.delete(modelId);
        this.eventEmitter.emit('metricsReset', modelId);
    }

    /**
     * Clear all metrics
     */
    public clearAllMetrics(): void {
        this.metrics.clear();
        this.eventEmitter.emit('metricsCleared');
    }

    /**
     * Subscribe to metrics updates
     */
    public onMetricsUpdated(listener: (modelId: string, metrics: ModelPerformanceMetrics) => void): void {
        this.eventEmitter.on('metricsUpdated', listener);
    }

    private calculateMovingAverage(currentAvg: number, newValue: number, totalSamples: number): number {
        return ((currentAvg * (totalSamples - 1)) + newValue) / totalSamples;
    }

    public dispose(): void {
        this.eventEmitter.removeAllListeners();
    }
}