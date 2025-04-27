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
exports.ModelPerformanceTestService = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../../types");
var ModelMetricsManager_1 = require("./ModelMetricsManager");
var ModelPerformanceAnalyzer_1 = require("./ModelPerformanceAnalyzer");
var ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
var ModelPerformanceTestService = /** @class */ (function (_super) {
    __extends(ModelPerformanceTestService, _super);
    function ModelPerformanceTestService(logger, metricsManager, performanceAnalyzer, benchmarkManager) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsManager = metricsManager;
        _this.performanceAnalyzer = performanceAnalyzer;
        _this.benchmarkManager = benchmarkManager;
        _this.testResults = new Map();
        _this.isRunning = false;
        _this.outputChannel = vscode.window.createOutputChannel('Model Performance Tests');
        return _this;
    }
    ModelPerformanceTestService.prototype.runTestScenario = function (modelId, scenario) {
        return __awaiter(this, void 0, void 0, function () {
            var result, latencies, tokenRates, successCount, i, _i, _a, prompt_1, startTime, startMem, response, _b, seconds, nanoseconds, latency, memoryUsed, error_1, totalIterations, error_2;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (this.isRunning) {
                            throw new Error('Test already in progress');
                        }
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 11, 12, 13]);
                        this.isRunning = true;
                        this.emit('testStarted', { modelId: modelId, scenario: scenario });
                        result = {
                            scenarioName: scenario.name,
                            metrics: {
                                averageLatency: 0,
                                p95Latency: 0,
                                successRate: 0,
                                tokensPerSecond: 0,
                                memoryUsage: 0
                            },
                            timestamps: [],
                            errors: []
                        };
                        latencies = [];
                        tokenRates = [];
                        successCount = 0;
                        // Warm up runs
                        return [4 /*yield*/, this.runWarmup(modelId, scenario)];
                    case 2:
                        // Warm up runs
                        _e.sent();
                        i = 0;
                        _e.label = 3;
                    case 3:
                        if (!(i < scenario.config.repetitions)) return [3 /*break*/, 10];
                        _i = 0, _a = scenario.prompts;
                        _e.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        prompt_1 = _a[_i];
                        _e.label = 5;
                    case 5:
                        _e.trys.push([5, 7, , 8]);
                        startTime = process.hrtime();
                        startMem = process.memoryUsage().heapUsed;
                        return [4 /*yield*/, Promise.race([
                                this.performanceAnalyzer.analyzeModelResponse(modelId, prompt_1, scenario.config),
                                new Promise(function (_, reject) {
                                    return setTimeout(function () { return reject(new Error('Test timeout')); }, scenario.config.timeoutMs);
                                })
                            ])];
                    case 6:
                        response = _e.sent();
                        _b = process.hrtime(startTime), seconds = _b[0], nanoseconds = _b[1];
                        latency = seconds * 1000 + nanoseconds / 1000000;
                        memoryUsed = process.memoryUsage().heapUsed - startMem;
                        latencies.push(latency);
                        tokenRates.push(response.tokens / (latency / 1000));
                        result.timestamps.push(Date.now());
                        if (this.validateResponse(response.content, scenario.expectedPatterns)) {
                            successCount++;
                        }
                        this.emit('iterationCompleted', {
                            modelId: modelId,
                            scenario: scenario.name,
                            iteration: i + 1,
                            latency: latency,
                            memoryUsed: memoryUsed,
                            success: true
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _e.sent();
                        result.errors.push(error_1);
                        this.handleError('Test iteration failed', error_1);
                        this.emit('iterationCompleted', {
                            modelId: modelId,
                            scenario: scenario.name,
                            iteration: i + 1,
                            success: false,
                            error: error_1
                        });
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9:
                        i++;
                        return [3 /*break*/, 3];
                    case 10:
                        totalIterations = scenario.config.repetitions * scenario.prompts.length;
                        result.metrics = {
                            averageLatency: this.calculateAverage(latencies),
                            p95Latency: this.calculateP95(latencies),
                            successRate: (successCount / totalIterations) * 100,
                            tokensPerSecond: this.calculateAverage(tokenRates),
                            memoryUsage: process.memoryUsage().heapUsed
                        };
                        // Store and log results
                        (_d = (_c = this.testResults.get(modelId)) === null || _c === void 0 ? void 0 : _c.push(result)) !== null && _d !== void 0 ? _d : this.testResults.set(modelId, [result]);
                        this.logTestResult(modelId, result);
                        this.emit('testCompleted', { modelId: modelId, scenario: scenario, result: result });
                        return [2 /*return*/, result];
                    case 11:
                        error_2 = _e.sent();
                        this.handleError('Test scenario failed', error_2);
                        throw error_2;
                    case 12:
                        this.isRunning = false;
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    ModelPerformanceTestService.prototype.runWarmup = function (modelId, scenario) {
        return __awaiter(this, void 0, void 0, function () {
            var warmupRuns, warmupPrompt, i, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        warmupRuns = 2;
                        warmupPrompt = scenario.prompts[0];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < warmupRuns)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.performanceAnalyzer.analyzeModelResponse(modelId, warmupPrompt, scenario.config)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        this.logger.warn('Warmup run failed', error_3);
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelPerformanceTestService.prototype.validateResponse = function (content, patterns) {
        if (!patterns || patterns.length === 0) {
            return true;
        }
        return patterns.some(function (pattern) { return pattern.test(content); });
    };
    ModelPerformanceTestService.prototype.calculateAverage = function (numbers) {
        return numbers.reduce(function (a, b) { return a + b; }, 0) / numbers.length;
    };
    ModelPerformanceTestService.prototype.calculateP95 = function (numbers) {
        var sorted = __spreadArray([], numbers, true).sort(function (a, b) { return a - b; });
        var index = Math.ceil(numbers.length * 0.95) - 1;
        return sorted[index];
    };
    ModelPerformanceTestService.prototype.logTestResult = function (modelId, result) {
        var _this = this;
        this.outputChannel.appendLine('\nTest Results:');
        this.outputChannel.appendLine("Model: ".concat(modelId));
        this.outputChannel.appendLine("Scenario: ".concat(result.scenarioName));
        this.outputChannel.appendLine("Timestamp: ".concat(new Date().toISOString()));
        this.outputChannel.appendLine('\nMetrics:');
        this.outputChannel.appendLine("Average Latency: ".concat(result.metrics.averageLatency.toFixed(2), "ms"));
        this.outputChannel.appendLine("P95 Latency: ".concat(result.metrics.p95Latency.toFixed(2), "ms"));
        this.outputChannel.appendLine("Success Rate: ".concat(result.metrics.successRate.toFixed(2), "%"));
        this.outputChannel.appendLine("Tokens/Second: ".concat(result.metrics.tokensPerSecond.toFixed(2)));
        this.outputChannel.appendLine("Memory Usage: ".concat((result.metrics.memoryUsage / 1024 / 1024).toFixed(2), "MB"));
        if (result.errors.length > 0) {
            this.outputChannel.appendLine('\nErrors:');
            result.errors.forEach(function (error) {
                _this.outputChannel.appendLine("- ".concat(error.message));
            });
        }
    };
    ModelPerformanceTestService.prototype.handleError = function (message, error) {
        this.logger.error(message, error);
        this.emit('error', { message: message, error: error });
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelPerformanceTestService.prototype.getTestResults = function (modelId) {
        return this.testResults.get(modelId) || [];
    };
    ModelPerformanceTestService.prototype.clearTestResults = function (modelId) {
        if (modelId) {
            this.testResults.delete(modelId);
        }
        else {
            this.testResults.clear();
        }
        this.emit('resultsCleared', { modelId: modelId });
    };
    ModelPerformanceTestService.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.testResults.clear();
    };
    var _a;
    ModelPerformanceTestService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
        __param(2, (0, inversify_1.inject)(ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer)),
        __param(3, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelMetricsManager_1.ModelMetricsManager,
            ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer,
            ModelBenchmarkManager_1.ModelBenchmarkManager])
    ], ModelPerformanceTestService);
    return ModelPerformanceTestService;
}(events_1.EventEmitter));
exports.ModelPerformanceTestService = ModelPerformanceTestService;
