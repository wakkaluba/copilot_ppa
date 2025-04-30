import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
import { ModelResourceMonitorV2 } from './ModelResourceMonitorV2';
import { ModelMetricsManager } from './ModelMetricsManager';
interface PerformanceMetrics {
    timestamp: number;
    responseTime: number;
    tokensPerSecond: number;
    requestsPerMinute: number;
    errorRate: number;
    resourceUtilization: {
        cpu: number;
        memory: number;
        gpu?: number;
    };
}
export declare class ModelPerformanceAnalyzer extends EventEmitter {
    private readonly logger;
    private readonly resourceMonitor;
    private readonly metricsManager;
    private readonly metricsHistory;
    private readonly analysisIntervals;
    private readonly outputChannel;
    constructor(logger: ILogger, resourceMonitor: ModelResourceMonitorV2, metricsManager: ModelMetricsManager);
    startAnalysis(modelId: string): Promise<void>;
    stopAnalysis(modelId: string): void;
    private initializeAnalysis;
    private analyze;
    private gatherPerformanceMetrics;
    private analyzePerformanceTrends;
    getPerformanceHistory(modelId: string): PerformanceMetrics[];
    getLatestPerformance(modelId: string): PerformanceMetrics | undefined;
    private logMetrics;
    private handleError;
    dispose(): void;
}
export {};
