import { ILogger } from '../../utils/logger';
import { EventEmitter } from 'events';
export interface ModelPerformanceMetrics {
    modelId: string;
    averageResponseTime: number;
    p95ResponseTime: number;
    requestRate: number;
    errorRate: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    timestamp: number;
}
export declare class ModelMetricsService extends EventEmitter {
    private readonly logger;
    private metricsByModel;
    private latestMetrics;
    private metricsRetentionPeriod;
    private cleanupInterval;
    constructor(logger: ILogger);
    /**
     * Record new metrics for a model
     */
    recordMetrics(metrics: ModelPerformanceMetrics): Promise<void>;
    /**
     * Get metrics history for a model
     */
    getMetricsHistory(modelId: string, timeRange?: number): Promise<ModelPerformanceMetrics[]>;
    /**
     * Get the latest metrics for all models
     */
    getLatestMetrics(): Promise<Map<string, ModelPerformanceMetrics>>;
    /**
     * Get the latest metrics for a specific model
     */
    getLatestMetricsForModel(modelId: string): Promise<ModelPerformanceMetrics | null>;
    /**
     * Calculate aggregated metrics for a model over a time period
     */
    getAggregateMetrics(modelId: string, timeRange: number): Promise<ModelPerformanceMetrics | null>;
    /**
     * Clean up old metrics beyond retention period
     */
    private cleanupOldMetrics;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
