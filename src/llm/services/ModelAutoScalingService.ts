import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../utils/logger';
import { ModelHealthMonitor } from './ModelHealthMonitor';
import { ModelMetricsService } from './ModelMetricsService';

export interface AutoScalingConfig {
    minInstances: number;
    maxInstances: number;
    targetCpuUtilization: number;
    targetMemoryUtilization: number;
    cooldownPeriod: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
}

@injectable()
export class ModelAutoScalingService extends EventEmitter implements vscode.Disposable {
    private readonly scaleCheckInterval: NodeJS.Timer;
    private readonly scalingHistory = new Map<string, ScalingEvent[]>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelHealthMonitor) private readonly healthMonitor: ModelHealthMonitor,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService
    ) {
        super();
        this.scaleCheckInterval = setInterval(() => this.checkScaling(), 60000);
    }

    public async enableAutoScaling(modelId: string, config: AutoScalingConfig): Promise<void> {
        try {
            await this.validateConfig(config);
            await this.applyScalingConfig(modelId, config);
            this.emit('autoScalingEnabled', { modelId, config });
        } catch (error) {
            this.handleError('Failed to enable auto-scaling', error);
            throw error;
        }
    }

    private async checkScaling(): Promise<void> {
        try {
            const metrics = await this.metricsService.getLatestMetrics();
            const healthStatus = await this.healthMonitor.getSystemHealth();

            for (const [modelId, modelMetrics] of metrics) {
                const scalingDecision = this.calculateScalingDecision(modelMetrics, healthStatus);
                if (scalingDecision.shouldScale) {
                    await this.executeScaling(modelId, scalingDecision);
                }
            }
        } catch (error) {
            this.handleError('Error during scaling check', error);
        }
    }

    private async executeScaling(modelId: string, decision: ScalingDecision): Promise<void> {
        try {
            const scalingEvent = {
                timestamp: new Date(),
                type: decision.scaleUp ? 'scaleUp' : 'scaleDown',
                reason: decision.reason,
                metrics: decision.metrics
            };

            await this.performScaling(modelId, decision);
            this.recordScalingEvent(modelId, scalingEvent);
            this.emit('scaled', { modelId, event: scalingEvent });
        } catch (error) {
            this.handleError(`Failed to execute scaling for model ${modelId}`, error);
        }
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }

    public dispose(): void {
        clearInterval(this.scaleCheckInterval);
        this.removeAllListeners();
        this.scalingHistory.clear();
    }
}
