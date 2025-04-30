import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
import { ModelMetricsService } from './ModelMetricsService';
import { ModelHostManager } from './ModelHostManager';
interface LoadBalancerMetrics {
    requestCount: number;
    errorCount: number;
    averageLatency: number;
    nodeUtilization: Map<string, number>;
    lastDistribution: Date;
}
interface NodeHealth {
    nodeId: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: Date;
    metrics: {
        cpu: number;
        memory: number;
        requestLoad: number;
        latency?: number;
        errorRate?: number;
    };
}
export declare class ModelLoadBalancer extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly metricsService;
    private readonly hostManager;
    private readonly metrics;
    private readonly nodeHealth;
    private readonly outputChannel;
    private readonly healthCheckInterval;
    private readonly distributionHistory;
    constructor(logger: ILogger, metricsService: ModelMetricsService, hostManager: ModelHostManager);
    private startMonitoring;
    distributeRequest(requestId: string, modelId: string): Promise<string>;
    private selectNode;
    private calculateNodeWeight;
    private selectWeightedNode;
    private updateDistributionMetrics;
    private checkNodeHealth;
    private determineNodeHealth;
    registerNode(nodeId: string): Promise<void>;
    unregisterNode(nodeId: string): Promise<void>;
    private getNodeStats;
    getLoadBalancerMetrics(): LoadBalancerMetrics;
    getNodeHealthStatus(): Map<string, NodeHealth>;
    dispose(): void;
    private logNodeEvent;
    private handleError;
}
export {};
