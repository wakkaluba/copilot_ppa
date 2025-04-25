import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { EventEmitter } from 'events';
import { ModelPerformanceMetrics } from './ModelMetricsService';

export interface OptimizationResult {
    success: boolean;
    modelId: string;
    metrics: {
        latency: number;
        throughput: number;
        errorRate: number;
        costEfficiency: number;
    };
    recommendations: {
        batchSize?: number;
        maxTokens?: number;
        temperature?: number;
        topP?: number;
        quantization?: string;
        pruning?: number;
    };
    configChange?: Record<string, any>;
    error?: string;
}

/**
 * Service for optimizing model performance and resource usage
 */
@injectable()
export class ModelOptimizer extends EventEmitter {
    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.logger.info('ModelOptimizer initialized');
    }
    
    /**
     * Optimize a model based on current metrics
     */
    public async optimizeModel(modelId: string, currentMetrics: ModelPerformanceMetrics): Promise<OptimizationResult> {
        try {
            this.logger.info(`Starting optimization for model ${modelId}`);
            
            // Validate input
            if (!modelId) {
                throw new Error('Model ID is required');
            }
            
            if (!currentMetrics) {
                throw new Error('Current metrics are required for optimization');
            }
            
            // Analyze metrics and generate optimization recommendations
            const result = this.analyzeMetrics(modelId, currentMetrics);
            
            if (result.success) {
                this.emit('optimization.success', { 
                    modelId, 
                    recommendations: result.recommendations 
                });
                
                this.logger.info(`Model ${modelId} optimization successful`, result);
            } else {
                this.emit('optimization.failure', { 
                    modelId, 
                    error: result.error 
                });
                
                this.logger.warn(`Model ${modelId} optimization failed: ${result.error}`);
            }
            
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            this.logger.error(`Error optimizing model ${modelId}`, error);
            this.emit('optimization.error', { modelId, error });
            
            return {
                success: false,
                modelId,
                metrics: {
                    latency: 0,
                    throughput: 0,
                    errorRate: 0,
                    costEfficiency: 0
                },
                recommendations: {},
                error: errorMessage
            };
        }
    }
    
    /**
     * Analyze metrics and generate optimization recommendations
     */
    private analyzeMetrics(modelId: string, metrics: ModelPerformanceMetrics): OptimizationResult {
        try {
            // Extract metrics
            const responseTime = metrics.averageResponseTime || 0;
            const throughput = metrics.requestRate || 0;
            const errorRate = metrics.errorRate || 0;
            
            // Default result
            const result: OptimizationResult = {
                success: true,
                modelId,
                metrics: {
                    latency: responseTime,
                    throughput,
                    errorRate,
                    costEfficiency: this.calculateCostEfficiency(responseTime, throughput, errorRate)
                },
                recommendations: {}
            };
            
            // High latency optimization
            if (responseTime > 500) {
                result.recommendations.batchSize = Math.max(1, Math.floor((responseTime / 500) * 4));
                result.recommendations.maxTokens = 1024;
                result.recommendations.quantization = 'int8';
            } 
            // Low latency, can potentially improve quality
            else if (responseTime < 100) {
                result.recommendations.temperature = 0.7;
                result.recommendations.topP = 0.9;
            }
            
            // Error rate optimization
            if (errorRate > 0.05) {
                result.recommendations.temperature = 0.3;
                result.recommendations.maxTokens = 2048;
            }
            
            // Throughput optimization
            if (throughput > 100) {
                result.recommendations.batchSize = 8;
                result.recommendations.quantization = 'int8';
                result.recommendations.pruning = 0.3;
            }
            
            return result;
        } catch (error) {
            this.logger.error(`Error analyzing metrics for model ${modelId}`, error);
            
            return {
                success: false,
                modelId,
                metrics: {
                    latency: 0,
                    throughput: 0,
                    errorRate: 0,
                    costEfficiency: 0
                },
                recommendations: {},
                error: error instanceof Error ? error.message : 'Unknown error during metrics analysis'
            };
        }
    }
    
    /**
     * Calculate cost efficiency score
     */
    private calculateCostEfficiency(latency: number, throughput: number, errorRate: number): number {
        // Simple cost efficiency formula: throughput / (latency * (1 + errorRate))
        // Higher is better, normalized to 0-100 scale
        if (latency <= 0 || throughput <= 0) {
            return 0;
        }
        
        const rawScore = throughput / (latency * (1 + errorRate));
        return Math.min(100, Math.max(0, rawScore * 100));
    }
    
    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.removeAllListeners();
        this.logger.info('ModelOptimizer disposed');
    }
}
