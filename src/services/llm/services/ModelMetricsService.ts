import { EventEmitter } from 'events';
import { injectable, inject } from 'inversify';
import { ILogger } from '../../../utils/logger';
import { ModelMetrics, ModelEvents } from '../types';
import { IStorageService } from '../../storage/IStorageService';

@injectable()
export class ModelMetricsService extends EventEmitter {
    private readonly metrics = new Map<string, ModelMetrics>();
    private readonly retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    private readonly aggregationInterval = 5 * 60 * 1000; // 5 minutes
    private aggregationTimer: NodeJS.Timer | null = null;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(IStorageService) private readonly storage: IStorageService
    ) {
        super();
        this.startAggregation();
    }

    /**
     * Record metrics for a model
     */
    public async recordMetrics(modelId: string, metrics: Partial<ModelMetrics>): Promise<void> {
        try {
            const current = this.metrics.get(modelId) || this.createDefaultMetrics();
            const updated = {
                ...current,
                ...metrics,
                lastUpdated: Date.now()
            };
            
            this.metrics.set(modelId, updated);
            await this.persistMetrics(modelId);
            
            this.emit(ModelEvents.MetricsUpdated, {
                modelId,
                metrics: updated
            });

        } catch (error) {
            this.handleError('Failed to record metrics', error);
            throw error;
        }
    }

    /**
     * Get current metrics for a model
     */
    public getMetrics(modelId: string): ModelMetrics | undefined {
        return this.metrics.get(modelId);
    }

    /**
     * Get aggregated metrics for all models
     */
    public getAggregatedMetrics(): Map<string, ModelMetrics> {
        return new Map(this.metrics);
    }

    private createDefaultMetrics(): ModelMetrics {
        return {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageLatency: 0,
            tokenUsage: 0,
            memoryUsage: 0,
            lastUpdated: Date.now()
        };
    }

    private async persistMetrics(modelId: string): Promise<void> {
        try {
            const metrics = this.metrics.get(modelId);
            if (metrics) {
                await this.storage.set(`metrics:${modelId}`, metrics);
            }
        } catch (error) {
            this.handleError('Failed to persist metrics', error);
        }
    }

    private startAggregation(): void {
        this.aggregationTimer = setInterval(() => {
            this.aggregateMetrics();
        }, this.aggregationInterval);
    }

    private aggregateMetrics(): void {
        try {
            const now = Date.now();
            const cutoff = now - this.retentionPeriod;

            // Clean up old metrics
            for (const [modelId, metrics] of this.metrics.entries()) {
                if (metrics.lastUpdated < cutoff) {
                    this.metrics.delete(modelId);
                    this.emit(ModelEvents.MetricsExpired, { modelId });
                }
            }

            this.emit(ModelEvents.MetricsAggregated, {
                timestamp: now,
                metrics: this.getAggregatedMetrics()
            });

        } catch (error) {
            this.handleError('Failed to aggregate metrics', error);
        }
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
    }

    public dispose(): void {
        if (this.aggregationTimer) {
            clearInterval(this.aggregationTimer);
            this.aggregationTimer = null;
        }
        this.removeAllListeners();
        this.metrics.clear();
    }
}
