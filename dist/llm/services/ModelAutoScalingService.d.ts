import * as vscode from 'vscode';
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
export declare class ModelAutoScalingService extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly healthMonitor;
    private readonly metricsService;
    private readonly scaleCheckInterval;
    private readonly scalingHistory;
    constructor(logger: ILogger, healthMonitor: ModelHealthMonitor, metricsService: ModelMetricsService);
    enableAutoScaling(modelId: string, config: AutoScalingConfig): Promise<void>;
    private checkScaling;
    private executeScaling;
    private handleError;
    dispose(): void;
}
