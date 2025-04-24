import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { Logger } from '../../utils/logger';
import { IModelMetrics, MetricEvent, PerformanceMetrics, UsageMetrics } from '../types';

export class ModelMetricsService implements vscode.Disposable {
    private readonly _metricsEmitter = new EventEmitter();
    private readonly _metrics = new Map<string, IModelMetrics>();
    private readonly _logger: Logger;
    private _collectionInterval: NodeJS.Timer | null = null;

    constructor(private readonly collectionIntervalMs: number = 5000) {
        this._logger = Logger.for('ModelMetricsService');
        this.startMetricsCollection();
    }

    public async trackPerformance(modelId: string, metrics: PerformanceMetrics): Promise<void> {
        try {
            const currentMetrics = this._metrics.get(modelId) || this.createDefaultMetrics();
            currentMetrics.performance = {
                ...currentMetrics.performance,
                ...metrics,
                lastUpdated: new Date()
            };
            
            this._metrics.set(modelId, currentMetrics);
            this._metricsEmitter.emit('performanceUpdate', { modelId, metrics });
        } catch (error) {
            this._logger.error('Failed to track performance metrics', { modelId, error });
            throw error;
        }
    }

    public async trackUsage(modelId: string, metrics: UsageMetrics): Promise<void> {
        try {
            const currentMetrics = this._metrics.get(modelId) || this.createDefaultMetrics();
            currentMetrics.usage = {
                ...currentMetrics.usage,
                ...metrics,
                lastUpdated: new Date()
            };
            
            this._metrics.set(modelId, currentMetrics);
            this._metricsEmitter.emit('usageUpdate', { modelId, metrics });
        } catch (error) {
            this._logger.error('Failed to track usage metrics', { modelId, error });
            throw error;
        }
    }

    public onMetricsUpdated(listener: (event: MetricEvent) => void): vscode.Disposable {
        this._metricsEmitter.on('metricsUpdated', listener);
        return {
            dispose: () => this._metricsEmitter.removeListener('metricsUpdated', listener)
        };
    }

    private createDefaultMetrics(): IModelMetrics {
        return {
            performance: {
                responseTime: 0,
                throughput: 0,
                errorRate: 0,
                lastUpdated: new Date()
            },
            usage: {
                totalRequests: 0,
                totalTokens: 0,
                activeConnections: 0,
                lastUpdated: new Date()
            }
        };
    }

    private startMetricsCollection(): void {
        if (this._collectionInterval) {return;}

        this._collectionInterval = setInterval(
            () => this.collectMetrics(),
            this.collectionIntervalMs
        );
    }

    private async collectMetrics(): Promise<void> {
        try {
            const timestamp = new Date();
            for (const [modelId, metrics] of this._metrics.entries()) {
                this._metricsEmitter.emit('metricsCollected', {
                    modelId,
                    metrics,
                    timestamp
                });
            }
        } catch (error) {
            this._logger.error('Failed to collect metrics', { error });
        }
    }

    public dispose(): void {
        if (this._collectionInterval) {
            clearInterval(this._collectionInterval);
            this._collectionInterval = null;
        }
        this._metricsEmitter.removeAllListeners();
        this._metrics.clear();
    }
}