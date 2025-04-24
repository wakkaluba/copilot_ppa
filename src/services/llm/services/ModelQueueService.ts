import { injectable, inject } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../../utils/logger';
import { ModelResourceOptimizer } from './ModelResourceOptimizer';
import { ModelMetricsService } from './ModelMetricsService';
import { QueuedModelRequest, QueuePriority, QueueStats, ModelQueueEvents } from '../types';

@injectable()
export class ModelQueueService extends EventEmitter {
    private readonly queues = new Map<QueuePriority, QueuedModelRequest[]>();
    private readonly activeRequests = new Set<string>();
    private readonly maxQueueSize = 100;
    private readonly maxRequestsPerPriority: Record<QueuePriority, number> = {
        high: 10,
        normal: 20,
        low: 30
    };
    private isProcessing = false;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelResourceOptimizer) private readonly resourceOptimizer: ModelResourceOptimizer,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService
    ) {
        super();
        this.initializeQueues();
    }

    private initializeQueues(): void {
        this.queues.set('high', []);
        this.queues.set('normal', []);
        this.queues.set('low', []);
    }

    public async enqueue(request: QueuedModelRequest, priority: QueuePriority = 'normal'): Promise<string> {
        try {
            const queue = this.queues.get(priority);
            if (!queue) {
                throw new Error(`Invalid priority level: ${priority}`);
            }

            if (this.getTotalQueueSize() >= this.maxQueueSize) {
                throw new Error('Queue system is at capacity');
            }

            if (queue.length >= this.maxRequestsPerPriority[priority]) {
                throw new Error(`Queue for priority ${priority} is at capacity`);
            }

            const queuedRequest = {
                ...request,
                id: request.id || crypto.randomUUID(),
                timestamp: Date.now(),
                priority
            };

            queue.push(queuedRequest);
            
            this.emit(ModelQueueEvents.Queued, {
                requestId: queuedRequest.id,
                priority,
                position: queue.length - 1
            });

            if (!this.isProcessing) {
                this.processQueue();
            }

            return queuedRequest.id;
        } catch (error) {
            this.handleError('Failed to enqueue request', error);
            throw error;
        }
    }

    public dequeue(priority: QueuePriority): QueuedModelRequest | undefined {
        const queue = this.queues.get(priority);
        if (queue?.length) {
            const request = queue.shift();
            if (request) {
                this.activeRequests.add(request.id);
                return request;
            }
        }
        return undefined;
    }

    public getNextRequest(): QueuedModelRequest | undefined {
        const priorities: QueuePriority[] = ['high', 'normal', 'low'];
        
        for (const priority of priorities) {
            const request = this.dequeue(priority);
            if (request) {
                return request;
            }
        }
        return undefined;
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing) {return;}
        this.isProcessing = true;

        try {
            while (this.hasQueuedRequests()) {
                const resources = await this.resourceOptimizer.getAvailableResources();
                if (!this.canProcessMore(resources)) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                }

                const request = this.getNextRequest();
                if (!request) {continue;}

                this.emit(ModelQueueEvents.Processing, {
                    requestId: request.id,
                    priority: request.priority
                });

                this.processRequest(request).catch(error => {
                    this.handleError(`Failed to process request ${request.id}`, error);
                });
            }
        } catch (error) {
            this.handleError('Queue processing error', error);
        } finally {
            this.isProcessing = false;
        }
    }

    private async processRequest(request: QueuedModelRequest): Promise<void> {
        try {
            await this.metricsService.trackRequest(request);
            
            this.emit(ModelQueueEvents.Completed, {
                requestId: request.id,
                priority: request.priority,
                processingTime: Date.now() - request.timestamp
            });

        } catch (error) {
            this.emit(ModelQueueEvents.Failed, {
                requestId: request.id,
                priority: request.priority,
                error
            });
            throw error;
        } finally {
            this.activeRequests.delete(request.id);
        }
    }

    public removeRequest(requestId: string): boolean {
        for (const [priority, queue] of this.queues) {
            const index = queue.findIndex(req => req.id === requestId);
            if (index !== -1) {
                queue.splice(index, 1);
                this.emit(ModelQueueEvents.Removed, { requestId, priority });
                return true;
            }
        }
        return false;
    }

    public getQueueStats(): QueueStats {
        const stats: QueueStats = {
            totalQueued: this.getTotalQueueSize(),
            activeRequests: this.activeRequests.size,
            queueSizes: {},
            oldestRequest: null
        };

        let oldestTimestamp = Date.now();

        for (const [priority, queue] of this.queues) {
            stats.queueSizes[priority] = queue.length;
            
            const oldest = queue[0]?.timestamp;
            if (oldest && oldest < oldestTimestamp) {
                oldestTimestamp = oldest;
                stats.oldestRequest = {
                    id: queue[0].id,
                    priority,
                    age: Date.now() - oldest
                };
            }
        }

        return stats;
    }

    private getTotalQueueSize(): number {
        let total = 0;
        for (const queue of this.queues.values()) {
            total += queue.length;
        }
        return total;
    }

    private hasQueuedRequests(): boolean {
        return Array.from(this.queues.values()).some(queue => queue.length > 0);
    }

    private canProcessMore(resources: any): boolean {
        return this.activeRequests.size < resources.maxConcurrent;
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
    }

    public dispose(): void {
        this.queues.clear();
        this.activeRequests.clear();
        this.removeAllListeners();
    }
}
