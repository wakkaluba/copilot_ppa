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
exports.ModelAutotuneService = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../../types");
var ModelMetricsManager_1 = require("./ModelMetricsManager");
var ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
var ModelPerformanceAnalyzer_1 = require("./ModelPerformanceAnalyzer");
var ModelAutotuneService = /** @class */ (function (_super) {
    __extends(ModelAutotuneService, _super);
    function ModelAutotuneService(logger, metricsManager, benchmarkManager, performanceAnalyzer) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsManager = metricsManager;
        _this.benchmarkManager = benchmarkManager;
        _this.performanceAnalyzer = performanceAnalyzer;
        _this.tuningHistory = new Map();
        _this.activeTuning = new Set();
        _this.outputChannel = vscode.window.createOutputChannel('Model Auto-tuning');
        return _this;
    }
    ModelAutotuneService.prototype.startAutotuning = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.activeTuning.has(modelId)) {
                            throw new Error('Auto-tuning already in progress');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        this.activeTuning.add(modelId);
                        this.emit('autotuningStarted', { modelId: modelId });
                        return [4 /*yield*/, this.runAutotuningCycle(modelId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        this.handleError("Auto-tuning failed for model ".concat(modelId), error_1);
                        throw error_1;
                    case 4:
                        this.activeTuning.delete(modelId);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelAutotuneService.prototype.runAutotuningCycle = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var baseMetrics, parameterRanges, currentParams, i, candidateParams, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.gatherBaselineMetrics(modelId)];
                    case 1:
                        baseMetrics = _a.sent();
                        parameterRanges = this.defineParameterSpace(baseMetrics);
                        currentParams = this.getCurrentParameters(modelId);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < 10)) return [3 /*break*/, 5];
                        candidateParams = this.generateNextParameters(currentParams, parameterRanges, i / 10);
                        return [4 /*yield*/, this.evaluateParameters(modelId, candidateParams)];
                    case 3:
                        result = _a.sent();
                        if (this.isBetterResult(result, this.getBestResult(modelId))) {
                            currentParams = candidateParams;
                            this.recordTuningResult(result);
                            this.emit('betterParametersFound', result);
                        }
                        this.emit('iterationCompleted', {
                            modelId: modelId,
                            iteration: i + 1,
                            currentParams: currentParams,
                            metrics: result.metrics
                        });
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelAutotuneService.prototype.gatherBaselineMetrics = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.metricsManager.getLatestMetrics(modelId)];
                    case 1:
                        metrics = _a.sent();
                        if (!metrics) {
                            throw new Error('No baseline metrics available');
                        }
                        return [2 /*return*/, metrics];
                }
            });
        });
    };
    ModelAutotuneService.prototype.defineParameterSpace = function (baseMetrics) {
        var ranges = new Map();
        ranges.set('temperature', [0.1, 1.0]);
        ranges.set('topP', [0.1, 1.0]);
        ranges.set('maxTokens', [256, 4096]);
        ranges.set('frequencyPenalty', [-2.0, 2.0]);
        ranges.set('presencePenalty', [-2.0, 2.0]);
        return ranges;
    };
    ModelAutotuneService.prototype.generateNextParameters = function (current, ranges, progress) {
        var params = __assign({}, current);
        var explorationFactor = Math.max(0.1, 1 - progress);
        for (var _i = 0, _a = ranges.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], param = _b[0], _c = _b[1], min = _c[0], max = _c[1];
            var range = max - min;
            var mutation = (Math.random() - 0.5) * range * explorationFactor;
            params[param] = Math.max(min, Math.min(max, (current[param] || (min + max) / 2) + mutation));
        }
        return params;
    };
    ModelAutotuneService.prototype.evaluateParameters = function (modelId, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var benchmark;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.benchmarkManager.runBenchmark({ id: modelId, parameters: parameters }, { iterations: 3, warmupRuns: 1 })];
                    case 1:
                        benchmark = _a.sent();
                        return [2 /*return*/, {
                                modelId: modelId,
                                timestamp: new Date(),
                                parameters: parameters,
                                metrics: {
                                    latency: benchmark.metrics.averageLatency,
                                    throughput: benchmark.metrics.tokensPerSecond,
                                    errorRate: 0, // Would come from error tracking
                                    memoryUsage: benchmark.metrics.maxRss
                                },
                                confidence: this.calculateConfidence(benchmark.metrics)
                            }];
                }
            });
        });
    };
    ModelAutotuneService.prototype.calculateConfidence = function (metrics) {
        // Normalize and weight different metrics
        var latencyScore = Math.max(0, 1 - metrics.averageLatency / 1000);
        var throughputScore = Math.min(metrics.tokensPerSecond / 100, 1);
        return (latencyScore * 0.4 + throughputScore * 0.6);
    };
    ModelAutotuneService.prototype.isBetterResult = function (current, previous) {
        if (!previous)
            return true;
        return current.confidence > previous.confidence;
    };
    ModelAutotuneService.prototype.getBestResult = function (modelId) {
        var history = this.tuningHistory.get(modelId) || [];
        return history.length > 0 ? history[history.length - 1] : undefined;
    };
    ModelAutotuneService.prototype.recordTuningResult = function (result) {
        var history = this.tuningHistory.get(result.modelId) || [];
        history.push(result);
        this.tuningHistory.set(result.modelId, history);
        this.logTuningResult(result);
    };
    ModelAutotuneService.prototype.getCurrentParameters = function (modelId) {
        var lastResult = this.getBestResult(modelId);
        return (lastResult === null || lastResult === void 0 ? void 0 : lastResult.parameters) || {
            temperature: 0.7,
            topP: 1.0,
            maxTokens: 2048,
            frequencyPenalty: 0,
            presencePenalty: 0
        };
    };
    ModelAutotuneService.prototype.logTuningResult = function (result) {
        var _this = this;
        this.outputChannel.appendLine('\nTuning Result:');
        this.outputChannel.appendLine("Model: ".concat(result.modelId));
        this.outputChannel.appendLine("Timestamp: ".concat(new Date(result.timestamp).toISOString()));
        this.outputChannel.appendLine("Confidence: ".concat(result.confidence.toFixed(4)));
        this.outputChannel.appendLine('\nParameters:');
        Object.entries(result.parameters).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            _this.outputChannel.appendLine("".concat(key, ": ").concat(value));
        });
        this.outputChannel.appendLine('\nMetrics:');
        Object.entries(result.metrics).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            _this.outputChannel.appendLine("".concat(key, ": ").concat(value));
        });
    };
    ModelAutotuneService.prototype.handleError = function (message, error) {
        this.logger.error(message, error);
        this.emit('error', { message: message, error: error });
    };
    ModelAutotuneService.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.tuningHistory.clear();
        this.activeTuning.clear();
        this.removeAllListeners();
    };
    var _a;
    ModelAutotuneService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
        __param(2, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
        __param(3, (0, inversify_1.inject)(ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelMetricsManager_1.ModelMetricsManager,
            ModelBenchmarkManager_1.ModelBenchmarkManager,
            ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer])
    ], ModelAutotuneService);
    return ModelAutotuneService;
}(events_1.EventEmitter));
exports.ModelAutotuneService = ModelAutotuneService;
