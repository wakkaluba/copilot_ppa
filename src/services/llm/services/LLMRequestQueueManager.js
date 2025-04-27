"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMRequestQueueManager = void 0;
var events_1 = require("events");
var types_1 = require("../types");
var DEFAULT_CONFIG = {
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
var LLMRequestQueueManager = /** @class */ (function (_super) {
    __extends(LLMRequestQueueManager, _super);
    function LLMRequestQueueManager(config) {
        var _this = _super.call(this) || this;
        _this.queues = new Map();
        _this.activeRequests = new Set();
        _this.config = __assign(__assign({}, DEFAULT_CONFIG), config);
        _this.initializeQueues();
        return _this;
    }
    LLMRequestQueueManager.prototype.initializeQueues = function () {
        for (var _i = 0, _a = this.config.priorityLevels; _i < _a.length; _i++) {
            var priority = _a[_i];
            this.queues.set(priority, []);
        }
    };
    /**
     * Enqueue a request with priority
     */
    LLMRequestQueueManager.prototype.enqueue = function (request, priority) {
        var _this = this;
        if (priority === void 0) { priority = 'normal'; }
        var id = crypto.randomUUID();
        var queuedRequest = {
            id: id,
            request: request,
            priority: priority,
            timestamp: new Date()
        };
        var queue = this.queues.get(priority);
        if (!queue) {
            throw new Error("Invalid priority level: ".concat(priority));
        }
        // Check queue size limits
        if (this.getTotalQueueSize() >= this.config.maxQueueSize) {
            throw new Error('Queue is full');
        }
        if (queue.length >= (this.config.maxRequestsPerPriority[priority] || Infinity)) {
            throw new Error("Queue for priority ".concat(priority, " is full"));
        }
        // Add to queue
        queue.push(queuedRequest);
        // Set up timeout
        queuedRequest.timeoutId = setTimeout(function () {
            _this.removeRequest(id);
            _this.emit(types_1.LLMRequestEvent.QueueTimeout, {
                requestId: id,
                priority: priority
            });
        }, this.config.queueTimeout);
        this.emit(types_1.LLMRequestEvent.Queued, {
            requestId: id,
            priority: priority,
            queuePosition: queue.length - 1
        });
        return id;
    };
    /**
     * Dequeue the next request to process
     */
    LLMRequestQueueManager.prototype.dequeue = function () {
        // Try each priority level in order
        for (var _i = 0, _a = this.config.priorityLevels; _i < _a.length; _i++) {
            var priority = _a[_i];
            var queue = this.queues.get(priority);
            if (queue === null || queue === void 0 ? void 0 : queue.length) {
                var request = queue.shift();
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
    };
    /**
     * Mark a request as completed
     */
    LLMRequestQueueManager.prototype.complete = function (requestId) {
        this.activeRequests.delete(requestId);
        this.emit(types_1.LLMRequestEvent.Completed, { requestId: requestId });
    };
    /**
     * Remove a request from the queue
     */
    LLMRequestQueueManager.prototype.removeRequest = function (requestId) {
        for (var _i = 0, _a = this.queues; _i < _a.length; _i++) {
            var _b = _a[_i], priority = _b[0], queue = _b[1];
            var index = queue.findIndex(function (req) { return req.id === requestId; });
            if (index !== -1) {
                var request = queue.splice(index, 1)[0];
                if (request.timeoutId) {
                    clearTimeout(request.timeoutId);
                }
                this.emit(types_1.LLMRequestEvent.Removed, {
                    requestId: requestId,
                    priority: priority
                });
                return true;
            }
        }
        return false;
    };
    /**
     * Clear all queues
     */
    LLMRequestQueueManager.prototype.clear = function () {
        for (var _i = 0, _a = this.queues; _i < _a.length; _i++) {
            var _b = _a[_i], priority = _b[0], queue = _b[1];
            for (var _c = 0, queue_1 = queue; _c < queue_1.length; _c++) {
                var request = queue_1[_c];
                if (request.timeoutId) {
                    clearTimeout(request.timeoutId);
                }
                this.emit(types_1.LLMRequestEvent.Removed, {
                    requestId: request.id,
                    priority: priority
                });
            }
            queue.length = 0;
        }
    };
    /**
     * Get queue statistics
     */
    LLMRequestQueueManager.prototype.getStats = function () {
        var _a;
        var stats = {
            totalQueued: this.getTotalQueueSize(),
            activeRequests: this.activeRequests.size,
            queueSizes: {},
            oldestRequest: null
        };
        var oldestTimestamp = Date.now();
        for (var _i = 0, _b = this.queues; _i < _b.length; _i++) {
            var _c = _b[_i], priority = _c[0], queue = _c[1];
            stats.queueSizes[priority] = queue.length;
            // Find oldest request
            var oldest = (_a = queue[0]) === null || _a === void 0 ? void 0 : _a.timestamp;
            if (oldest && oldest < oldestTimestamp) {
                oldestTimestamp = oldest;
                stats.oldestRequest = {
                    id: queue[0].id,
                    priority: priority,
                    age: Date.now() - oldest
                };
            }
        }
        return stats;
    };
    /**
     * Get total number of queued requests
     */
    LLMRequestQueueManager.prototype.getTotalQueueSize = function () {
        var total = 0;
        for (var _i = 0, _a = this.queues.values(); _i < _a.length; _i++) {
            var queue = _a[_i];
            total += queue.length;
        }
        return total;
    };
    /**
     * Update queue configuration
     */
    LLMRequestQueueManager.prototype.updateConfig = function (updates) {
        Object.assign(this.config, updates);
    };
    LLMRequestQueueManager.prototype.dispose = function () {
        this.clear();
        this.removeAllListeners();
    };
    return LLMRequestQueueManager;
}(events_1.EventEmitter));
exports.LLMRequestQueueManager = LLMRequestQueueManager;
