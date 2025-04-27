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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelBenchmarkManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var ModelBenchmarkManager = /** @class */ (function (_super) {
    __extends(ModelBenchmarkManager, _super);
    function ModelBenchmarkManager(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.benchmarkCache = new Map();
        _this.isRunning = false;
        _this.outputChannel = vscode.window.createOutputChannel('Model Benchmarks');
        return _this;
    }
    ModelBenchmarkManager.prototype.runBenchmark = function (model_1) {
        return __awaiter(this, arguments, void 0, function (model, options) {
            var _a, promptSizes, _b, iterations, _c, warmupRuns, _d, timeoutMs, i, metrics, result, error_1;
            var _e;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (this.isRunning) {
                            throw new Error('Benchmark already in progress');
                        }
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 8, 9, 10]);
                        this.isRunning = true;
                        this.emit('benchmarkStarted', model.id);
                        _a = options.promptSizes, promptSizes = _a === void 0 ? [128, 512, 1024] : _a, _b = options.iterations, iterations = _b === void 0 ? 5 : _b, _c = options.warmupRuns, warmupRuns = _c === void 0 ? 2 : _c, _d = options.timeoutMs, timeoutMs = _d === void 0 ? 30000 : _d;
                        i = 0;
                        _f.label = 2;
                    case 2:
                        if (!(i < warmupRuns)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.runSingleIteration(model, 256)];
                    case 3:
                        _f.sent();
                        _f.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.collectBenchmarkMetrics(model, promptSizes, iterations, timeoutMs)];
                    case 6:
                        metrics = _f.sent();
                        _e = {
                            modelId: model.id,
                            timestamp: new Date(),
                            metrics: metrics
                        };
                        return [4 /*yield*/, this.getSystemInfo()];
                    case 7:
                        result = (_e.systemInfo = _f.sent(),
                            _e);
                        this.benchmarkCache.set(model.id, result);
                        this.logBenchmarkResult(result);
                        this.emit('benchmarkCompleted', result);
                        return [2 /*return*/, result];
                    case 8:
                        error_1 = _f.sent();
                        this.handleError('Failed to run benchmark', error_1);
                        throw error_1;
                    case 9:
                        this.isRunning = false;
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    ModelBenchmarkManager.prototype.collectBenchmarkMetrics = function (model, promptSizes, iterations, timeoutMs) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, _i, promptSizes_1, size, latencies, memoryUsage, tokenRates, i, iterationMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metrics = {
                            averageLatency: 0,
                            p95Latency: 0,
                            maxRss: 0,
                            tokensPerSecond: 0,
                            promptSizeMetrics: new Map()
                        };
                        _i = 0, promptSizes_1 = promptSizes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < promptSizes_1.length)) return [3 /*break*/, 7];
                        size = promptSizes_1[_i];
                        latencies = [];
                        memoryUsage = [];
                        tokenRates = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < iterations)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.runSingleIteration(model, size, timeoutMs)];
                    case 3:
                        iterationMetrics = _a.sent();
                        latencies.push(iterationMetrics.latency);
                        memoryUsage.push(iterationMetrics.memoryUsage);
                        tokenRates.push(iterationMetrics.tokensPerSecond);
                        this.emit('iterationCompleted', {
                            modelId: model.id,
                            size: size,
                            iteration: i + 1,
                            metrics: iterationMetrics
                        });
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        metrics.promptSizeMetrics.set(size, {
                            avgLatency: this.calculateAverage(latencies),
                            p95Latency: this.calculateP95(latencies),
                            avgMemoryUsage: this.calculateAverage(memoryUsage),
                            avgTokensPerSecond: this.calculateAverage(tokenRates)
                        });
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        // Calculate aggregate metrics
                        metrics.averageLatency = this.calculateOverallAverage(Array.from(metrics.promptSizeMetrics.values()), function (m) { return m.avgLatency; });
                        metrics.p95Latency = this.calculateOverallP95(Array.from(metrics.promptSizeMetrics.values()), function (m) { return m.avgLatency; });
                        metrics.maxRss = process.memoryUsage().heapUsed;
                        metrics.tokensPerSecond = this.calculateOverallAverage(Array.from(metrics.promptSizeMetrics.values()), function (m) { return m.avgTokensPerSecond; });
                        return [2 /*return*/, metrics];
                }
            });
        });
    };
    ModelBenchmarkManager.prototype.runSingleIteration = function (model_1, promptSize_1) {
        return __awaiter(this, arguments, void 0, function (model, promptSize, timeoutMs) {
            var prompt, startTime, startMem, _a, seconds, nanoseconds, latency, memoryUsage, tokensPerSecond, error_2;
            if (timeoutMs === void 0) { timeoutMs = 30000; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        prompt = 'A'.repeat(promptSize);
                        startTime = process.hrtime();
                        startMem = process.memoryUsage().heapUsed;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        // Run model inference with timeout
                        return [4 /*yield*/, Promise.race([
                                model.provider.generateText(prompt),
                                new Promise(function (_, reject) {
                                    return setTimeout(function () { return reject(new Error('Benchmark timeout')); }, timeoutMs);
                                })
                            ])];
                    case 2:
                        // Run model inference with timeout
                        _b.sent();
                        _a = process.hrtime(startTime), seconds = _a[0], nanoseconds = _a[1];
                        latency = seconds * 1000 + nanoseconds / 1000000;
                        memoryUsage = process.memoryUsage().heapUsed - startMem;
                        tokensPerSecond = promptSize / (latency / 1000);
                        return [2 /*return*/, { latency: latency, memoryUsage: memoryUsage, tokensPerSecond: tokensPerSecond }];
                    case 3:
                        error_2 = _b.sent();
                        this.handleError('Failed to run iteration', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelBenchmarkManager.prototype.getLastBenchmark = function (modelId) {
        return this.benchmarkCache.get(modelId);
    };
    ModelBenchmarkManager.prototype.clearBenchmarks = function () {
        this.benchmarkCache.clear();
        this.emit('benchmarksCleared');
    };
    ModelBenchmarkManager.prototype.getSystemInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        platform: process.platform,
                        cpuCores: require('os').cpus().length,
                        totalMemory: require('os').totalmem(),
                        nodeVersion: process.version,
                        timestamp: new Date()
                    }];
            });
        });
    };
    ModelBenchmarkManager.prototype.calculateAverage = function (numbers) {
        return numbers.reduce(function (a, b) { return a + b; }, 0) / numbers.length;
    };
    ModelBenchmarkManager.prototype.calculateP95 = function (numbers) {
        var sorted = __spreadArray([], numbers, true).sort(function (a, b) { return a - b; });
        var index = Math.ceil(numbers.length * 0.95) - 1;
        return sorted[index];
    };
    ModelBenchmarkManager.prototype.calculateOverallAverage = function (items, selector) {
        return this.calculateAverage(items.map(selector));
    };
    ModelBenchmarkManager.prototype.calculateOverallP95 = function (items, selector) {
        return this.calculateP95(items.map(selector));
    };
    ModelBenchmarkManager.prototype.logBenchmarkResult = function (result) {
        var _this = this;
        this.outputChannel.appendLine('\nBenchmark Results:');
        this.outputChannel.appendLine("Model: ".concat(result.modelId));
        this.outputChannel.appendLine("Timestamp: ".concat(new Date(result.timestamp).toISOString()));
        this.outputChannel.appendLine('\nAggregate Metrics:');
        this.outputChannel.appendLine("Average Latency: ".concat(result.metrics.averageLatency.toFixed(2), "ms"));
        this.outputChannel.appendLine("P95 Latency: ".concat(result.metrics.p95Latency.toFixed(2), "ms"));
        this.outputChannel.appendLine("Max RSS: ".concat((result.metrics.maxRss / 1024 / 1024).toFixed(2), "MB"));
        this.outputChannel.appendLine("Tokens/Second: ".concat(result.metrics.tokensPerSecond.toFixed(2)));
        this.outputChannel.appendLine('\nDetailed Metrics by Prompt Size:');
        result.metrics.promptSizeMetrics.forEach(function (metrics, size) {
            _this.outputChannel.appendLine("\nPrompt Size: ".concat(size, " chars"));
            _this.outputChannel.appendLine("  Avg Latency: ".concat(metrics.avgLatency.toFixed(2), "ms"));
            _this.outputChannel.appendLine("  P95 Latency: ".concat(metrics.p95Latency.toFixed(2), "ms"));
            _this.outputChannel.appendLine("  Avg Memory: ".concat((metrics.avgMemoryUsage / 1024 / 1024).toFixed(2), "MB"));
            _this.outputChannel.appendLine("  Tokens/Second: ".concat(metrics.avgTokensPerSecond.toFixed(2)));
        });
        this.outputChannel.appendLine('\nSystem Info:');
        this.outputChannel.appendLine("Platform: ".concat(result.systemInfo.platform));
        this.outputChannel.appendLine("CPU Cores: ".concat(result.systemInfo.cpuCores));
        this.outputChannel.appendLine("Total Memory: ".concat((result.systemInfo.totalMemory / 1024 / 1024 / 1024).toFixed(2), "GB"));
        this.outputChannel.appendLine("Node Version: ".concat(result.systemInfo.nodeVersion));
    };
    ModelBenchmarkManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelBenchmarkManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelBenchmarkManager.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.benchmarkCache.clear();
    };
    var _a;
    ModelBenchmarkManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object])
    ], ModelBenchmarkManager);
    return ModelBenchmarkManager;
}(events_1.EventEmitter));
exports.ModelBenchmarkManager = ModelBenchmarkManager;
