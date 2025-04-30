import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { ModelRequest, RequestPriority } from '../types';
import { ModelMetricsManager } from './ModelMetricsManager';
export declare class ModelSchedulerManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly metricsManager;
    private readonly outputChannel;
    private readonly requestQueues;
    private readonly activeRequests;
    private readonly maxConcurrentRequests;
    private isProcessing;
    constructor(logger: ILogger, metricsManager: ModelMetricsManager);
    scheduleRequest(request: ModelRequest, priority?: RequestPriority): Promise<string>;
    cancelRequest(requestId: string): boolean;
    private processQueues;
    private processRequest;
    private getNextRequest;
    private hasQueuedRequests;
    private initializeQueues;
    getQueueStatus(): Record<RequestPriority, number>;
    getActiveRequestCount(): number;
    private logRequestQueued;
    private handleError;
    dispose(): void;
}
