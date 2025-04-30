import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { HostProcessInfo } from '../interfaces/HostTypes';
import { LLMHostConfig } from '../../../types/llm';
export declare class LLMHostProcessService extends EventEmitter {
    private outputChannel;
    private process;
    private processInfo;
    private metricsInterval;
    constructor(outputChannel: vscode.OutputChannel);
    startProcess(config: LLMHostConfig): Promise<HostProcessInfo>;
    private setupProcessHandlers;
    private startMetricsTracking;
    private waitForStartup;
    stopProcess(): Promise<void>;
    getProcessInfo(): HostProcessInfo | null;
    hasProcess(): boolean;
    dispose(): void;
    private handleOutput;
    private handleError;
    private handleProcessError;
    private handleProcessExit;
    private updateProcessMetrics;
}
