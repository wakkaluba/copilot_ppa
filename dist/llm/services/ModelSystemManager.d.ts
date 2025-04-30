import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../services/logging/ILogger';
import { SystemMetrics, ProcessInfo } from '../types';
export declare class ModelSystemManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly monitoringIntervalMs;
    private readonly outputChannel;
    private monitoringInterval;
    private readonly metricsHistory;
    private readonly maxHistoryLength;
    private readonly processMap;
    constructor(logger: ILogger, monitoringIntervalMs?: number);
    getSystemMetrics(): Promise<SystemMetrics>;
    registerProcess(pid: number, info?: Partial<ProcessInfo>): Promise<void>;
    unregisterProcess(pid: number): Promise<void>;
    private getResourceUsage;
    private getProcessMetrics;
    private getProcessInfo;
    private startMonitoring;
    private stopMonitoring;
    private updateMetricsHistory;
    getMetricsHistory(): SystemMetrics[];
    private handleError;
    dispose(): void;
}
