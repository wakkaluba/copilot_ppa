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
exports.AsyncOptimizer = void 0;
var logger_1 = require("../utils/logger");
var performanceProfiler_1 = require("./performanceProfiler");
/**
 * Class to optimize asynchronous operations by providing
 * utilities for batching, throttling, and debouncing
 */
var AsyncOptimizer = /** @class */ (function () {
    function AsyncOptimizer() {
        this.pendingBatches = new Map();
        this.throttleTimers = new Map();
        this.debounceTimers = new Map();
        this.logger = logger_1.Logger.getInstance();
        this.profiler = performanceProfiler_1.PerformanceProfiler.getInstance();
        this.stats = {
            optimizedCount: 0,
            avgResponseTime: 0,
            successRate: 100,
            batchesProcessed: 0
        };
    }
    AsyncOptimizer.getInstance = function () {
        if (!AsyncOptimizer.instance) {
            AsyncOptimizer.instance = new AsyncOptimizer();
        }
        return AsyncOptimizer.instance;
    };
    AsyncOptimizer.prototype.setConfig = function (config) {
        this.config = config;
    };
    AsyncOptimizer.prototype.getStats = function () {
        return __assign({}, this.stats);
    };
    /**
     * Batch multiple operations into a single execution
     * @param batchId Identifier for the batch
     * @param item Item to add to the batch
     * @param processBatchFn Function to process the batch
     * @param delayMs Delay before processing the batch (default: 100ms)
     * @param maxBatchSize Maximum batch size before forced processing
     */
    AsyncOptimizer.prototype.addToBatch = function (batchId_1, item_1, processBatchFn_1) {
        return __awaiter(this, arguments, void 0, function (batchId, item, processBatchFn, delayMs, maxBatchSize) {
            var _this = this;
            if (delayMs === void 0) { delayMs = 100; }
            if (maxBatchSize === void 0) { maxBatchSize = 50; }
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var existingBatch = _this.pendingBatches.get(batchId);
                        if (existingBatch) {
                            // Add item to existing batch
                            var itemIndex_1 = existingBatch.items.length;
                            existingBatch.items.push(item);
                            // Save the resolver for this specific item
                            var originalResolver_1 = existingBatch.resolver;
                            existingBatch.resolver = function (results) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    originalResolver_1(results);
                                    resolve(results[itemIndex_1]);
                                    return [2 /*return*/];
                                });
                            }); };
                            // Process immediately if we hit max batch size
                            if (existingBatch.items.length >= maxBatchSize) {
                                clearTimeout(existingBatch.timer);
                                _this.processBatch(batchId, processBatchFn);
                            }
                        }
                        else {
                            // Create a new batch
                            var timer = setTimeout(function () {
                                _this.processBatch(batchId, processBatchFn);
                            }, delayMs);
                            _this.pendingBatches.set(batchId, {
                                items: [item],
                                resolver: function (results) { return resolve(results[0]); },
                                timer: timer
                            });
                        }
                    })];
            });
        });
    };
    /**
     * Process a batch of operations
     */
    AsyncOptimizer.prototype.processBatch = function (batchId, processFn) {
        return __awaiter(this, void 0, void 0, function () {
            var batch, results, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batch = this.pendingBatches.get(batchId);
                        if (!batch) {
                            return [2 /*return*/];
                        }
                        this.pendingBatches.delete(batchId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.profiler.startOperation("batch.".concat(batchId));
                        return [4 /*yield*/, processFn(batch.items)];
                    case 2:
                        results = _a.sent();
                        this.profiler.endOperation("batch.".concat(batchId), "Processed ".concat(batch.items.length, " items"));
                        // Resolve the batch promise
                        batch.resolver(results);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error("Error processing batch ".concat(batchId, ": ").concat(error_1));
                        // Resolve with empty results in case of error
                        batch.resolver([]);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throttle a function to avoid excessive calls
     * @param key Identifier for this throttled function
     * @param fn Function to execute
     * @param limitMs Minimum time between executions (default: 1000ms)
     */
    AsyncOptimizer.prototype.throttle = function (key, fn, limitMs) {
        var _this = this;
        if (limitMs === void 0) { limitMs = 1000; }
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var now, throttleInfo, timeSinceLast, delayMs_1;
                var _this = this;
                return __generator(this, function (_a) {
                    now = Date.now();
                    throttleInfo = this.throttleTimers.get(key) || { lastExecuted: 0, timer: null };
                    timeSinceLast = now - throttleInfo.lastExecuted;
                    // If we're within the limit, schedule for later execution
                    if (timeSinceLast < limitMs) {
                        delayMs_1 = limitMs - timeSinceLast;
                        return [2 /*return*/, new Promise(function (resolve) {
                                // Clear existing timer if any
                                if (throttleInfo.timer) {
                                    clearTimeout(throttleInfo.timer);
                                }
                                // Set new timer
                                var timer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var result, error_2;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                this.throttleTimers.set(key, {
                                                    lastExecuted: Date.now(),
                                                    timer: null
                                                });
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, fn.apply(void 0, args)];
                                            case 2:
                                                result = _a.sent();
                                                resolve(result);
                                                return [3 /*break*/, 4];
                                            case 3:
                                                error_2 = _a.sent();
                                                this.logger.error("Error in throttled function ".concat(key, ": ").concat(error_2));
                                                throw error_2;
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                }); }, delayMs_1);
                                _this.throttleTimers.set(key, __assign(__assign({}, throttleInfo), { timer: timer }));
                            })];
                    }
                    // Execute immediately if outside the limit
                    this.throttleTimers.set(key, {
                        lastExecuted: now,
                        timer: null
                    });
                    return [2 /*return*/, fn.apply(void 0, args)];
                });
            });
        };
    };
    /**
     * Debounce a function to delay execution until after a period of inactivity
     * @param key Identifier for this debounced function
     * @param fn Function to execute
     * @param waitMs Time to wait after last call before executing (default: 300ms)
     */
    AsyncOptimizer.prototype.debounce = function (key, fn, waitMs) {
        var _this = this;
        if (waitMs === void 0) { waitMs = 300; }
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new Promise(function (resolve) {
                // Clear existing timer
                if (_this.debounceTimers.has(key)) {
                    clearTimeout(_this.debounceTimers.get(key));
                }
                // Set new timer
                var timer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    var result, error_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.debounceTimers.delete(key);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, fn.apply(void 0, args)];
                            case 2:
                                result = _a.sent();
                                resolve(result);
                                return [3 /*break*/, 4];
                            case 3:
                                error_3 = _a.sent();
                                this.logger.error("Error in debounced function ".concat(key, ": ").concat(error_3));
                                throw error_3;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }, waitMs);
                _this.debounceTimers.set(key, timer);
            });
        };
    };
    /**
     * Clear all pending operations and timers
     */
    AsyncOptimizer.prototype.dispose = function () {
        // Clear all batch timers
        for (var _i = 0, _a = this.pendingBatches.values(); _i < _a.length; _i++) {
            var batch = _a[_i];
            clearTimeout(batch.timer);
            batch.resolver([]);
        }
        this.pendingBatches.clear();
        // Clear all throttle timers
        for (var _b = 0, _c = this.throttleTimers.values(); _b < _c.length; _b++) {
            var throttleInfo = _c[_b];
            if (throttleInfo.timer) {
                clearTimeout(throttleInfo.timer);
            }
        }
        this.throttleTimers.clear();
        // Clear all debounce timers
        for (var _d = 0, _e = this.debounceTimers.values(); _d < _e.length; _d++) {
            var timer = _e[_d];
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
    };
    AsyncOptimizer.prototype.optimizeOperation = function (operation) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, result, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.race([
                                operation(),
                                new Promise(function (_, reject) {
                                    return setTimeout(function () { return reject(new Error('Operation timed out')); }, _this.config.timeoutMs);
                                })
                            ])];
                    case 2:
                        result = _a.sent();
                        this.updateStats(startTime, true);
                        return [2 /*return*/, result];
                    case 3:
                        error_4 = _a.sent();
                        this.updateStats(startTime, false);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AsyncOptimizer.prototype.optimizeBatch = function (operations) {
        return __awaiter(this, void 0, void 0, function () {
            var results, batches, _i, batches_1, batch, batchResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        batches = this.createBatches(operations);
                        _i = 0, batches_1 = batches;
                        _a.label = 1;
                    case 1:
                        if (!(_i < batches_1.length)) return [3 /*break*/, 4];
                        batch = batches_1[_i];
                        return [4 /*yield*/, Promise.all(batch.map(function (op) { return _this.optimizeOperation(op); }))];
                    case 2:
                        batchResults = _a.sent();
                        results.push.apply(results, batchResults);
                        this.stats.batchesProcessed++;
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    AsyncOptimizer.prototype.createBatches = function (operations) {
        var batches = [];
        for (var i = 0; i < operations.length; i += this.config.batchSize) {
            batches.push(operations.slice(i, i + this.config.batchSize));
        }
        return batches;
    };
    AsyncOptimizer.prototype.updateStats = function (startTime, success) {
        var duration = Date.now() - startTime;
        this.stats.optimizedCount++;
        this.stats.avgResponseTime = (this.stats.avgResponseTime * (this.stats.optimizedCount - 1) + duration) / this.stats.optimizedCount;
        // Update success rate
        var totalOps = this.stats.optimizedCount;
        var successfulOps = Math.round(this.stats.successRate * (totalOps - 1) / 100);
        var newSuccessfulOps = success ? successfulOps + 1 : successfulOps;
        this.stats.successRate = (newSuccessfulOps / totalOps) * 100;
    };
    return AsyncOptimizer;
}());
exports.AsyncOptimizer = AsyncOptimizer;
