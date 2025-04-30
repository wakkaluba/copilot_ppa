import { EventEmitter } from 'events';
import { ILogger } from '../../utils/logger';
export interface ScalingMetrics {
    timestamp: number;
    performance: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        requestRate?: number;
    };
    resources: {
        cpu: number;
        memory: number;
        gpu?: number;
        networkIO?: number;
    };
    scaling: {
        currentNodes: number;
        activeConnections: number;
        queueLength: number;
        requestBacklog?: number;
    };
    availability: {
        uptime: number;
        successRate: number;
        failureRate?: number;
        degradedPeriods: number;
    };
}
export interface MetricsThresholds {
    performance: {
        maxResponseTime: number;
        minThroughput: number;
        maxErrorRate: number;
        maxRequestRate?: number;
    };
    resources: {
        maxCPU: number;
        maxMemory: number;
        maxGPU?: number;
        maxNetworkIO?: number;
    };
    scaling: {
        maxQueueLength: number;
        maxBacklog?: number;
        minAvailableNodes: number;
    };
}
export declare class ModelScalingMetricsService extends EventEmitter {
    private readonly logger;
    private readonly metricsHistory;
    private readonly thresholds;
    private readonly retentionPeriod;
    private readonly aggregationInterval;
    private readonly cleanupTimer;
    constructor(logger: ILogger);
    private initializeDefaultThresholds;
    updateMetrics(modelId: string, metrics: ScalingMetrics): Promise<void>;
    getMetricsHistory(modelId: string, duration?: number): ScalingMetrics[];
    analyzePerformanceTrend(modelId: string): Promise<{
        degrading: boolean;
        recommendations: string[];
    }>;
    private storeMetrics;
    private checkThresholds;
    private cleanupOldMetrics;
    setThresholds(modelId: string, thresholds: MetricsThresholds): void;
    private handleError;
    dispose(): void;
}
