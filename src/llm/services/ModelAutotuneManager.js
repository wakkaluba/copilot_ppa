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
exports.ModelAutotuneManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
var ModelAutotuneManager = /** @class */ (function (_super) {
    __extends(ModelAutotuneManager, _super);
    function ModelAutotuneManager(logger, benchmarkManager) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.benchmarkManager = benchmarkManager;
        _this.optimizationCache = new Map();
        _this.isRunning = false;
        _this.outputChannel = vscode.window.createOutputChannel('Model Autotuning');
        return _this;
    }
    ModelAutotuneManager.prototype.optimizeModel = function (model_1) {
        return __awaiter(this, arguments, void 0, function (model, config) {
            var _a, maxIterations, _b, convergenceThreshold, _c, targetMetric, _d, parameterRanges, bestParams, bestScore, i, candidateParams, score, result, error_1;
            var _e;
            if (config === void 0) { config = {}; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (this.isRunning) {
                            throw new Error('Optimization already in progress');
                        }
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 8, 9, 10]);
                        this.isRunning = true;
                        this.emit('optimizationStarted', model.id);
                        _a = config.maxIterations, maxIterations = _a === void 0 ? 10 : _a, _b = config.convergenceThreshold, convergenceThreshold = _b === void 0 ? 0.01 : _b, _c = config.targetMetric, targetMetric = _c === void 0 ? 'tokensPerSecond' : _c, _d = config.parameterRanges, parameterRanges = _d === void 0 ? this.getDefaultParameterRanges(model) : _d;
                        bestParams = __assign({}, model.config);
                        return [4 /*yield*/, this.evaluateConfiguration(model, bestParams)];
                    case 2:
                        bestScore = _f.sent();
                        i = 0;
                        _f.label = 3;
                    case 3:
                        if (!(i < maxIterations)) return [3 /*break*/, 6];
                        candidateParams = this.generateNextParameters(bestParams, parameterRanges, i / maxIterations);
                        return [4 /*yield*/, this.evaluateConfiguration(model, candidateParams)];
                    case 4:
                        score = _f.sent();
                        if (score > bestScore * (1 + convergenceThreshold)) {
                            bestParams = candidateParams;
                            bestScore = score;
                            this.emit('betterConfigurationFound', {
                                modelId: model.id,
                                params: bestParams,
                                score: bestScore
                            });
                        }
                        this.emit('iterationCompleted', {
                            modelId: model.id,
                            iteration: i + 1,
                            currentScore: score,
                            bestScore: bestScore
                        });
                        _f.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        _e = {
                            modelId: model.id,
                            timestamp: new Date(),
                            bestConfiguration: bestParams,
                            score: bestScore
                        };
                        return [4 /*yield*/, this.gatherOptimizationMetrics(model, bestParams)];
                    case 7:
                        result = (_e.metrics = _f.sent(),
                            _e);
                        this.optimizationCache.set(model.id, result);
                        this.logOptimizationResult(result);
                        this.emit('optimizationCompleted', result);
                        return [2 /*return*/, result];
                    case 8:
                        error_1 = _f.sent();
                        this.handleError('Failed to optimize model', error_1);
                        throw error_1;
                    case 9:
                        this.isRunning = false;
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    ModelAutotuneManager.prototype.evaluateConfiguration = function (model, params) {
        return __awaiter(this, void 0, void 0, function () {
            var benchmarkResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.benchmarkManager.runBenchmark(__assign(__assign({}, model), { config: params }), { iterations: 3, warmupRuns: 1 })];
                    case 1:
                        benchmarkResult = _a.sent();
                        return [2 /*return*/, benchmarkResult.metrics.tokensPerSecond];
                }
            });
        });
    };
    ModelAutotuneManager.prototype.generateNextParameters = function (currentParams, ranges, progress) {
        var newParams = __assign({}, currentParams);
        var explorationFactor = Math.max(0.1, 1 - progress); // Reduce exploration over time
        for (var _i = 0, _a = ranges.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], param = _b[0], _c = _b[1], min = _c[0], max = _c[1];
            var range = max - min;
            var mutation = (Math.random() - 0.5) * range * explorationFactor;
            newParams[param] = Math.max(min, Math.min(max, currentParams[param] + mutation));
        }
        return newParams;
    };
    ModelAutotuneManager.prototype.getDefaultParameterRanges = function (model) {
        var ranges = new Map();
        ranges.set('temperature', [0.1, 1.0]);
        ranges.set('topP', [0.1, 1.0]);
        ranges.set('frequencyPenalty', [-2.0, 2.0]);
        ranges.set('presencePenalty', [-2.0, 2.0]);
        if (model.config.maxTokens) {
            var maxContextSize = model.contextLength || 4096;
            ranges.set('maxTokens', [256, maxContextSize]);
        }
        return ranges;
    };
    ModelAutotuneManager.prototype.gatherOptimizationMetrics = function (model, params) {
        return __awaiter(this, void 0, void 0, function () {
            var benchmark;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.benchmarkManager.runBenchmark(__assign(__assign({}, model), { config: params }), { iterations: 5, warmupRuns: 2 })];
                    case 1:
                        benchmark = _a.sent();
                        return [2 /*return*/, {
                                averageLatency: benchmark.metrics.averageLatency,
                                p95Latency: benchmark.metrics.p95Latency,
                                tokensPerSecond: benchmark.metrics.tokensPerSecond,
                                memoryUsage: benchmark.metrics.maxRss,
                                timestamp: new Date()
                            }];
                }
            });
        });
    };
    ModelAutotuneManager.prototype.getLastOptimization = function (modelId) {
        return this.optimizationCache.get(modelId);
    };
    ModelAutotuneManager.prototype.clearOptimizations = function () {
        this.optimizationCache.clear();
        this.emit('optimizationsCleared');
    };
    ModelAutotuneManager.prototype.logOptimizationResult = function (result) {
        var _this = this;
        this.outputChannel.appendLine('\nOptimization Results:');
        this.outputChannel.appendLine("Model: ".concat(result.modelId));
        this.outputChannel.appendLine("Timestamp: ".concat(new Date(result.timestamp).toISOString()));
        this.outputChannel.appendLine("Best Score: ".concat(result.score.toFixed(2)));
        this.outputChannel.appendLine('\nOptimized Configuration:');
        Object.entries(result.bestConfiguration).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            _this.outputChannel.appendLine("".concat(key, ": ").concat(value));
        });
        this.outputChannel.appendLine('\nPerformance Metrics:');
        this.outputChannel.appendLine("Average Latency: ".concat(result.metrics.averageLatency.toFixed(2), "ms"));
        this.outputChannel.appendLine("P95 Latency: ".concat(result.metrics.p95Latency.toFixed(2), "ms"));
        this.outputChannel.appendLine("Tokens/Second: ".concat(result.metrics.tokensPerSecond.toFixed(2)));
        this.outputChannel.appendLine("Memory Usage: ".concat((result.metrics.memoryUsage / 1024 / 1024).toFixed(2), "MB"));
    };
    ModelAutotuneManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelAutotuneManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelAutotuneManager.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.optimizationCache.clear();
    };
    var _a;
    ModelAutotuneManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelBenchmarkManager_1.ModelBenchmarkManager])
    ], ModelAutotuneManager);
    return ModelAutotuneManager;
}(events_1.EventEmitter));
exports.ModelAutotuneManager = ModelAutotuneManager;
