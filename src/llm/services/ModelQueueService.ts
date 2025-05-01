import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../../utils/logger';
import { IQueuedModelRequest, IQueueStats, ModelQueueEvents, QueuePriority } from '../types';
import { IModelMetricsService } from './ModelMetricsService';
import { IModelResourceOptimizer } from './ModelResourceOptimizer';

export interface IQueueOptions {
    maxSize?: number;
    timeoutMs?: number;
    retryAttempts?: number;
    priorityLevels?: number;
}

export interface IQueueEntry extends IQueuedModelRequest {
    timestamp: number;
    attempts: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

@injectable()
export class ModelQueueService extends EventEmitter {
    private readonly queue: IQueueEntry[] = [];
    private readonly inProgress = new Set<string>();
    private processing = false;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(IModelResourceOptimizer) private readonly resourceOptimizer: IModelResourceOptimizer,
        @inject(IModelMetricsService) private readonly metricsService: IModelMetricsService,
        private readonly options: IQueueOptions = {}
    ) {
        super();
        this.options = {
            maxSize: 1000,
            timeoutMs: 30000,
            retryAttempts: 3,
            priorityLevels: 3,
            ...options
        };
    }

    public async enqueue(request: IQueuedModelRequest): Promise<void> {
        try {
            if (this.queue.length >= this.options.maxSize!) {
                throw new Error('Queue is full');
            }

            const entry: IQueueEntry = {
                ...request,
                timestamp: Date.now(),
                attempts: 0,
                status: 'pending'
            };

            this.insertWithPriority(entry);
            this.emit(ModelQueueEvents.RequestQueued, { requestId: request.id });

            if (!this.processing) {
                this.processQueue();
            }
        } catch (error) {
            this.handleError(`Failed to enqueue request ${request.id}`, error as Error);
            throw error;
        }
    }

    private insertWithPriority(entry: IQueueEntry): void {
        const insertIndex = this.queue.findIndex(item => item.priority < entry.priority);
        if (insertIndex === -1) {
            this.queue.push(entry);
        } else {
            this.queue.splice(insertIndex, 0, entry);
        }
    }

    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        try {
            while (this.queue.length > 0) {
                const entry = this.queue[0];

                if (await this.resourceOptimizer.canProcessRequest(entry)) {
                    this.queue.shift();
                    await this.processEntry(entry);
                } else {
                    // Wait for resources to become available
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            this.handleError('Error processing queue', error as Error);
        } finally {
            this.processing = false;
        }
    }

    private async processEntry(entry: IQueueEntry): Promise<void> {
        this.inProgress.add(entry.id);
        entry.status = 'processing';

        try {
            const startTime = Date.now();
            await this.executeRequest(entry);

            // Record metrics
            const endTime = Date.now();
            await this.metricsService.recordMetrics(entry.modelId, {
                inferenceTime: endTime - startTime,
                timestamp: endTime,
                tokensPerSecond: 0, // Would be calculated based on actual output
                memoryUsage: 0,     // Would be obtained from actual process
                cpuUsage: 0         // Would be obtained from actual process
            });

            entry.status = 'completed';
            this.emit(ModelQueueEvents.RequestCompleted, { requestId: entry.id });
        } catch (error) {
            entry.attempts++;

            if (entry.attempts < this.options.retryAttempts!) {
                entry.status = 'pending';
                this.insertWithPriority(entry);
                this.emit(ModelQueueEvents.RequestRetrying, {
                    requestId: entry.id,
                    attempt: entry.attempts
                });
            } else {
                entry.status = 'failed';
                this.emit(ModelQueueEvents.RequestFailed, {
                    requestId: entry.id,
                    error: error as Error
                });
            }
        } finally {
            this.inProgress.delete(entry.id);
        }
    }

    private async executeRequest(entry: IQueueEntry): Promise<void> {
        // This would integrate with the actual model execution logic
        throw new Error('Method not implemented');
    }

    public getQueueStats(): IQueueStats {
        return {
            queueLength: this.queue.length,
            inProgressCount: this.inProgress.size,
            byPriority: this.getQueueCountByPriority(),
            byStatus: this.getQueueCountByStatus()
        };
    }

    private getQueueCountByPriority(): Record<QueuePriority, number> {
        const counts = {} as Record<QueuePriority, number>;
        for (const entry of this.queue) {
            counts[entry.priority] = (counts[entry.priority] || 0) + 1;
        }
        return counts;
    }

    private getQueueCountByStatus(): Record<IQueueEntry['status'], number> {
        const counts = {} as Record<IQueueEntry['status'], number>;
        for (const entry of this.queue) {
            counts[entry.status] = (counts[entry.status] || 0) + 1;
        }
        return counts;
    }

    public clearQueue(): void {
        this.queue.length = 0;
        this.emit(ModelQueueEvents.QueueCleared);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelQueueService]', message, error);
        this.emit('error', error);
    }
}
