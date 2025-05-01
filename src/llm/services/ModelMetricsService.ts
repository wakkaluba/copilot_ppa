import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';

export interface IModelMetrics {
    inferenceTime: number;
    tokensPerSecond: number;
    memoryUsage: number;
    cpuUsage: number;
    gpuUsage?: number;
    timestamp: number;
}

export interface IModelUsageStats {
    totalTokens: number;
    totalInferences: number;
    averageInferenceTime: number;
    totalErrors: number;
    lastUsed: number;
}

export interface IModelPerformanceSnapshot {
    modelId: string;
    metrics: IModelMetrics;
    usageStats: IModelUsageStats;
}

@injectable()
export class ModelMetricsService extends EventEmitter {
    private readonly metricsMap = new Map<string, IModelMetrics[]>();
    private readonly statsMap = new Map<string, IModelUsageStats>();
    private readonly maxMetricsHistory = 100;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public recordMetrics(modelId: string, metrics: IModelMetrics): void {
        try {
            const history = this.metricsMap.get(modelId) || [];
            history.push(metrics);

            // Maintain fixed size history
            while (history.length > this.maxMetricsHistory) {
                history.shift();
            }

            this.metricsMap.set(modelId, history);
            this.updateUsageStats(modelId, metrics);
            this.emit('metricsRecorded', { modelId, metrics });
        } catch (error) {
            this.handleError(error as Error);
        }
    }

    public getMetricsHistory(modelId: string): IModelMetrics[] {
        return [...(this.metricsMap.get(modelId) || [])];
    }

    public getUsageStats(modelId: string): IModelUsageStats | undefined {
        return this.statsMap.get(modelId);
    }

    public getPerformanceSnapshot(modelId: string): IModelPerformanceSnapshot | undefined {
        const metrics = this.metricsMap.get(modelId)?.at(-1);
        const stats = this.statsMap.get(modelId);

        if (!metrics || !stats) {
            return undefined;
        }

        return {
            modelId,
            metrics,
            usageStats: stats
        };
    }

    private updateUsageStats(modelId: string, metrics: IModelMetrics): void {
        const current = this.statsMap.get(modelId) || {
            totalTokens: 0,
            totalInferences: 0,
            averageInferenceTime: 0,
            totalErrors: 0,
            lastUsed: 0
        };

        const newStats = {
            ...current,
            totalInferences: current.totalInferences + 1,
            averageInferenceTime: (
                (current.averageInferenceTime * current.totalInferences + metrics.inferenceTime) /
                (current.totalInferences + 1)
            ),
            lastUsed: metrics.timestamp
        };

        this.statsMap.set(modelId, newStats);
    }

    public clearMetrics(modelId?: string): void {
        if (modelId) {
            this.metricsMap.delete(modelId);
            this.statsMap.delete(modelId);
        } else {
            this.metricsMap.clear();
            this.statsMap.clear();
        }
        this.emit('metricsCleared', modelId);
    }

    private handleError(error: Error): void {
        this.logger.error('[ModelMetricsService]', error);
        this.emit('error', error);
    }
}
