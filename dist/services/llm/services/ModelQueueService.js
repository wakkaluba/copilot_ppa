"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelQueueService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
let ModelQueueService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelQueueService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelQueueService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        resourceOptimizer;
        metricsService;
        queues = new Map();
        activeRequests = new Set();
        maxQueueSize = 100;
        maxRequestsPerPriority = {
            high: 10,
            normal: 20,
            low: 30
        };
        isProcessing = false;
        constructor(logger, resourceOptimizer, metricsService) {
            super();
            this.logger = logger;
            this.resourceOptimizer = resourceOptimizer;
            this.metricsService = metricsService;
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
                    timestamp: Date.now(),
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
    return ModelQueueService = _classThis;
})();
exports.ModelQueueService = ModelQueueService;
//# sourceMappingURL=ModelQueueService.js.map