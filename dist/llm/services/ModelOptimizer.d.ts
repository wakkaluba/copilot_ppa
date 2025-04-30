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
export declare class ModelOptimizer extends EventEmitter {
    private readonly logger;
    constructor(logger: ILogger);
    /**
     * Optimize a model based on current metrics
     */
    optimizeModel(modelId: string, currentMetrics: ModelPerformanceMetrics): Promise<OptimizationResult>;
    /**
     * Analyze metrics and generate optimization recommendations
     */
    private analyzeMetrics;
    /**
     * Calculate cost efficiency score
     */
    private calculateCostEfficiency;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
