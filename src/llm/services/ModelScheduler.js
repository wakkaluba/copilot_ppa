"use strict";
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
exports.ModelScheduler = void 0;
var inversify_1 = require("inversify");
var types_1 = require("../types");
var ModelSystemManager_1 = require("./ModelSystemManager");
var ModelScheduler = /** @class */ (function () {
    function ModelScheduler(logger, systemManager, processingIntervalMs) {
        if (processingIntervalMs === void 0) { processingIntervalMs = 1000; }
        this.logger = logger;
        this.systemManager = systemManager;
        this.processingIntervalMs = processingIntervalMs;
        this.taskQueue = new Map();
        this.activeTasks = new Map();
        this.maxConcurrentTasks = 3;
        this.taskHistory = [];
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageWaitTime: 0,
            averageProcessingTime: 0
        };
        this.processingInterval = null;
        this.startProcessing();
    }
    ModelScheduler.prototype.scheduleTask = function (modelId_1) {
        return __awaiter(this, arguments, void 0, function (modelId, priority, payload, timeoutMs) {
            var task;
            var _a;
            if (priority === void 0) { priority = 'normal'; }
            return __generator(this, function (_b) {
                task = {
                    id: crypto.randomUUID(),
                    modelId: modelId,
                    priority: priority,
                    timestamp: new Date(),
                    timeoutMs: timeoutMs,
                    status: 'pending',
                    payload: payload
                };
                if (!this.taskQueue.has(priority)) {
                    this.taskQueue.set(priority, []);
                }
                (_a = this.taskQueue.get(priority)) === null || _a === void 0 ? void 0 : _a.push(task);
                this.metrics.totalTasks++;
                this.logger.info('ModelScheduler', "Scheduled task ".concat(task.id, " for model ").concat(modelId, " with priority ").concat(priority));
                return [2 /*return*/, task.id];
            });
        });
    };
    ModelScheduler.prototype.processTasks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nextTask, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        _a.label = 1;
                    case 1:
                        if (!(this.activeTasks.size < this.maxConcurrentTasks)) return [3 /*break*/, 3];
                        nextTask = this.getNextTask();
                        if (!nextTask) {
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, this.executeTask(nextTask)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this.handleError('Error processing tasks', error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelScheduler.prototype.getNextTask = function () {
        // Try priorities in order: high, normal, low
        var priorities = ['high', 'normal', 'low'];
        for (var _i = 0, priorities_1 = priorities; _i < priorities_1.length; _i++) {
            var priority = priorities_1[_i];
            var queue = this.taskQueue.get(priority);
            if (queue === null || queue === void 0 ? void 0 : queue.length) {
                return queue.shift();
            }
        }
        return undefined;
    };
    ModelScheduler.prototype.executeTask = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var timeoutPromise, executionPromise, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        task.status = 'running';
                        this.activeTasks.set(task.id, task);
                        timeoutPromise = task.timeoutMs ?
                            new Promise(function (_, reject) { return setTimeout(function () { return reject(new Error("Task ".concat(task.id, " timed out after ").concat(task.timeoutMs, "ms"))); }, task.timeoutMs); }) :
                            null;
                        executionPromise = this.runTask(task);
                        // Execute with timeout if specified
                        return [4 /*yield*/, Promise.race([
                                executionPromise,
                                timeoutPromise
                            ].filter(Boolean))];
                    case 1:
                        // Execute with timeout if specified
                        _a.sent();
                        task.status = 'completed';
                        this.metrics.completedTasks++;
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _a.sent();
                        task.status = 'failed';
                        this.metrics.failedTasks++;
                        this.handleError("Failed to execute task ".concat(task.id), error_2);
                        return [3 /*break*/, 4];
                    case 3:
                        this.activeTasks.delete(task.id);
                        this.taskHistory.push(task);
                        this.updateMetrics(task);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelScheduler.prototype.runTask = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Implementation would depend on the specific task type
                    // This is a placeholder for actual task execution
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        // Implementation would depend on the specific task type
                        // This is a placeholder for actual task execution
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ModelScheduler.prototype.updateMetrics = function (task) {
        var waitTime = task.timestamp ? (Date.now() - task.timestamp) : 0;
        // Update average wait time
        this.metrics.averageWaitTime = ((this.metrics.averageWaitTime * (this.metrics.totalTasks - 1) + waitTime) /
            this.metrics.totalTasks);
        // Update average processing time if task completed
        if (task.status === 'completed') {
            var processingTime = Date.now() - task.timestamp;
            this.metrics.averageProcessingTime = ((this.metrics.averageProcessingTime * (this.metrics.completedTasks - 1) + processingTime) /
                this.metrics.completedTasks);
        }
    };
    ModelScheduler.prototype.getTaskStatus = function (taskId) {
        return (this.activeTasks.get(taskId) ||
            this.taskHistory.find(function (t) { return t.id === taskId; }));
    };
    ModelScheduler.prototype.getMetrics = function () {
        return __assign({}, this.metrics);
    };
    ModelScheduler.prototype.startProcessing = function () {
        var _this = this;
        if (this.processingInterval) {
            return;
        }
        this.processingInterval = setInterval(function () { return _this.processTasks(); }, this.processingIntervalMs);
    };
    ModelScheduler.prototype.stopProcessing = function () {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    };
    ModelScheduler.prototype.handleError = function (message, error) {
        this.logger.error('ModelScheduler', message, error);
    };
    ModelScheduler.prototype.dispose = function () {
        this.stopProcessing();
        this.taskQueue.clear();
        this.activeTasks.clear();
        this.taskHistory.length = 0;
    };
    var _a;
    ModelScheduler = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelSystemManager_1.ModelSystemManager)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelSystemManager_1.ModelSystemManager, Object])
    ], ModelScheduler);
    return ModelScheduler;
}());
exports.ModelScheduler = ModelScheduler;
