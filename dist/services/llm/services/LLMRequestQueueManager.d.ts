import { EventEmitter } from 'events';
import { LLMRequest, LLMRequestPriority, QueueStats, RequestQueueConfig } from '../types';
interface QueuedRequest {
    id: string;
    request: LLMRequest;
    priority: LLMRequestPriority;
    timestamp: number;
    timeoutId?: NodeJS.Timeout;
}
/**
 * Manages request queuing with priority handling and rate limiting
 */
export declare class LLMRequestQueueManager extends EventEmitter {
    private readonly queues;
    private readonly activeRequests;
    private readonly config;
    constructor(config?: Partial<RequestQueueConfig>);
    private initializeQueues;
    /**
     * Enqueue a request with priority
     */
    enqueue(request: LLMRequest, priority?: LLMRequestPriority): string;
    /**
     * Dequeue the next request to process
     */
    dequeue(): QueuedRequest | undefined;
    /**
     * Mark a request as completed
     */
    complete(requestId: string): void;
    /**
     * Remove a request from the queue
     */
    removeRequest(requestId: string): boolean;
    /**
     * Clear all queues
     */
    clear(): void;
    /**
     * Get queue statistics
     */
    getStats(): QueueStats;
    /**
     * Get total number of queued requests
     */
    private getTotalQueueSize;
    /**
     * Update queue configuration
     */
    updateConfig(updates: Partial<RequestQueueConfig>): void;
    dispose(): void;
}
export {};
