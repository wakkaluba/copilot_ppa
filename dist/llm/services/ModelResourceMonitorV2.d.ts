import * as vscode from 'vscode';
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
export declare class ModelResourceMonitorV2 extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly hardwareManager;
    private readonly systemManager;
    private readonly config;
    private readonly metricsHistory;
    private readonly monitoringIntervals;
    private readonly outputChannel;
    constructor(logger: ILogger, hardwareManager: ModelHardwareManager, systemManager: ModelSystemManager, config?: ResourceMonitorConfig);
    startMonitoring(modelId: string): Promise<void>;
    stopMonitoring(modelId: string): void;
    private initializeMetrics;
    private collectMetrics;
    private gatherResourceMetrics;
    private checkThresholds;
    getMetricsHistory(modelId: string): ResourceMetrics[];
    getLatestMetrics(modelId: string): ResourceMetrics | undefined;
    private logMetrics;
    private handleError;
    dispose(): void;
}
export {};
