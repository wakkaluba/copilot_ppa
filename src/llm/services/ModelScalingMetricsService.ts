import { inject, injectable } from 'inversify';
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

@injectable()
export class ModelScalingMetricsService extends EventEmitter {
    private readonly metricsHistory = new Map<string, ScalingMetrics[]>();
    private readonly thresholds = new Map<string, MetricsThresholds>();
    private readonly retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    private readonly aggregationInterval = 60 * 1000; // 1 minute
    private readonly cleanupTimer: NodeJS.Timer;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.cleanupTimer = setInterval(() => this.cleanupOldMetrics(), this.retentionPeriod);
        this.initializeDefaultThresholds();
    }

    private initializeDefaultThresholds(): void {
        const defaultThresholds: MetricsThresholds = {
            performance: {
                maxResponseTime: 2000,
                minThroughput: 10,
                maxErrorRate: 0.05,
                maxRequestRate: 1000
            },
            resources: {
                maxCPU: 80,
                maxMemory: 85,
                maxGPU: 90,
                maxNetworkIO: 80
            },
            scaling: {
                maxQueueLength: 100,
                maxBacklog: 50,
                minAvailableNodes: 2
            }
        };

        this.thresholds.set('default', defaultThresholds);
    }

    // Add methods needed by the tests
    public async updateMetrics(modelId: string, metrics: ScalingMetrics): Promise<void> {
        try {
            await this.storeMetrics(modelId, metrics);
            await this.checkThresholds(modelId, metrics);
        } catch (error) {
            this.handleError(`Failed to update metrics for model ${modelId}`, error);
        }
    }

    public getMetricsHistory(modelId: string, duration?: number): ScalingMetrics[] {
        const history = this.metricsHistory.get(modelId) || [];
        if (!duration) {
            return history;
        }

        const cutoff = Date.now() - duration;
        return history.filter(m => m.timestamp >= cutoff);
    }
    
    public async analyzePerformanceTrend(modelId: string): Promise<{degrading: boolean, recommendations: string[]}> {
        const history = this.getMetricsHistory(modelId);
        if (history.length < 2) {
            return { degrading: false, recommendations: ['Not enough data for analysis'] };
        }
        
        // Sort by timestamp to ensure correct order
        history.sort((a, b) => a.timestamp - b.timestamp);
        
        const latest = history[history.length - 1];
        const previous = history[history.length - 2];
        
        const recommendations: string[] = [];
        let degrading = false;
        
        // Check response time trend
        if (latest.performance.responseTime > previous.performance.responseTime * 1.2) {
            degrading = true;
            recommendations.push('Response time increasing significantly');
        }
        
        // Check error rate trend
        if (latest.performance.errorRate > previous.performance.errorRate * 1.5) {
            degrading = true;
            recommendations.push('Error rate increasing significantly');
        }
        
        // Check resource utilization
        if (latest.resources.cpu > 75 || latest.resources.memory > 80) {
            recommendations.push('Consider scaling up');
            degrading = true;
        }
        
        return {
            degrading,
            recommendations
        };
    }

    private async storeMetrics(modelId: string, metrics: ScalingMetrics): Promise<void> {
        const history = this.metricsHistory.get(modelId) || [];
        history.push(metrics);
        this.metricsHistory.set(modelId, history);

        this.emit('metricsCollected', {
            modelId,
            metrics
        });
    }

    private async checkThresholds(modelId: string, metrics: ScalingMetrics): Promise<void> {
        const thresholds = this.thresholds.get(modelId) || this.thresholds.get('default')!;
        const violations: string[] = [];

        // Check performance thresholds
        if (metrics.performance.responseTime > thresholds.performance.maxResponseTime) {
            violations.push(`Response time ${metrics.performance.responseTime}ms exceeds threshold ${thresholds.performance.maxResponseTime}ms`);
        }

        if (metrics.performance.throughput < thresholds.performance.minThroughput) {
            violations.push(`Throughput ${metrics.performance.throughput} below threshold ${thresholds.performance.minThroughput}`);
        }

        // Check resource thresholds
        if (metrics.resources.cpu > thresholds.resources.maxCPU) {
            violations.push(`CPU usage ${metrics.resources.cpu}% exceeds threshold ${thresholds.resources.maxCPU}%`);
        }

        if (violations.length > 0) {
            this.emit('thresholdViolation', {
                modelId,
                violations,
                metrics
            });
        }
    }

    private cleanupOldMetrics(): void {
        const cutoff = Date.now() - this.retentionPeriod;

        for (const [modelId, history] of this.metricsHistory.entries()) {
            const filteredHistory = history.filter(m => m.timestamp >= cutoff);
            if (filteredHistory.length !== history.length) {
                this.metricsHistory.set(modelId, filteredHistory);
                this.emit('metricsCleanup', {
                    modelId,
                    removed: history.length - filteredHistory.length
                });
            }
        }
    }

    public setThresholds(modelId: string, thresholds: MetricsThresholds): void {
        this.thresholds.set(modelId, thresholds);
        this.emit('thresholdsUpdated', {
            modelId,
            thresholds
        });
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }

    public dispose(): void {
        clearInterval(this.cleanupTimer);
        this.removeAllListeners();
        this.metricsHistory.clear();
        this.thresholds.clear();
    }
}
