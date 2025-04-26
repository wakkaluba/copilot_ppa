import { inject, injectable } from 'inversify';
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

@injectable()
export class ModelMetricsService extends EventEmitter {
    private metricsByModel = new Map<string, ModelPerformanceMetrics[]>();
    private latestMetrics = new Map<string, ModelPerformanceMetrics>();
    private metricsRetentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    private cleanupInterval: NodeJS.Timer;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.logger.info('ModelMetricsService initialized');
        
        // Set up periodic cleanup of old metrics
        this.cleanupInterval = setInterval(() => this.cleanupOldMetrics(), this.metricsRetentionPeriod);
    }

    /**
     * Record new metrics for a model
     */
    public async recordMetrics(metrics: ModelPerformanceMetrics): Promise<void> {
        try {
            const { modelId } = metrics;
            
            if (!modelId) {
                throw new Error('Model ID is required for metrics recording');
            }
            
            // Ensure we have a metrics array for this model
            if (!this.metricsByModel.has(modelId)) {
                this.metricsByModel.set(modelId, []);
            }
            
            // Add timestamp if not present
            if (!metrics.timestamp) {
                metrics.timestamp = Date.now();
            }
            
            // Add to metrics history
            const modelMetrics = this.metricsByModel.get(modelId)!;
            modelMetrics.push(metrics);
            
            // Update latest metrics
            this.latestMetrics.set(modelId, metrics);
            
            // Emit event
            this.emit('metrics.recorded', { modelId, metrics });
            
            this.logger.info(`Recorded metrics for model ${modelId}`, metrics);
        } catch (error) {
            this.logger.error('Error recording model metrics', error);
            throw error;
        }
    }
    
    /**
     * Get metrics history for a model
     */
    public async getMetricsHistory(modelId: string, timeRange?: number): Promise<ModelPerformanceMetrics[]> {
        try {
            const metrics = this.metricsByModel.get(modelId) || [];
            
            if (!timeRange) {
                return metrics;
            }
            
            const cutoffTime = Date.now() - timeRange;
            return metrics.filter(m => m.timestamp >= cutoffTime);
        } catch (error) {
            this.logger.error(`Error getting metrics history for model ${modelId}`, error);
            throw error;
        }
    }
    
    /**
     * Get the latest metrics for all models
     */
    public async getLatestMetrics(): Promise<Map<string, ModelPerformanceMetrics>> {
        return new Map(this.latestMetrics);
    }
    
    /**
     * Get the latest metrics for a specific model
     */
    public async getLatestMetricsForModel(modelId: string): Promise<ModelPerformanceMetrics | null> {
        return this.latestMetrics.get(modelId) || null;
    }
    
    /**
     * Calculate aggregated metrics for a model over a time period
     */
    public async getAggregateMetrics(modelId: string, timeRange: number): Promise<ModelPerformanceMetrics | null> {
        try {
            const metrics = await this.getMetricsHistory(modelId, timeRange);
            
            if (metrics.length === 0) {
                return null;
            }
            
            // Calculate aggregates
            let totalResponseTime = 0;
            let totalRequests = 0;
            let totalErrors = 0;
            let totalTokens = 0;
            let totalPromptTokens = 0;
            let totalCompletionTokens = 0;
            const responseTimes: number[] = [];
            
            for (const metric of metrics) {
                totalResponseTime += metric.averageResponseTime;
                totalRequests += metric.successfulRequests + metric.failedRequests;
                totalErrors += metric.failedRequests;
                totalTokens += metric.totalTokens;
                totalPromptTokens += metric.promptTokens;
                totalCompletionTokens += metric.completionTokens;
                
                // Store response times for percentile calculation
                responseTimes.push(metric.averageResponseTime);
            }
            
            // Sort for percentile
            responseTimes.sort((a, b) => a - b);
            
            // Calculate p95
            const p95Index = Math.floor(responseTimes.length * 0.95);
            const p95ResponseTime = responseTimes[p95Index] || 0;
            
            return {
                modelId,
                averageResponseTime: totalRequests > 0 ? totalResponseTime / metrics.length : 0,
                p95ResponseTime,
                requestRate: totalRequests / (timeRange / 1000), // Requests per second
                errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
                successfulRequests: totalRequests - totalErrors,
                failedRequests: totalErrors,
                totalTokens,
                promptTokens: totalPromptTokens,
                completionTokens: totalCompletionTokens,
                timestamp: new Date()
            };
        } catch (error) {
            this.logger.error(`Error calculating aggregate metrics for model ${modelId}`, error);
            throw error;
        }
    }
    
    /**
     * Clean up old metrics beyond retention period
     */
    private cleanupOldMetrics(): void {
        try {
            const cutoffTime = Date.now() - this.metricsRetentionPeriod;
            
            for (const [modelId, metrics] of this.metricsByModel.entries()) {
                const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);
                
                if (filteredMetrics.length !== metrics.length) {
                    this.metricsByModel.set(modelId, filteredMetrics);
                    this.logger.info(`Cleaned up old metrics for model ${modelId}`, { 
                        removed: metrics.length - filteredMetrics.length,
                        remaining: filteredMetrics.length
                    });
                }
            }
        } catch (error) {
            this.logger.error('Error during metrics cleanup', error);
        }
    }
    
    /**
     * Dispose of resources
     */
    public dispose(): void {
        clearInterval(this.cleanupInterval);
        this.removeAllListeners();
        this.metricsByModel.clear();
        this.latestMetrics.clear();
        this.logger.info('ModelMetricsService disposed');
    }
}