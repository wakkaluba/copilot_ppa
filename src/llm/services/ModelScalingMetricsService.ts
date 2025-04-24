import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../utils/logger';
import { ModelMetricsService } from './ModelMetricsService';
import { ModelHealthMonitorV2 } from './ModelHealthMonitorV2';

export interface ScalingMetrics {
    timestamp: number;
    performance: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        requestRate: number;
    };
    resources: {
        cpu: number;
        memory: number;
        gpu?: number;
        networkIO: number;
    };
    scaling: {
        currentNodes: number;
        activeConnections: number;
        queueLength: number;
        requestBacklog: number;
    };
    availability: {
        uptime: number;
        successRate: number;
        failureRate: number;
        degradedPeriods: number;
    };
}

export interface MetricsThresholds {
    performance: {
        maxResponseTime: number;
        minThroughput: number;
        maxErrorRate: number;
        maxRequestRate: number;
    };
    resources: {
        maxCPU: number;
        maxMemory: number;
        maxGPU?: number;
        maxNetworkIO: number;
    };
    scaling: {
        maxQueueLength: number;
        maxBacklog: number;
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
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsService) private readonly baseMetrics: ModelMetricsService,
        @inject(ModelHealthMonitorV2) private readonly healthMonitor: ModelHealthMonitorV2
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

    public async collectMetrics(modelId: string): Promise<ScalingMetrics> {
        try {
            const baseMetrics = await this.baseMetrics.getLatestMetrics();
            const health = this.healthMonitor.getHealth(modelId);

            if (!baseMetrics?.get(modelId) || !health) {
                throw new Error(`Unable to collect metrics for model ${modelId}`);
            }

            const metrics = this.calculateScalingMetrics(modelId, baseMetrics.get(modelId)!, health);
            await this.storeMetrics(modelId, metrics);
            await this.checkThresholds(modelId, metrics);

            return metrics;
        } catch (error) {
            this.handleError(`Failed to collect metrics for model ${modelId}`, error);
            throw error;
        }
    }

    private calculateScalingMetrics(modelId: string, baseMetrics: any, health: any): ScalingMetrics {
        return {
            timestamp: Date.now(),
            performance: {
                responseTime: baseMetrics.averageResponseTime,
                throughput: baseMetrics.throughput,
                errorRate: health.metrics.errorRate,
                requestRate: baseMetrics.requestRate
            },
            resources: {
                cpu: baseMetrics.cpu,
                memory: baseMetrics.memory,
                gpu: baseMetrics.gpu,
                networkIO: baseMetrics.networkIO
            },
            scaling: {
                currentNodes: baseMetrics.nodes || 1,
                activeConnections: baseMetrics.activeConnections,
                queueLength: baseMetrics.queueLength,
                requestBacklog: baseMetrics.backlog
            },
            availability: {
                uptime: health.uptime,
                successRate: 1 - health.metrics.errorRate,
                failureRate: health.metrics.errorRate,
                degradedPeriods: health.metrics.degradedPeriods || 0
            }
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

    public getMetricsHistory(modelId: string, duration?: number): ScalingMetrics[] {
        const history = this.metricsHistory.get(modelId) || [];
        if (!duration) {
            return history;
        }

        const cutoff = Date.now() - duration;
        return history.filter(m => m.timestamp >= cutoff);
    }

    public setThresholds(modelId: string, thresholds: MetricsThresholds): void {
        this.thresholds.set(modelId, thresholds);
        this.emit('thresholdsUpdated', {
            modelId,
            thresholds
        });
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
