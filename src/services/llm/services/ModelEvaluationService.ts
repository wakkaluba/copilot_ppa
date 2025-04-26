import { injectable, inject } from 'inversify';
import { ILogger } from '../../../utils/logger';
import { ModelBenchmarkManager } from './ModelBenchmarkManager';
import { ModelMetricsService } from './ModelMetricsService';
import { ModelEvents, EvaluationRequest, EvaluationResult, ModelMetrics } from '../types';
import { EventEmitter } from 'events';

@injectable()
export class ModelEvaluationService extends EventEmitter {
    private readonly evaluationHistory = new Map<string, EvaluationResult[]>();
    private readonly activeEvaluations = new Set<string>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelBenchmarkManager) private readonly benchmarkManager: ModelBenchmarkManager,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService
    ) {
        super();
    }

    public async evaluateModel(modelId: string, request: EvaluationRequest): Promise<EvaluationResult> {
        if (this.activeEvaluations.has(modelId)) {
            throw new Error(`Evaluation already in progress for model ${modelId}`);
        }

        try {
            this.activeEvaluations.add(modelId);
            this.emit(ModelEvents.EvaluationStarted, { modelId, request });

            const benchmarkResult = await this.benchmarkManager.runBenchmark(modelId);
            const metrics = await this.metricsService.getMetrics(modelId);

            if (!metrics || !benchmarkResult) {
                throw new Error(`Unable to collect required data for model ${modelId}`);
            }

            const result = this.analyzeResults(modelId, benchmarkResult, metrics);
            
            // Store evaluation history
            const history = this.evaluationHistory.get(modelId) || [];
            history.push(result);
            this.evaluationHistory.set(modelId, history);

            this.emit(ModelEvents.EvaluationCompleted, { modelId, result });
            return result;

        } catch (error) {
            this.handleError('Evaluation failed', error);
            throw error;
        } finally {
            this.activeEvaluations.delete(modelId);
        }
    }

    public getEvaluationHistory(modelId: string): EvaluationResult[] {
        return this.evaluationHistory.get(modelId) || [];
    }

    private analyzeResults(
        modelId: string, 
        benchmarkResult: any, 
        metrics: ModelMetrics
    ): EvaluationResult {
        const performanceScore = this.calculatePerformanceScore(benchmarkResult);
        const reliabilityScore = this.calculateReliabilityScore(metrics);
        const efficiencyScore = this.calculateEfficiencyScore(benchmarkResult, metrics);

        const overallScore = (performanceScore + reliabilityScore + efficiencyScore) / 3;

        return {
            modelId,
            timestamp: new Date(),
            scores: {
                performance: performanceScore,
                reliability: reliabilityScore,
                efficiency: efficiencyScore,
                overall: overallScore
            },
            metrics: {
                ...this.extractRelevantMetrics(metrics),
                ...this.extractBenchmarkMetrics(benchmarkResult)
            },
            recommendations: this.generateRecommendations(
                performanceScore,
                reliabilityScore,
                efficiencyScore
            )
        };
    }

    private calculatePerformanceScore(benchmarkResult: any): number {
        // Calculate normalized performance score from benchmark results
        const latencyScore = this.normalizeScore(benchmarkResult.latency, 0, 2000);
        const throughputScore = this.normalizeScore(benchmarkResult.throughput, 0, 100);
        return (latencyScore + throughputScore) / 2;
    }

    private calculateReliabilityScore(metrics: ModelMetrics): number {
        // Calculate reliability score based on error rates and stability
        const errorRateScore = 1 - this.normalizeScore(metrics.errorRate, 0, 0.1);
        const stabilityScore = this.calculateStabilityScore(metrics);
        return (errorRateScore + stabilityScore) / 2;
    }

    private calculateEfficiencyScore(benchmarkResult: any, metrics: ModelMetrics): number {
        // Calculate efficiency score based on resource usage and throughput
        const resourceScore = this.normalizeScore(benchmarkResult.resourceUsage, 0, 100);
        const costScore = this.normalizeScore(metrics.costPerRequest || 0, 0, 0.1);
        return (resourceScore + costScore) / 2;
    }

    private calculateStabilityScore(metrics: ModelMetrics): number {
        if (!metrics.responseTimeHistory || metrics.responseTimeHistory.length < 2) {
            return 1;
        }

        // Calculate variance in response times
        const mean = metrics.responseTimeHistory.reduce((a, b) => a + b, 0) / metrics.responseTimeHistory.length;
        const variance = metrics.responseTimeHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / metrics.responseTimeHistory.length;
        
        // Convert variance to a 0-1 score where lower variance is better
        return 1 - this.normalizeScore(Math.sqrt(variance), 0, mean);
    }

    private normalizeScore(value: number, min: number, max: number): number {
        const normalized = (value - min) / (max - min);
        return Math.max(0, Math.min(1, normalized));
    }

    private extractRelevantMetrics(metrics: ModelMetrics): Record<string, number> {
        return {
            averageResponseTime: metrics.averageResponseTime,
            errorRate: metrics.errorRate,
            requestThroughput: metrics.requestsPerSecond || 0,
            tokenThroughput: metrics.tokensPerSecond || 0
        };
    }

    private extractBenchmarkMetrics(benchmarkResult: any): Record<string, number> {
        return {
            benchmarkLatency: benchmarkResult.latency,
            benchmarkThroughput: benchmarkResult.throughput,
            resourceUtilization: benchmarkResult.resourceUsage,
            memoryUsage: benchmarkResult.memoryUsage
        };
    }

    private generateRecommendations(
        performanceScore: number,
        reliabilityScore: number,
        efficiencyScore: number
    ): string[] {
        const recommendations: string[] = [];

        if (performanceScore < 0.6) {
            recommendations.push(
                'Consider optimizing model parameters for better performance',
                'Evaluate hardware requirements and potential upgrades'
            );
        }

        if (reliabilityScore < 0.7) {
            recommendations.push(
                'Implement retry mechanism for failed requests',
                'Monitor and adjust concurrent request limits'
            );
        }

        if (efficiencyScore < 0.6) {
            recommendations.push(
                'Review resource allocation and scaling policies',
                'Consider implementing request batching'
            );
        }

        return recommendations;
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
    }

    public dispose(): void {
        this.removeAllListeners();
        this.evaluationHistory.clear();
        this.activeEvaluations.clear();
    }
}
