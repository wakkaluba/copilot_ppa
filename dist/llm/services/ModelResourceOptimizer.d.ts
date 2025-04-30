import { EventEmitter } from 'events';
import { ILogger } from '../../utils/logger';
import { ModelMetricsService } from './ModelMetricsService';
import { ModelHealthMonitor } from './ModelHealthMonitor';
export interface OptimizationResult {
    modelId: string;
    timestamp: number;
    recommendations: ResourceRecommendation[];
    metrics: ResourceMetrics;
    confidence: number;
}
export interface ResourceRecommendation {
    type: 'cpu' | 'memory' | 'gpu' | 'batch' | 'thread';
    currentValue: number;
    recommendedValue: number;
    impact: number;
    reason: string;
}
export interface ResourceMetrics {
    cpuUtilization: number;
    memoryUtilization: number;
    gpuUtilization?: number;
    latency: number;
    throughput: number;
    errorRate: number;
}
export declare class ModelResourceOptimizer extends EventEmitter {
    private readonly logger;
    private readonly metricsService;
    private readonly healthMonitor;
    constructor(logger: ILogger, metricsService: ModelMetricsService, healthMonitor: ModelHealthMonitor);
    optimizeResources(modelId: string): Promise<OptimizationResult>;
    private gatherMetrics;
    private generateRecommendations;
    private estimateCurrentBatchSize;
    private calculateOptimalBatchSize;
    private calculateConfidence;
    private handleError;
}
