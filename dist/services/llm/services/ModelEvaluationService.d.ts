import { ILogger } from '../../../utils/logger';
import { ModelBenchmarkManager } from './ModelBenchmarkManager';
import { ModelMetricsService } from './ModelMetricsService';
import { EvaluationRequest, EvaluationResult } from '../types';
import { EventEmitter } from 'events';
export declare class ModelEvaluationService extends EventEmitter {
    private readonly logger;
    private readonly benchmarkManager;
    private readonly metricsService;
    private readonly evaluationHistory;
    private readonly activeEvaluations;
    constructor(logger: ILogger, benchmarkManager: ModelBenchmarkManager, metricsService: ModelMetricsService);
    evaluateModel(modelId: string, request: EvaluationRequest): Promise<EvaluationResult>;
    getEvaluationHistory(modelId: string): EvaluationResult[];
    private analyzeResults;
    private calculatePerformanceScore;
    private calculateReliabilityScore;
    private calculateEfficiencyScore;
    private calculateStabilityScore;
    private normalizeScore;
    private extractRelevantMetrics;
    private extractBenchmarkMetrics;
    private generateRecommendations;
    private handleError;
    dispose(): void;
}
