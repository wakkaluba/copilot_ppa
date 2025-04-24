import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../utils/logger';
import { ModelHealthMonitor } from './ModelHealthMonitor';
import { ModelMetricsService } from './ModelMetricsService';

export interface PerformanceMetrics {
    responseTime: number;
    throughput: number;
    errorRate: number;
    resourceUtilization: {
        cpu: number;
        memory: number;
        gpu?: number;
    };
    requestCount: number;
    successRate: number;
}

@injectable()
export class ModelPerformanceTracker extends EventEmitter {
    private readonly metricsHistory = new Map<string, PerformanceMetrics[]>();
    private readonly trackingInterval: NodeJS.Timer;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelHealthMonitor) private readonly healthMonitor: ModelHealthMonitor,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService
    ) {
        super();
        this.trackingInterval = setInterval(() => this.trackPerformance(), 30000);
    }

    private async trackPerformance(): Promise<void> {
        try {
            const metrics = await this.metricsService.getLatestMetrics();
            const health = await this.healthMonitor.getSystemHealth();

            for (const [modelId, modelMetrics] of metrics) {
                const performanceMetrics = this.calculatePerformanceMetrics(modelMetrics, health);
                this.updateMetricsHistory(modelId, performanceMetrics);
                this.emit('performanceUpdate', { modelId, metrics: performanceMetrics });
            }
        } catch (error) {
            this.handleError('Error tracking performance', error);
        }
    }

    private calculatePerformanceMetrics(modelMetrics: any, healthStatus: any): PerformanceMetrics {
        return {
            responseTime: this.calculateAverageResponseTime(modelMetrics),
            throughput: this.calculateThroughput(modelMetrics),
            errorRate: this.calculateErrorRate(modelMetrics),
            resourceUtilization: this.calculateResourceUtilization(healthStatus),
            requestCount: modelMetrics.requestCount || 0,
            successRate: this.calculateSuccessRate(modelMetrics)
        };
    }

    public getPerformanceHistory(modelId: string, timeRange?: number): PerformanceMetrics[] {
        const history = this.metricsHistory.get(modelId) || [];
        if (!timeRange) return history;

        const cutoff = Date.now() - timeRange;
        return history.filter(metrics => metrics.timestamp > cutoff);
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }

    public dispose(): void {
        clearInterval(this.trackingInterval);
        this.removeAllListeners();
        this.metricsHistory.clear();
    }
}
