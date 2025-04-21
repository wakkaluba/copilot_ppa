import { EventEmitter } from 'events';
import { 
    LLMRequest, 
    LLMRequestPriority,
    LLMRequestEvent,
    QueueStats,
    RequestQueueConfig
} from '../types';

interface QueuedRequest {
    id: string;
    request: LLMRequest;
    priority: LLMRequestPriority;
    timestamp: number;
    timeoutId?: NodeJS.Timeout;
}

const DEFAULT_CONFIG: RequestQueueConfig = {
    maxQueueSize: 100,
    queueTimeout: 60000,
    priorityLevels: ['high', 'normal', 'low'],
    maxRequestsPerPriority: {
        high: 5,
        normal: 10,
        low: 20
    }
};

/**
 * Manages request queuing with priority handling and rate limiting
 */
export class LLMRequestQueueManager extends EventEmitter {
    private readonly queues: Map<LLMRequestPriority, QueuedRequest[]> = new Map();
    private readonly activeRequests: Set<string> = new Set();
    private readonly config: RequestQueueConfig;

    constructor(config?: Partial<RequestQueueConfig>) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.initializeQueues();
    }

    private initializeQueues(): void {
        for (const priority of this.config.priorityLevels) {
            this.queues.set(priority, []);
        }
    }

    /**
     * Enqueue a request with priority
     */
    public enqueue(
        request: LLMRequest,
        priority: LLMRequestPriority = 'normal'
    ): string {
        const id = crypto.randomUUID();
        const queuedRequest: QueuedRequest = {
            id,
            request,
            priority,
            timestamp: Date.now()
        };

        const queue = this.queues.get(priority);
        if (!queue) {
            throw new Error(`Invalid priority level: ${priority}`);
        }

        // Check queue size limits
        if (this.getTotalQueueSize() >= this.config.maxQueueSize) {
            throw new Error('Queue is full');
        }

        if (queue.length >= (this.config.maxRequestsPerPriority[priority] || Infinity)) {
            throw new Error(`Queue for priority ${priority} is full`);
        }

        // Add to queue
        queue.push(queuedRequest);
        
        // Set up timeout
        queuedRequest.timeoutId = setTimeout(() => {
            this.removeRequest(id);
            this.emit(LLMRequestEvent.QueueTimeout, {
                requestId: id,
                priority
            });
        }, this.config.queueTimeout);

        this.emit(LLMRequestEvent.Queued, {
            requestId: id,
            priority,
            queuePosition: queue.length - 1
        });

        return id;
    }

    /**
     * Dequeue the next request to process
     */
    public dequeue(): QueuedRequest | undefined {
        // Try each priority level in order
        for (const priority of this.config.priorityLevels) {
            const queue = this.queues.get(priority);
            if (queue?.length) {
                const request = queue.shift();
                if (request) {
                    if (request.timeoutId) {
                        clearTimeout(request.timeoutId);
                    }
                    this.activeRequests.add(request.id);
                    return request;
                }
            }
        }
        return undefined;
    }

    /**
     * Mark a request as completed
     */
    public complete(requestId: string): void {
        this.activeRequests.delete(requestId);
        this.emit(LLMRequestEvent.Completed, { requestId });
    }

    /**
     * Remove a request from the queue
     */
    public removeRequest(requestId: string): boolean {
        for (const [priority, queue] of this.queues) {
            const index = queue.findIndex(req => req.id === requestId);
            if (index !== -1) {
                const [request] = queue.splice(index, 1);
                if (request.timeoutId) {
                    clearTimeout(request.timeoutId);
                }
                this.emit(LLMRequestEvent.Removed, {
                    requestId,
                    priority
                });
                return true;
            }
        }
        return false;
    }

    /**
     * Clear all queues
     */
    public clear(): void {
        for (const [priority, queue] of this.queues) {
            for (const request of queue) {
                if (request.timeoutId) {
                    clearTimeout(request.timeoutId);
                }
                this.emit(LLMRequestEvent.Removed, {
                    requestId: request.id,
                    priority
                });
            }
            queue.length = 0;
        }
    }

    /**
     * Get queue statistics
     */
    public getStats(): QueueStats {
        const stats: QueueStats = {
            totalQueued: this.getTotalQueueSize(),
            activeRequests: this.activeRequests.size,
            queueSizes: {},
            oldestRequest: null
        };

        let oldestTimestamp = Date.now();

        for (const [priority, queue] of this.queues) {
            stats.queueSizes[priority] = queue.length;
            
            // Find oldest request
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

    /**
     * Get total number of queued requests
     */
    private getTotalQueueSize(): number {
        let total = 0;
        for (const queue of this.queues.values()) {
            total += queue.length;
        }
        return total;
    }

    /**
     * Update queue configuration
     */
    public updateConfig(updates: Partial<RequestQueueConfig>): void {
        Object.assign(this.config, updates);
    }

    public dispose(): void {
        this.clear();
        this.removeAllListeners();
    }
}