import * as vscode from 'vscode';
import { ILogger } from '../types';
import { ModelSystemManager } from './ModelSystemManager';
export interface ScheduledTask {
    id: string;
    modelId: string;
    priority: 'high' | 'normal' | 'low';
    timestamp: number;
    timeoutMs?: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    payload: any;
}
export interface TaskMetrics {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageWaitTime: number;
    averageProcessingTime: number;
}
export declare class ModelScheduler implements vscode.Disposable {
    private readonly logger;
    private readonly systemManager;
    private readonly processingIntervalMs;
    private readonly taskQueue;
    private readonly activeTasks;
    private readonly maxConcurrentTasks;
    private readonly taskHistory;
    private readonly metrics;
    private processingInterval;
    constructor(logger: ILogger, systemManager: ModelSystemManager, processingIntervalMs?: number);
    scheduleTask(modelId: string, priority: "high" | "normal" | "low" | undefined, payload: any, timeoutMs?: number): Promise<string>;
    private processTasks;
    private getNextTask;
    private executeTask;
    private runTask;
    private updateMetrics;
    getTaskStatus(taskId: string): ScheduledTask | undefined;
    getMetrics(): TaskMetrics;
    private startProcessing;
    private stopProcessing;
    private handleError;
    dispose(): void;
}
