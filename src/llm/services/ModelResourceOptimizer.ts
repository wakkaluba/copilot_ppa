import { inject, injectable } from 'inversify';
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

@injectable()
export class ModelResourceOptimizer extends EventEmitter {
    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService,
        @inject(ModelHealthMonitor) private readonly healthMonitor: ModelHealthMonitor
    ) {
        super();
    }

    public async optimizeResources(modelId: string): Promise<OptimizationResult> {
        try {
            const metrics = await this.gatherMetrics(modelId);
            const recommendations = this.generateRecommendations(metrics);
            
            const result: OptimizationResult = {
                modelId,
                timestamp: Date.now(),
                recommendations,
                metrics,
                confidence: this.calculateConfidence(recommendations)
            };

            this.emit('optimizationCompleted', result);
            return result;
        } catch (error) {
            this.handleError('Resource optimization failed', error);
            throw error;
        }
    }

    private async gatherMetrics(modelId: string): Promise<ResourceMetrics> {
        const metrics = await this.metricsService.getLatestMetrics();
        const modelMetrics = metrics.get(modelId);
        
        if (!modelMetrics) {
            throw new Error(`No metrics available for model ${modelId}`);
        }

        return {
            cpuUtilization: modelMetrics.resourceUtilization.cpu,
            memoryUtilization: modelMetrics.resourceUtilization.memory,
            gpuUtilization: modelMetrics.resourceUtilization.gpu,
            latency: modelMetrics.latency,
            throughput: modelMetrics.throughput,
            errorRate: modelMetrics.errorRate
        };
    }

    private generateRecommendations(metrics: ResourceMetrics): ResourceRecommendation[] {
        const recommendations: ResourceRecommendation[] = [];

        // CPU optimization
        if (metrics.cpuUtilization > 80) {
            recommendations.push({
                type: 'cpu',
                currentValue: metrics.cpuUtilization,
                recommendedValue: metrics.cpuUtilization * 1.5,
                impact: 0.8,
                reason: 'High CPU utilization detected'
            });
        }

        // Memory optimization
        if (metrics.memoryUtilization > 85) {
            recommendations.push({
                type: 'memory',
                currentValue: metrics.memoryUtilization,
                recommendedValue: metrics.memoryUtilization * 1.3,
                impact: 0.7,
                reason: 'High memory usage detected'
            });
        }

        // GPU optimization if available
        if (metrics.gpuUtilization !== undefined && metrics.gpuUtilization < 50) {
            recommendations.push({
                type: 'gpu',
                currentValue: metrics.gpuUtilization,
                recommendedValue: Math.min(metrics.gpuUtilization * 2, 100),
                impact: 0.6,
                reason: 'Low GPU utilization detected'
            });
        }

        // Batch size optimization based on latency and throughput
        if (metrics.latency > 100 && metrics.throughput < 1000) {
            recommendations.push({
                type: 'batch',
                currentValue: this.estimateCurrentBatchSize(metrics),
                recommendedValue: this.calculateOptimalBatchSize(metrics),
                impact: 0.5,
                reason: 'Suboptimal batch size for current load'
            });
        }

        return recommendations;
    }

    private estimateCurrentBatchSize(metrics: ResourceMetrics): number {
        return Math.ceil(metrics.throughput / (1000 / metrics.latency));
    }

    private calculateOptimalBatchSize(metrics: ResourceMetrics): number {
        const baseBatch = Math.ceil(metrics.throughput / (500 / metrics.latency));
        return Math.min(Math.max(baseBatch, 1), 32);
    }

    private calculateConfidence(recommendations: ResourceRecommendation[]): number {
        if (recommendations.length === 0) return 1;

        const averageImpact = recommendations.reduce((sum, rec) => sum + rec.impact, 0) / recommendations.length;
        return Math.min(Math.max(averageImpact, 0), 1);
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }
}
