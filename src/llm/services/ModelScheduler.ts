import * as vscode from 'vscode';

export interface IScheduledTask {
    id: string;
    modelId: string;
    priority: 'high' | 'normal' | 'low';
    timestamp: number;
    timeoutMs?: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    payload: unknown;
}
export type ScheduledTask = IScheduledTask;

export interface ITaskMetrics {
    totalTasks: number;
}
export type TaskMetrics = ITaskMetrics;

export class ModelScheduler implements vscode.Disposable {
    private readonly taskQueue = new Map<string, ScheduledTask[]>();
    private readonly activeTasks = new Map<string, ScheduledTask>();
    private readonly maxConcurrentTasks = 3;
    private readonly taskHistory: ScheduledTask[] = [];
    private readonly metrics: TaskMetrics = {
        totalTasks: 0
    };
    private processingInterval: NodeJS.Timer | null = null;

    private logger: any;
    private systemManager: any;

    constructor(
        logger: any,
        systemManager: any,
        private readonly _processingIntervalMs = 1000
    ) {
        this.logger = logger;
        this.systemManager = systemManager;
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
            timestamp: Date.now(),
            timeoutMs,
            status: 'pending',
            payload
        };

        if (!this.taskQueue.has(priority)) {
            this.taskQueue.set(priority, []);
        }

        this.taskQueue.get(priority)?.push(task);
        this.metrics.totalTasks++;

        console.info('ModelScheduler', `Scheduled task ${task.id} for model ${modelId} with priority ${priority}`);
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
        // ...stub implementation...
    }

    private startProcessing() {
        if (!this.processingInterval) {
            this.processingInterval = setInterval(() => this.processTasks(), this._processingIntervalMs);
        }
    }

    private handleError(message: string, error: Error) {
        console.error(message, error);
    }

    dispose() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval as any);
            this.processingInterval = null;
        }
        this.taskQueue.clear();
        this.activeTasks.clear();
        this.taskHistory.length = 0;
    }
}
