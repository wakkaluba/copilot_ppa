"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelQueueService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const logger_1 = require("../../../utils/logger");
const ModelResourceOptimizer_1 = require("./ModelResourceOptimizer");
const ModelMetricsService_1 = require("./ModelMetricsService");
const types_1 = require("../types");
let ModelQueueService = class ModelQueueService extends events_1.EventEmitter {
    constructor(logger, resourceOptimizer, metricsService) {
        super();
        this.logger = logger;
        this.resourceOptimizer = resourceOptimizer;
        this.metricsService = metricsService;
        this.queues = new Map();
        this.activeRequests = new Set();
        this.maxQueueSize = 100;
        this.maxRequestsPerPriority = {
            high: 10,
            normal: 20,
            low: 30
        };
        this.isProcessing = false;
        this.initializeQueues();
    }
    initializeQueues() {
        this.queues.set('high', []);
        this.queues.set('normal', []);
        this.queues.set('low', []);
    }
    async enqueue(request, priority = 'normal') {
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
                timestamp: new Date(),
                priority
            };
            queue.push(queuedRequest);
            this.emit(types_1.ModelQueueEvents.Queued, {
                requestId: queuedRequest.id,
                priority,
                position: queue.length - 1
            });
            if (!this.isProcessing) {
                this.processQueue();
            }
            return queuedRequest.id;
        }
        catch (error) {
            this.handleError('Failed to enqueue request', error);
            throw error;
        }
    }
    dequeue(priority) {
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
    getNextRequest() {
        const priorities = ['high', 'normal', 'low'];
        for (const priority of priorities) {
            const request = this.dequeue(priority);
            if (request) {
                return request;
            }
        }
        return undefined;
    }
    async processQueue() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        try {
            while (this.hasQueuedRequests()) {
                const resources = await this.resourceOptimizer.getAvailableResources();
                if (!this.canProcessMore(resources)) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                }
                const request = this.getNextRequest();
                if (!request) {
                    continue;
                }
                this.emit(types_1.ModelQueueEvents.Processing, {
                    requestId: request.id,
                    priority: request.priority
                });
                this.processRequest(request).catch(error => {
                    this.handleError(`Failed to process request ${request.id}`, error);
                });
            }
        }
        catch (error) {
            this.handleError('Queue processing error', error);
        }
        finally {
            this.isProcessing = false;
        }
    }
    async processRequest(request) {
        try {
            await this.metricsService.trackRequest(request);
            this.emit(types_1.ModelQueueEvents.Completed, {
                requestId: request.id,
                priority: request.priority,
                processingTime: Date.now() - request.timestamp
            });
        }
        catch (error) {
            this.emit(types_1.ModelQueueEvents.Failed, {
                requestId: request.id,
                priority: request.priority,
                error
            });
            throw error;
        }
        finally {
            this.activeRequests.delete(request.id);
        }
    }
    removeRequest(requestId) {
        for (const [priority, queue] of this.queues) {
            const index = queue.findIndex(req => req.id === requestId);
            if (index !== -1) {
                queue.splice(index, 1);
                this.emit(types_1.ModelQueueEvents.Removed, { requestId, priority });
                return true;
            }
        }
        return false;
    }
    getQueueStats() {
        const stats = {
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
    getTotalQueueSize() {
        let total = 0;
        for (const queue of this.queues.values()) {
            total += queue.length;
        }
        return total;
    }
    hasQueuedRequests() {
        return Array.from(this.queues.values()).some(queue => queue.length > 0);
    }
    canProcessMore(resources) {
        return this.activeRequests.size < resources.maxConcurrent;
    }
    handleError(message, error) {
        this.logger.error(message, { error });
    }
    dispose() {
        this.queues.clear();
        this.activeRequests.clear();
        this.removeAllListeners();
    }
};
exports.ModelQueueService = ModelQueueService;
exports.ModelQueueService = ModelQueueService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelResourceOptimizer_1.ModelResourceOptimizer)),
    __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ModelResourceOptimizer_1.ModelResourceOptimizer !== "undefined" && ModelResourceOptimizer_1.ModelResourceOptimizer) === "function" ? _b : Object, ModelMetricsService_1.ModelMetricsService])
], ModelQueueService);
//# sourceMappingURL=ModelQueueService.js.map