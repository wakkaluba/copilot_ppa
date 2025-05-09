import { EventEmitter } from 'events';
import { ILogger } from '../../../utils/logger';
import { ModelResourceOptimizer } from './ModelResourceOptimizer';
import { ModelMetricsService } from './ModelMetricsService';
import { ExecutionRequest, ExecutionResult, ExecutedTask } from '../types';
export declare class ModelExecutionService extends EventEmitter {
    private readonly logger;
    private readonly resourceOptimizer;
    private readonly metricsService;
    private readonly activeExecutions;
    private readonly executionHistory;
    private readonly processing;
    private readonly executionTimeout;
    private readonly maxConcurrentExecutions;
    constructor(logger: ILogger, resourceOptimizer: ModelResourceOptimizer, metricsService: ModelMetricsService);
    executeModel(modelId: string, request: ExecutionRequest): Promise<ExecutionResult>;
    getExecution(modelId: string): ExecutedTask[];
    getExecutionHistory(modelId: string): ExecutionResult[];
    private createExecution;
    private generateTasks;
    private calculateTimeSlots;
    private allocateResources;
    private optimizeExecution;
    private optimizeResources;
    private calculateScalingFactor;
    private calculateResourceAllocation;
    private calculatePerformanceMetrics;
    private calculateUtilizationScore;
    private calculatePerformanceScore;
    private calculateThroughputScore;
    private validateConstraints;
    private exceedsTimeLimit;
    private exceedsResourceLimits;
    private trackExecution;
    private monitorTask;
    private updateTaskMetrics;
    private getActiveExecutionCount;
    private addToHistory;
    private handleError;
    dispose(): void;
}
