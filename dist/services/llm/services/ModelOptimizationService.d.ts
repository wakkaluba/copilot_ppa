import { ILogger } from '../../../utils/logger';
import { ModelMetricsService } from './ModelMetricsService';
import { OptimizationRequest, OptimizationResult } from '../types';
import { EventEmitter } from 'events';
export declare class ModelOptimizationService extends EventEmitter {
    private readonly logger;
    private readonly metricsService;
    private readonly optimizationHistory;
    private readonly activeOptimizations;
    constructor(logger: ILogger, metricsService: ModelMetricsService);
    /**
     * Start an optimization run for a model
     */
    optimizeModel(modelId: string, request: OptimizationRequest): Promise<OptimizationResult>;
    /**
     * Get optimization history for a model
     */
    getOptimizationHistory(modelId: string): OptimizationResult[];
    /**
     * Calculate optimal resource allocation
     */
    private calculateResourceAllocation;
    private calculateOptimalMemory;
    private calculateOptimalThreads;
    private calculateOptimalBatchSize;
    private calculatePriority;
    private runOptimization;
    private calculateImprovements;
    private estimateLatencyImprovement;
    private estimateThroughputImprovement;
    private estimateMemoryEfficiency;
    private calculateConfidence;
    private handleError;
    dispose(): void;
}
