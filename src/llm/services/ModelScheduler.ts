import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { ILogger } from '../types';
import { ModelSystemManager } from './ModelSystemManager';
import { EventEmitter } from 'events';

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

@injectable()
export class ModelScheduler implements vscode.Disposable {
    private readonly taskQueue = new Map<string, ScheduledTask[]>();
    private readonly activeTasks = new Map<string, ScheduledTask>();
    private readonly maxConcurrentTasks = 3;
    private readonly taskHistory: ScheduledTask[] = [];
    private readonly metrics: TaskMetrics = {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageWaitTime: 0,
        averageProcessingTime: 0
    };
    private processingInterval: NodeJS.Timer | null = null;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelSystemManager) private readonly systemManager: ModelSystemManager,
        private readonly processingIntervalMs = 1000
    ) {
        this.startProcessing();
    }

    public async scheduleTask(
        modelId: string, 
        priority: 'high' | 'normal' | 'low' = 'normal',
        payload: any,
        timeoutMs?: number
    ): Promise<string> {
        const task: ScheduledTask = {
            id: crypto.randomUUID(),
            modelId,
            priority,
            timestamp: new Date(),
            timeoutMs,
            status: 'pending',
            payload
        };

        if (!this.taskQueue.has(priority)) {
            this.taskQueue.set(priority, []);
        }

        this.taskQueue.get(priority)?.push(task);
        this.metrics.totalTasks++;
        
        this.logger.info('ModelScheduler', `Scheduled task ${task.id} for model ${modelId} with priority ${priority}`);
        return task.id;
    }

    private async processTasks(): Promise<void> {
        try {
            while (this.activeTasks.size < this.maxConcurrentTasks) {
                const nextTask = this.getNextTask();
                if (!nextTask) {break;}

                await this.executeTask(nextTask);
            }
        } catch (error) {
            this.handleError('Error processing tasks', error as Error);
        }
    }

    private getNextTask(): ScheduledTask | undefined {
        // Try priorities in order: high, normal, low
        const priorities = ['high', 'normal', 'low'];
        
        for (const priority of priorities) {
            const queue = this.taskQueue.get(priority);
            if (queue?.length) {
                return queue.shift();
            }
        }
        return undefined;
    }

    private async executeTask(task: ScheduledTask): Promise<void> {
        try {
            task.status = 'running';
            this.activeTasks.set(task.id, task);

            // Set up timeout if specified
            const timeoutPromise = task.timeoutMs ? 
                new Promise((_, reject) => setTimeout(
                    () => reject(new Error(`Task ${task.id} timed out after ${task.timeoutMs}ms`)),
                    task.timeoutMs
                )) : 
                null;

            const executionPromise = this.runTask(task);

            // Execute with timeout if specified
            await Promise.race([
                executionPromise,
                timeoutPromise
            ].filter(Boolean));

            task.status = 'completed';
            this.metrics.completedTasks++;

        } catch (error) {
            task.status = 'failed';
            this.metrics.failedTasks++;
            this.handleError(`Failed to execute task ${task.id}`, error as Error);

        } finally {
            this.activeTasks.delete(task.id);
            this.taskHistory.push(task);
            this.updateMetrics(task);
        }
    }

    private async runTask(task: ScheduledTask): Promise<void> {
        // Implementation would depend on the specific task type
        // This is a placeholder for actual task execution
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    private updateMetrics(task: ScheduledTask): void {
        const waitTime = task.timestamp ? (Date.now() - task.timestamp) : 0;

        // Update average wait time
        this.metrics.averageWaitTime = (
            (this.metrics.averageWaitTime * (this.metrics.totalTasks - 1) + waitTime) / 
            this.metrics.totalTasks
        );

        // Update average processing time if task completed
        if (task.status === 'completed') {
            const processingTime = Date.now() - task.timestamp;
            this.metrics.averageProcessingTime = (
                (this.metrics.averageProcessingTime * (this.metrics.completedTasks - 1) + processingTime) /
                this.metrics.completedTasks
            );
        }
    }

    public getTaskStatus(taskId: string): ScheduledTask | undefined {
        return (
            this.activeTasks.get(taskId) ||
            this.taskHistory.find(t => t.id === taskId)
        );
    }

    public getMetrics(): TaskMetrics {
        return { ...this.metrics };
    }

    private startProcessing(): void {
        if (this.processingInterval) {
            return;
        }

        this.processingInterval = setInterval(
            () => this.processTasks(),
            this.processingIntervalMs
        );
    }

    private stopProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('ModelScheduler', message, error);
    }

    public dispose(): void {
        this.stopProcessing();
        this.taskQueue.clear();
        this.activeTasks.clear();
        this.taskHistory.length = 0;
    }
}
