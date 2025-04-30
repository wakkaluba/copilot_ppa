import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
import { ModelSystemManager } from './ModelSystemManager';
import { ModelStateManager } from './ModelStateManager';
export declare class ModelHostManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly systemManager;
    private readonly stateManager;
    private readonly hostedProcesses;
    private readonly outputChannel;
    private readonly monitorInterval;
    private readonly maxRestartAttempts;
    private readonly restartDelayMs;
    constructor(logger: ILogger, systemManager: ModelSystemManager, stateManager: ModelStateManager);
    startProcess(modelId: string, config: any): Promise<number>;
    stopProcess(modelId: string): Promise<void>;
    private monitorProcesses;
    private handleCrashedProcess;
    private logProcessUpdate;
    private handleError;
    dispose(): void;
}
