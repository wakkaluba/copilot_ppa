import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { HostProcessInfo } from '../interfaces/HostTypes';
export declare class LLMHostHealthMonitor extends EventEmitter {
    private outputChannel;
    private monitoredProcesses;
    private healthChecks;
    private readonly checkInterval;
    constructor(outputChannel: vscode.OutputChannel);
    startMonitoring(processInfo: HostProcessInfo): void;
    stopMonitoring(pid: number): void;
    private checkHealth;
    private collectMetrics;
    dispose(): void;
}
