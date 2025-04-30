import { EventEmitter } from 'events';
import { ILogger } from '../../../utils/logger';
import { ModelMetrics } from '../types';
import { IStorageService } from '../../storage/IStorageService';
export declare class ModelMetricsService extends EventEmitter {
    private readonly logger;
    private readonly storage;
    private readonly metrics;
    private readonly retentionPeriod;
    private readonly aggregationInterval;
    private aggregationTimer;
    constructor(logger: ILogger, storage: IStorageService);
    /**
     * Record metrics for a model
     */
    recordMetrics(modelId: string, metrics: Partial<ModelMetrics>): Promise<void>;
    /**
     * Get current metrics for a model
     */
    getMetrics(modelId: string): ModelMetrics | undefined;
    /**
     * Get aggregated metrics for all models
     */
    getAggregatedMetrics(): Map<string, ModelMetrics>;
    private createDefaultMetrics;
    private persistMetrics;
    private startAggregation;
    private aggregateMetrics;
    private handleError;
    dispose(): void;
}
