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
export declare class ModelPerformanceTracker extends EventEmitter {
    private readonly logger;
    private readonly healthMonitor;
    private readonly metricsService;
    private readonly metricsHistory;
    private readonly trackingInterval;
    constructor(logger: ILogger, healthMonitor: ModelHealthMonitor, metricsService: ModelMetricsService);
    private trackPerformance;
    private calculatePerformanceMetrics;
    getPerformanceHistory(modelId: string, timeRange?: number): PerformanceMetrics[];
    private handleError;
    dispose(): void;
}
