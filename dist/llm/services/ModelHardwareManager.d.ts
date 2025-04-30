import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { HardwareSpecs, HardwareMetrics } from '../types';
export declare class ModelHardwareManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly monitoringIntervalMs;
    private readonly outputChannel;
    private monitoringInterval;
    private readonly metricsHistory;
    private readonly maxHistoryLength;
    constructor(logger: ILogger, monitoringIntervalMs?: number);
    getHardwareSpecs(): Promise<HardwareSpecs>;
    getHardwareMetrics(): Promise<HardwareMetrics>;
    private detectGPU;
    private detectCUDA;
    private getGPUMetrics;
    private getSystemMetrics;
    private startMonitoring;
    private stopMonitoring;
    getMetricsHistory(id?: string): HardwareMetrics[];
    private updateMetricsHistory;
    private logHardwareSpecs;
    private handleError;
    dispose(): void;
}
