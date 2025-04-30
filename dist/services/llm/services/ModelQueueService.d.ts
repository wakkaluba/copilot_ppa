import { EventEmitter } from 'events';
import { ILogger } from '../../../utils/logger';
import { ModelResourceOptimizer } from './ModelResourceOptimizer';
import { ModelMetricsService } from './ModelMetricsService';
import { QueuedModelRequest, QueuePriority, QueueStats } from '../types';
export declare class ModelQueueService extends EventEmitter {
    private readonly logger;
    private readonly resourceOptimizer;
    private readonly metricsService;
    private readonly queues;
    private readonly activeRequests;
    private readonly maxQueueSize;
    private readonly maxRequestsPerPriority;
    private isProcessing;
    constructor(logger: ILogger, resourceOptimizer: ModelResourceOptimizer, metricsService: ModelMetricsService);
    private initializeQueues;
    enqueue(request: QueuedModelRequest, priority?: QueuePriority): Promise<string>;
    dequeue(priority: QueuePriority): QueuedModelRequest | undefined;
    getNextRequest(): QueuedModelRequest | undefined;
    private processQueue;
    private processRequest;
    removeRequest(requestId: string): boolean;
    getQueueStats(): QueueStats;
    private getTotalQueueSize;
    private hasQueuedRequests;
    private canProcessMore;
    private handleError;
    dispose(): void;
}
