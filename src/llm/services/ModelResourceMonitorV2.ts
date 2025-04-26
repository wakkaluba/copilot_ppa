import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
import { ModelHardwareManager } from './ModelHardwareManager';
import { ModelSystemManager } from './ModelSystemManager';

interface ResourceMonitorConfig {
    checkInterval: number;
    warningThresholds: {
        cpuPercent: number;
        memoryPercent: number;
        gpuPercent: number;
    };
    criticalThresholds: {
        cpuPercent: number;
        memoryPercent: number;
        gpuPercent: number;
    };
}

interface ResourceMetrics {
    timestamp: number;
    cpu: {
        usage: number;
        temperature?: number;
    };
    memory: {
        used: number;
        total: number;
        percent: number;
    };
    gpu?: {
        usage: number;
        memory: {
            used: number;
            total: number;
        };
        temperature?: number;
    };
}

@injectable()
export class ModelResourceMonitorV2 extends EventEmitter implements vscode.Disposable {
    private readonly metricsHistory = new Map<string, ResourceMetrics[]>();
    private readonly monitoringIntervals = new Map<string, NodeJS.Timer>();
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelHardwareManager) private readonly hardwareManager: ModelHardwareManager,
        @inject(ModelSystemManager) private readonly systemManager: ModelSystemManager,
        private readonly config: ResourceMonitorConfig = {
            checkInterval: 5000,
            warningThresholds: {
                cpuPercent: 80,
                memoryPercent: 80,
                gpuPercent: 80
            },
            criticalThresholds: {
                cpuPercent: 90,
                memoryPercent: 90,
                gpuPercent: 90
            }
        }
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Resource Monitor');
    }

    public async startMonitoring(modelId: string): Promise<void> {
        try {
            if (this.monitoringIntervals.has(modelId)) {
                return;
            }

            await this.initializeMetrics(modelId);
            const interval = setInterval(
                () => this.collectMetrics(modelId), 
                this.config.checkInterval
            );
            this.monitoringIntervals.set(modelId, interval);

            this.emit('monitoringStarted', { modelId });
            this.logger.info(`Started resource monitoring for model ${modelId}`);

        } catch (error) {
            this.handleError(`Failed to start monitoring for model ${modelId}`, error as Error);
            throw error;
        }
    }

    public stopMonitoring(modelId: string): void {
        try {
            const interval = this.monitoringIntervals.get(modelId);
            if (interval) {
                clearInterval(interval);
                this.monitoringIntervals.delete(modelId);
                this.emit('monitoringStopped', { modelId });
                this.logger.info(`Stopped resource monitoring for model ${modelId}`);
            }
        } catch (error) {
            this.handleError(`Failed to stop monitoring for model ${modelId}`, error as Error);
        }
    }

    private async initializeMetrics(modelId: string): Promise<void> {
        const initialMetrics = await this.gatherResourceMetrics();
        this.metricsHistory.set(modelId, [initialMetrics]);
    }

    private async collectMetrics(modelId: string): Promise<void> {
        try {
            const metrics = await this.gatherResourceMetrics();
            const history = this.metricsHistory.get(modelId) || [];
            history.push(metrics);

            // Keep last hour of metrics (720 samples at 5s interval)
            while (history.length > 720) {
                history.shift();
            }

            this.metricsHistory.set(modelId, history);
            this.checkThresholds(modelId, metrics);
            this.emit('metricsUpdated', { modelId, metrics });
            this.logMetrics(modelId, metrics);

        } catch (error) {
            this.handleError(`Failed to collect metrics for model ${modelId}`, error as Error);
        }
    }

    private async gatherResourceMetrics(): Promise<ResourceMetrics> {
        const [systemMetrics, hardwareInfo] = await Promise.all([
            this.systemManager.getSystemMetrics(),
            this.hardwareManager.getHardwareInfo()
        ]);

        return {
            timestamp: new Date(),
            cpu: {
                usage: systemMetrics.resources.cpuUsagePercent,
                temperature: hardwareInfo.cpu?.temperature
            },
            memory: {
                used: systemMetrics.resources.totalMemoryBytes - systemMetrics.resources.freeMemoryBytes,
                total: systemMetrics.resources.totalMemoryBytes,
                percent: ((systemMetrics.resources.totalMemoryBytes - systemMetrics.resources.freeMemoryBytes) / 
                         systemMetrics.resources.totalMemoryBytes) * 100
            },
            ...(hardwareInfo.gpu ? {
                gpu: {
                    usage: hardwareInfo.gpu.utilizationPercent,
                    memory: {
                        used: hardwareInfo.gpu.memoryUsed,
                        total: hardwareInfo.gpu.memoryTotal
                    },
                    temperature: hardwareInfo.gpu.temperature
                }
            } : {})
        };
    }

    private checkThresholds(modelId: string, metrics: ResourceMetrics): void {
        // Check CPU usage
        if (metrics.cpu.usage >= this.config.criticalThresholds.cpuPercent) {
            this.emit('resourceCritical', { 
                modelId, 
                resource: 'cpu',
                value: metrics.cpu.usage 
            });
        } else if (metrics.cpu.usage >= this.config.warningThresholds.cpuPercent) {
            this.emit('resourceWarning', { 
                modelId, 
                resource: 'cpu',
                value: metrics.cpu.usage 
            });
        }

        // Check memory usage
        if (metrics.memory.percent >= this.config.criticalThresholds.memoryPercent) {
            this.emit('resourceCritical', { 
                modelId, 
                resource: 'memory',
                value: metrics.memory.percent 
            });
        } else if (metrics.memory.percent >= this.config.warningThresholds.memoryPercent) {
            this.emit('resourceWarning', { 
                modelId, 
                resource: 'memory',
                value: metrics.memory.percent 
            });
        }

        // Check GPU if available
        if (metrics.gpu) {
            if (metrics.gpu.usage >= this.config.criticalThresholds.gpuPercent) {
                this.emit('resourceCritical', { 
                    modelId, 
                    resource: 'gpu',
                    value: metrics.gpu.usage 
                });
            } else if (metrics.gpu.usage >= this.config.warningThresholds.gpuPercent) {
                this.emit('resourceWarning', { 
                    modelId, 
                    resource: 'gpu',
                    value: metrics.gpu.usage 
                });
            }
        }
    }

    public getMetricsHistory(modelId: string): ResourceMetrics[] {
        return [...(this.metricsHistory.get(modelId) || [])];
    }

    public getLatestMetrics(modelId: string): ResourceMetrics | undefined {
        const history = this.metricsHistory.get(modelId);
        return history?.[history.length - 1];
    }

    private logMetrics(modelId: string, metrics: ResourceMetrics): void {
        this.outputChannel.appendLine('\nResource Metrics:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine(`Timestamp: ${new Date(metrics.timestamp).toISOString()}`);
        this.outputChannel.appendLine(`CPU Usage: ${metrics.cpu.usage.toFixed(1)}%`);
        this.outputChannel.appendLine(`Memory Usage: ${metrics.memory.percent.toFixed(1)}%`);
        if (metrics.gpu) {
            this.outputChannel.appendLine(`GPU Usage: ${metrics.gpu.usage.toFixed(1)}%`);
            this.outputChannel.appendLine(`GPU Memory: ${metrics.gpu.memory.used}MB/${metrics.gpu.memory.total}MB`);
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelResourceMonitor]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        for (const timer of this.monitoringIntervals.values()) {
            clearInterval(timer);
        }
        this.monitoringIntervals.clear();
        this.metricsHistory.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}
