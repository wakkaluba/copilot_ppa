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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelQueueService = void 0;
var inversify_1 = require("inversify");
var events_1 = require("events");
var logger_1 = require("../../../utils/logger");
var ModelResourceOptimizer_1 = require("./ModelResourceOptimizer");
var ModelMetricsService_1 = require("./ModelMetricsService");
var types_1 = require("../types");
var ModelQueueService = /** @class */ (function (_super) {
    __extends(ModelQueueService, _super);
    function ModelQueueService(logger, resourceOptimizer, metricsService) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.resourceOptimizer = resourceOptimizer;
        _this.metricsService = metricsService;
        _this.queues = new Map();
        _this.activeRequests = new Set();
        _this.maxQueueSize = 100;
        _this.maxRequestsPerPriority = {
            high: 10,
            normal: 20,
            low: 30
        };
        _this.isProcessing = false;
        _this.initializeQueues();
        return _this;
    }
    ModelQueueService.prototype.initializeQueues = function () {
        this.queues.set('high', []);
        this.queues.set('normal', []);
        this.queues.set('low', []);
    };
    ModelQueueService.prototype.enqueue = function (request_1) {
        return __awaiter(this, arguments, void 0, function (request, priority) {
            var queue, queuedRequest;
            if (priority === void 0) { priority = 'normal'; }
            return __generator(this, function (_a) {
                try {
                    queue = this.queues.get(priority);
                    if (!queue) {
                        throw new Error("Invalid priority level: ".concat(priority));
                    }
                    if (this.getTotalQueueSize() >= this.maxQueueSize) {
                        throw new Error('Queue system is at capacity');
                    }
                    if (queue.length >= this.maxRequestsPerPriority[priority]) {
                        throw new Error("Queue for priority ".concat(priority, " is at capacity"));
                    }
                    queuedRequest = __assign(__assign({}, request), { id: request.id || crypto.randomUUID(), timestamp: new Date(), priority: priority });
                    queue.push(queuedRequest);
                    this.emit(types_1.ModelQueueEvents.Queued, {
                        requestId: queuedRequest.id,
                        priority: priority,
                        position: queue.length - 1
                    });
                    if (!this.isProcessing) {
                        this.processQueue();
                    }
                    return [2 /*return*/, queuedRequest.id];
                }
                catch (error) {
                    this.handleError('Failed to enqueue request', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelQueueService.prototype.dequeue = function (priority) {
        var queue = this.queues.get(priority);
        if (queue === null || queue === void 0 ? void 0 : queue.length) {
            var request = queue.shift();
            if (request) {
                this.activeRequests.add(request.id);
                return request;
            }
        }
        return undefined;
    };
    ModelQueueService.prototype.getNextRequest = function () {
        var priorities = ['high', 'normal', 'low'];
        for (var _i = 0, priorities_1 = priorities; _i < priorities_1.length; _i++) {
            var priority = priorities_1[_i];
            var request = this.dequeue(priority);
            if (request) {
                return request;
            }
        }
        return undefined;
    };
    ModelQueueService.prototype.processQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isProcessing) {
                            return [2 /*return*/];
                        }
                        this.isProcessing = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        _loop_1 = function () {
                            var resources, request;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, this_1.resourceOptimizer.getAvailableResources()];
                                    case 1:
                                        resources = _b.sent();
                                        if (!!this_1.canProcessMore(resources)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                                    case 2:
                                        _b.sent();
                                        return [2 /*return*/, "continue"];
                                    case 3:
                                        request = this_1.getNextRequest();
                                        if (!request) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        this_1.emit(types_1.ModelQueueEvents.Processing, {
                                            requestId: request.id,
                                            priority: request.priority
                                        });
                                        this_1.processRequest(request).catch(function (error) {
                                            _this.handleError("Failed to process request ".concat(request.id), error);
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 2;
                    case 2:
                        if (!this.hasQueuedRequests()) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 2];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        error_1 = _a.sent();
                        this.handleError('Queue processing error', error_1);
                        return [3 /*break*/, 7];
                    case 6:
                        this.isProcessing = false;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ModelQueueService.prototype.processRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, this.metricsService.trackRequest(request)];
                    case 1:
                        _a.sent();
                        this.emit(types_1.ModelQueueEvents.Completed, {
                            requestId: request.id,
                            priority: request.priority,
                            processingTime: Date.now() - request.timestamp
                        });
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _a.sent();
                        this.emit(types_1.ModelQueueEvents.Failed, {
                            requestId: request.id,
                            priority: request.priority,
                            error: error_2
                        });
                        throw error_2;
                    case 3:
                        this.activeRequests.delete(request.id);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelQueueService.prototype.removeRequest = function (requestId) {
        for (var _i = 0, _a = this.queues; _i < _a.length; _i++) {
            var _b = _a[_i], priority = _b[0], queue = _b[1];
            var index = queue.findIndex(function (req) { return req.id === requestId; });
            if (index !== -1) {
                queue.splice(index, 1);
                this.emit(types_1.ModelQueueEvents.Removed, { requestId: requestId, priority: priority });
                return true;
            }
        }
        return false;
    };
    ModelQueueService.prototype.getQueueStats = function () {
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
    ModelQueueService.prototype.getTotalQueueSize = function () {
        var total = 0;
        for (var _i = 0, _a = this.queues.values(); _i < _a.length; _i++) {
            var queue = _a[_i];
            total += queue.length;
        }
        return total;
    };
    ModelQueueService.prototype.hasQueuedRequests = function () {
        return Array.from(this.queues.values()).some(function (queue) { return queue.length > 0; });
    };
    ModelQueueService.prototype.canProcessMore = function (resources) {
        return this.activeRequests.size < resources.maxConcurrent;
    };
    ModelQueueService.prototype.handleError = function (message, error) {
        this.logger.error(message, { error: error });
    };
    ModelQueueService.prototype.dispose = function () {
        this.queues.clear();
        this.activeRequests.clear();
        this.removeAllListeners();
    };
    var _a, _b;
    ModelQueueService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelResourceOptimizer_1.ModelResourceOptimizer)),
        __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ModelResourceOptimizer_1.ModelResourceOptimizer !== "undefined" && ModelResourceOptimizer_1.ModelResourceOptimizer) === "function" ? _b : Object, ModelMetricsService_1.ModelMetricsService])
    ], ModelQueueService);
    return ModelQueueService;
}(events_1.EventEmitter));
exports.ModelQueueService = ModelQueueService;
