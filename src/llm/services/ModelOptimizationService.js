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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelOptimizationService = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../../types");
var ModelMetricsManager_1 = require("./ModelMetricsManager");
var ModelPerformanceAnalyzer_1 = require("./ModelPerformanceAnalyzer");
var ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
var ModelOptimizationService = /** @class */ (function (_super) {
    __extends(ModelOptimizationService, _super);
    function ModelOptimizationService(logger, metricsManager, performanceAnalyzer, benchmarkManager) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsManager = metricsManager;
        _this.performanceAnalyzer = performanceAnalyzer;
        _this.benchmarkManager = benchmarkManager;
        _this.optimizationHistory = new Map();
        _this.activeOptimizations = new Set();
        _this.outputChannel = vscode.window.createOutputChannel('Model Optimization');
        return _this;
    }
    ModelOptimizationService.prototype.optimizeModel = function (modelId, currentMetrics) {
        return __awaiter(this, void 0, void 0, function () {
            var strategy, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.activeOptimizations.has(modelId)) {
                            throw new Error('Optimization already in progress');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        this.activeOptimizations.add(modelId);
                        this.emit('optimizationStarted', { modelId: modelId, metrics: currentMetrics });
                        return [4 /*yield*/, this.determineOptimizationStrategy(modelId, currentMetrics)];
                    case 2:
                        strategy = _a.sent();
                        return [4 /*yield*/, this.applyOptimization(modelId, strategy, currentMetrics)];
                    case 3:
                        result = _a.sent();
                        this.trackOptimizationResult(modelId, result);
                        return [2 /*return*/, result];
                    case 4:
                        error_1 = _a.sent();
                        this.handleError('Failed to optimize model', error_1);
                        throw error_1;
                    case 5:
                        this.activeOptimizations.delete(modelId);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelOptimizationService.prototype.determineOptimizationStrategy = function (modelId, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var strategies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generateOptimizationStrategies(metrics)];
                    case 1:
                        strategies = _a.sent();
                        return [2 /*return*/, this.selectBestStrategy(strategies, metrics)];
                }
            });
        });
    };
    ModelOptimizationService.prototype.generateOptimizationStrategies = function (metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var strategies;
            return __generator(this, function (_a) {
                strategies = [];
                // Memory optimization strategy
                if (metrics.memoryUsage > 85) {
                    strategies.push({
                        name: 'Memory Optimization',
                        description: 'Reduce memory usage through batch size and context length adjustments',
                        priority: metrics.memoryUsage > 90 ? 1 : 2,
                        parameters: {
                            batchSize: this.calculateOptimalBatchSize(metrics),
                            memoryLimit: this.calculateOptimalMemoryLimit(metrics),
                            maxContextLength: this.calculateOptimalContextLength(metrics)
                        }
                    });
                }
                // Throughput optimization strategy
                if (metrics.throughput < this.getTargetThroughput()) {
                    strategies.push({
                        name: 'Throughput Optimization',
                        description: 'Improve processing speed through parallel processing and caching',
                        priority: 2,
                        parameters: {
                            threads: this.calculateOptimalThreads(metrics),
                            batchSize: this.calculateOptimalBatchSize(metrics) * 1.2
                        }
                    });
                }
                // GPU utilization strategy
                if (metrics.gpuUsage !== undefined && metrics.gpuUsage < 60) {
                    strategies.push({
                        name: 'GPU Optimization',
                        description: 'Improve GPU utilization for better performance',
                        priority: 3,
                        parameters: {
                            gpuMemoryLimit: this.calculateOptimalGpuMemory(metrics),
                            batchSize: this.calculateOptimalBatchSize(metrics) * 1.5
                        }
                    });
                }
                return [2 /*return*/, strategies];
            });
        });
    };
    ModelOptimizationService.prototype.selectBestStrategy = function (strategies, metrics) {
        var _this = this;
        return strategies.sort(function (a, b) {
            // Sort by priority first
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            // Then by expected impact
            return _this.calculateExpectedImpact(b, metrics) - _this.calculateExpectedImpact(a, metrics);
        })[0];
    };
    ModelOptimizationService.prototype.calculateExpectedImpact = function (strategy, metrics) {
        var impact = 0;
        if (strategy.parameters.batchSize) {
            impact += 0.3 * (1 - metrics.throughput / this.getTargetThroughput());
        }
        if (strategy.parameters.threads) {
            impact += 0.3 * (1 - metrics.cpuUsage / 100);
        }
        if (strategy.parameters.memoryLimit) {
            impact += 0.4 * (metrics.memoryUsage / 100);
        }
        return impact;
    };
    ModelOptimizationService.prototype.applyOptimization = function (modelId, strategy, currentMetrics) {
        return __awaiter(this, void 0, void 0, function () {
            var newMetrics, improvements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logOptimizationStrategy(strategy);
                        // Apply the optimization parameters
                        return [4 /*yield*/, this.benchmarkManager.configureModel(modelId, strategy.parameters)];
                    case 1:
                        // Apply the optimization parameters
                        _a.sent();
                        return [4 /*yield*/, this.gatherMetrics(modelId)];
                    case 2:
                        newMetrics = _a.sent();
                        improvements = this.calculateImprovements(currentMetrics, newMetrics);
                        return [2 /*return*/, {
                                modelId: modelId,
                                timestamp: new Date(),
                                strategy: strategy,
                                metrics: newMetrics,
                                improvements: improvements,
                                confidence: this.calculateConfidence(improvements)
                            }];
                }
            });
        });
    };
    ModelOptimizationService.prototype.getTargetThroughput = function () {
        return 100; // tokens/second - would be configurable in practice
    };
    ModelOptimizationService.prototype.calculateOptimalBatchSize = function (metrics) {
        var baseBatch = Math.ceil(1000 / metrics.latency);
        return Math.min(Math.max(baseBatch, 1), 32);
    };
    ModelOptimizationService.prototype.calculateOptimalMemoryLimit = function (metrics) {
        return Math.floor(metrics.memoryUsage * 0.8); // 80% of current usage
    };
    ModelOptimizationService.prototype.calculateOptimalContextLength = function (metrics) {
        var baseContext = 2048;
        var memoryFactor = 1 - (metrics.memoryUsage / 100);
        return Math.floor(baseContext * memoryFactor);
    };
    ModelOptimizationService.prototype.calculateOptimalThreads = function (metrics) {
        var baseThreads = Math.ceil(metrics.cpuUsage / 25);
        return Math.min(Math.max(baseThreads, 1), 8);
    };
    ModelOptimizationService.prototype.calculateOptimalGpuMemory = function (metrics) {
        if (!metrics.gpuUsage) {
            return 0;
        }
        return Math.floor(metrics.gpuUsage * 0.9); // 90% of available GPU memory
    };
    ModelOptimizationService.prototype.gatherMetrics = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var performance, metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.performanceAnalyzer.analyzeModel(modelId)];
                    case 1:
                        performance = _a.sent();
                        return [4 /*yield*/, this.metricsManager.getMetrics(modelId)];
                    case 2:
                        metrics = _a.sent();
                        return [2 /*return*/, {
                                latency: performance.averageLatency,
                                throughput: performance.tokensPerSecond,
                                memoryUsage: metrics.memoryUsage,
                                cpuUsage: metrics.cpuUsage,
                                gpuUsage: metrics.gpuUsage,
                                errorRate: metrics.errorRate,
                                timestamp: new Date()
                            }];
                }
            });
        });
    };
    ModelOptimizationService.prototype.calculateImprovements = function (before, after) {
        return {
            latency: ((before.latency - after.latency) / before.latency) * 100,
            throughput: ((after.throughput - before.throughput) / before.throughput) * 100,
            memoryUsage: ((before.memoryUsage - after.memoryUsage) / before.memoryUsage) * 100,
            errorRate: ((before.errorRate - after.errorRate) / before.errorRate) * 100
        };
    };
    ModelOptimizationService.prototype.calculateConfidence = function (improvements) {
        var weights = {
            latency: 0.3,
            throughput: 0.3,
            memoryUsage: 0.2,
            errorRate: 0.2
        };
        var confidence = 0;
        var totalWeight = 0;
        for (var _i = 0, _a = Object.entries(improvements); _i < _a.length; _i++) {
            var _b = _a[_i], metric = _b[0], value = _b[1];
            if (value !== undefined) {
                confidence += (value * weights[metric]);
                totalWeight += weights[metric];
            }
        }
        return Math.max(0, Math.min(1, confidence / (totalWeight * 100)));
    };
    ModelOptimizationService.prototype.trackOptimizationResult = function (modelId, result) {
        var history = this.optimizationHistory.get(modelId) || [];
        history.push(result);
        this.optimizationHistory.set(modelId, history);
        this.logOptimizationResult(result);
        this.emit('optimizationCompleted', result);
    };
    ModelOptimizationService.prototype.logOptimizationStrategy = function (strategy) {
        var _this = this;
        this.outputChannel.appendLine('\nApplying Optimization Strategy:');
        this.outputChannel.appendLine("Name: ".concat(strategy.name));
        this.outputChannel.appendLine("Description: ".concat(strategy.description));
        this.outputChannel.appendLine("Priority: ".concat(strategy.priority));
        this.outputChannel.appendLine('Parameters:');
        Object.entries(strategy.parameters).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            _this.outputChannel.appendLine("  ".concat(key, ": ").concat(value));
        });
    };
    ModelOptimizationService.prototype.logOptimizationResult = function (result) {
        var _this = this;
        this.outputChannel.appendLine('\nOptimization Result:');
        this.outputChannel.appendLine("Model: ".concat(result.modelId));
        this.outputChannel.appendLine("Strategy: ".concat(result.strategy.name));
        this.outputChannel.appendLine('\nImprovements:');
        Object.entries(result.improvements).forEach(function (_a) {
            var metric = _a[0], value = _a[1];
            if (value !== undefined) {
                _this.outputChannel.appendLine("".concat(metric, ": ").concat(value.toFixed(2), "%"));
            }
        });
        this.outputChannel.appendLine("Confidence: ".concat((result.confidence * 100).toFixed(2), "%"));
    };
    ModelOptimizationService.prototype.handleError = function (message, error) {
        this.logger.error('[ModelOptimizationService]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelOptimizationService.prototype.getOptimizationHistory = function (modelId) {
        return this.optimizationHistory.get(modelId) || [];
    };
    ModelOptimizationService.prototype.clearOptimizationHistory = function (modelId) {
        if (modelId) {
            this.optimizationHistory.delete(modelId);
        }
        else {
            this.optimizationHistory.clear();
        }
    };
    ModelOptimizationService.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.optimizationHistory.clear();
        this.activeOptimizations.clear();
    };
    var _a;
    ModelOptimizationService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
        __param(2, (0, inversify_1.inject)(ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer)),
        __param(3, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelMetricsManager_1.ModelMetricsManager,
            ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer,
            ModelBenchmarkManager_1.ModelBenchmarkManager])
    ], ModelOptimizationService);
    return ModelOptimizationService;
}(events_1.EventEmitter));
exports.ModelOptimizationService = ModelOptimizationService;
