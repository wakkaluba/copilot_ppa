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
exports.ModelSchedulerManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var ModelMetricsManager_1 = require("./ModelMetricsManager");
var ModelSchedulerManager = /** @class */ (function (_super) {
    __extends(ModelSchedulerManager, _super);
    function ModelSchedulerManager(logger, metricsManager) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsManager = metricsManager;
        _this.requestQueues = new Map();
        _this.activeRequests = new Set();
        _this.maxConcurrentRequests = 3;
        _this.isProcessing = false;
        _this.outputChannel = vscode.window.createOutputChannel('Model Scheduler');
        _this.initializeQueues();
        return _this;
    }
    ModelSchedulerManager.prototype.scheduleRequest = function (request_1) {
        return __awaiter(this, arguments, void 0, function (request, priority) {
            var requestId, queue;
            if (priority === void 0) { priority = 'normal'; }
            return __generator(this, function (_a) {
                requestId = request.id || crypto.randomUUID();
                try {
                    queue = this.requestQueues.get(priority);
                    if (!queue) {
                        throw new Error("Invalid priority level: ".concat(priority));
                    }
                    // Add request to appropriate queue
                    queue.push(__assign(__assign({}, request), { id: requestId }));
                    this.emit('requestQueued', { requestId: requestId, priority: priority });
                    this.logRequestQueued(requestId, priority);
                    // Start processing if not already running
                    if (!this.isProcessing) {
                        this.processQueues();
                    }
                    return [2 /*return*/, requestId];
                }
                catch (error) {
                    this.handleError('Failed to schedule request', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelSchedulerManager.prototype.cancelRequest = function (requestId) {
        // Check active requests first
        if (this.activeRequests.has(requestId)) {
            this.activeRequests.delete(requestId);
            this.emit('requestCancelled', { requestId: requestId });
            return true;
        }
        // Check queues
        for (var _i = 0, _a = this.requestQueues.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], priority = _b[0], queue = _b[1];
            var index = queue.findIndex(function (req) { return req.id === requestId; });
            if (index !== -1) {
                queue.splice(index, 1);
                this.emit('requestCancelled', { requestId: requestId, priority: priority });
                return true;
            }
        }
        return false;
    };
    ModelSchedulerManager.prototype.processQueues = function () {
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
                            var request;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!(this_1.activeRequests.size >= this_1.maxConcurrentRequests)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                                    case 1:
                                        _b.sent();
                                        return [2 /*return*/, "continue"];
                                    case 2:
                                        request = this_1.getNextRequest();
                                        if (!request) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        this_1.activeRequests.add(request.id);
                                        this_1.emit('requestStarted', { requestId: request.id });
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
    ModelSchedulerManager.prototype.processRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, duration, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, request.execute()];
                    case 2:
                        _a.sent();
                        duration = Date.now() - startTime;
                        this.metricsManager.recordRequestMetrics(request.modelId, {
                            duration: duration,
                            success: true
                        });
                        this.emit('requestCompleted', {
                            requestId: request.id,
                            duration: duration
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _a.sent();
                        this.metricsManager.recordRequestMetrics(request.modelId, {
                            duration: Date.now() - startTime,
                            success: false
                        });
                        throw error_2;
                    case 4:
                        this.activeRequests.delete(request.id);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelSchedulerManager.prototype.getNextRequest = function () {
        var priorities = ['high', 'normal', 'low'];
        for (var _i = 0, priorities_1 = priorities; _i < priorities_1.length; _i++) {
            var priority = priorities_1[_i];
            var queue = this.requestQueues.get(priority);
            if (queue === null || queue === void 0 ? void 0 : queue.length) {
                return queue.shift();
            }
        }
        return undefined;
    };
    ModelSchedulerManager.prototype.hasQueuedRequests = function () {
        return Array.from(this.requestQueues.values()).some(function (queue) { return queue.length > 0; });
    };
    ModelSchedulerManager.prototype.initializeQueues = function () {
        this.requestQueues.set('high', []);
        this.requestQueues.set('normal', []);
        this.requestQueues.set('low', []);
    };
    ModelSchedulerManager.prototype.getQueueStatus = function () {
        var status = {
            high: 0,
            normal: 0,
            low: 0
        };
        for (var _i = 0, _a = this.requestQueues.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], priority = _b[0], queue = _b[1];
            status[priority] = queue.length;
        }
        return status;
    };
    ModelSchedulerManager.prototype.getActiveRequestCount = function () {
        return this.activeRequests.size;
    };
    ModelSchedulerManager.prototype.logRequestQueued = function (requestId, priority) {
        var _this = this;
        this.outputChannel.appendLine("Request ".concat(requestId, " queued with priority ").concat(priority));
        this.outputChannel.appendLine('Queue Status:');
        var status = this.getQueueStatus();
        Object.entries(status).forEach(function (_a) {
            var priority = _a[0], count = _a[1];
            _this.outputChannel.appendLine("  ".concat(priority, ": ").concat(count, " requests"));
        });
    };
    ModelSchedulerManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelSchedulerManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelSchedulerManager.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        // Cancel all active and queued requests
        this.activeRequests.clear();
        this.requestQueues.forEach(function (queue) { return queue.length = 0; });
    };
    var _a;
    ModelSchedulerManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelMetricsManager_1.ModelMetricsManager])
    ], ModelSchedulerManager);
    return ModelSchedulerManager;
}(events_1.EventEmitter));
exports.ModelSchedulerManager = ModelSchedulerManager;
