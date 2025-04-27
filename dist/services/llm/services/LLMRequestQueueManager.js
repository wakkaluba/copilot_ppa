"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMRequestQueueManager = void 0;
const events_1 = require("events");
const types_1 = require("../types");
const DEFAULT_CONFIG = {
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
class LLMRequestQueueManager extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.queues = new Map();
        this.activeRequests = new Set();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.initializeQueues();
    }
    initializeQueues() {
        for (const priority of this.config.priorityLevels) {
            this.queues.set(priority, []);
        }
    }
    /**
     * Enqueue a request with priority
     */
    enqueue(request, priority = 'normal') {
        const id = crypto.randomUUID();
        const queuedRequest = {
            id,
            request,
            priority,
            timestamp: new Date()
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
            this.emit(types_1.LLMRequestEvent.QueueTimeout, {
                requestId: id,
                priority
            });
        }, this.config.queueTimeout);
        this.emit(types_1.LLMRequestEvent.Queued, {
            requestId: id,
            priority,
            queuePosition: queue.length - 1
        });
        return id;
    }
    /**
     * Dequeue the next request to process
     */
    dequeue() {
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
    complete(requestId) {
        this.activeRequests.delete(requestId);
        this.emit(types_1.LLMRequestEvent.Completed, { requestId });
    }
    /**
     * Remove a request from the queue
     */
    removeRequest(requestId) {
        for (const [priority, queue] of this.queues) {
            const index = queue.findIndex(req => req.id === requestId);
            if (index !== -1) {
                const [request] = queue.splice(index, 1);
                if (request.timeoutId) {
                    clearTimeout(request.timeoutId);
                }
                this.emit(types_1.LLMRequestEvent.Removed, {
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
    clear() {
        for (const [priority, queue] of this.queues) {
            for (const request of queue) {
                if (request.timeoutId) {
                    clearTimeout(request.timeoutId);
                }
                this.emit(types_1.LLMRequestEvent.Removed, {
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
    getStats() {
        const stats = {
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
    getTotalQueueSize() {
        let total = 0;
        for (const queue of this.queues.values()) {
            total += queue.length;
        }
        return total;
    }
    /**
     * Update queue configuration
     */
    updateConfig(updates) {
        Object.assign(this.config, updates);
    }
    dispose() {
        this.clear();
        this.removeAllListeners();
    }
}
exports.LLMRequestQueueManager = LLMRequestQueueManager;
//# sourceMappingURL=LLMRequestQueueManager.js.map