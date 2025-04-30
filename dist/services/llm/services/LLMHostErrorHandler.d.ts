import * as vscode from 'vscode';
import { HostProcessInfo } from '../interfaces/HostTypes';
export interface IHealthMetrics {
    cpuUsage?: number;
    memoryUsage?: number;
    responseTime?: number;
    uptime?: number;
    openConnections?: number;
    [key: string]: unknown;
}
export type ErrorContext = Record<string, unknown>;
export declare class LLMHostErrorHandler {
    private outputChannel;
    constructor(outputChannel: vscode.OutputChannel);
    handleProcessError(error: Error, info: HostProcessInfo): void;
    handleStartError(error: Error): void;
    handleStopError(error: Error): void;
    handleRestartError(error: Error): void;
    handleHealthWarning(message: string, metrics: IHealthMetrics): void;
    handleHealthCritical(error: Error, metrics: IHealthMetrics): void;
    private logError;
    private showErrorNotification;
}
