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
exports.ModelEvaluationService = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../../utils/logger");
var ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
var ModelMetricsService_1 = require("./ModelMetricsService");
var types_1 = require("../types");
var events_1 = require("events");
var ModelEvaluationService = /** @class */ (function (_super) {
    __extends(ModelEvaluationService, _super);
    function ModelEvaluationService(logger, benchmarkManager, metricsService) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.benchmarkManager = benchmarkManager;
        _this.metricsService = metricsService;
        _this.evaluationHistory = new Map();
        _this.activeEvaluations = new Set();
        return _this;
    }
    ModelEvaluationService.prototype.evaluateModel = function (modelId, request) {
        return __awaiter(this, void 0, void 0, function () {
            var benchmarkResult, metrics, result, history_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.activeEvaluations.has(modelId)) {
                            throw new Error("Evaluation already in progress for model ".concat(modelId));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        this.activeEvaluations.add(modelId);
                        this.emit(types_1.ModelEvents.EvaluationStarted, { modelId: modelId, request: request });
                        return [4 /*yield*/, this.benchmarkManager.runBenchmark(modelId)];
                    case 2:
                        benchmarkResult = _a.sent();
                        return [4 /*yield*/, this.metricsService.getMetrics(modelId)];
                    case 3:
                        metrics = _a.sent();
                        if (!metrics || !benchmarkResult) {
                            throw new Error("Unable to collect required data for model ".concat(modelId));
                        }
                        result = this.analyzeResults(modelId, benchmarkResult, metrics);
                        history_1 = this.evaluationHistory.get(modelId) || [];
                        history_1.push(result);
                        this.evaluationHistory.set(modelId, history_1);
                        this.emit(types_1.ModelEvents.EvaluationCompleted, { modelId: modelId, result: result });
                        return [2 /*return*/, result];
                    case 4:
                        error_1 = _a.sent();
                        this.handleError('Evaluation failed', error_1);
                        throw error_1;
                    case 5:
                        this.activeEvaluations.delete(modelId);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelEvaluationService.prototype.getEvaluationHistory = function (modelId) {
        return this.evaluationHistory.get(modelId) || [];
    };
    ModelEvaluationService.prototype.analyzeResults = function (modelId, benchmarkResult, metrics) {
        var performanceScore = this.calculatePerformanceScore(benchmarkResult);
        var reliabilityScore = this.calculateReliabilityScore(metrics);
        var efficiencyScore = this.calculateEfficiencyScore(benchmarkResult, metrics);
        var overallScore = (performanceScore + reliabilityScore + efficiencyScore) / 3;
        return {
            modelId: modelId,
            timestamp: new Date(),
            scores: {
                performance: performanceScore,
                reliability: reliabilityScore,
                efficiency: efficiencyScore,
                overall: overallScore
            },
            metrics: __assign(__assign({}, this.extractRelevantMetrics(metrics)), this.extractBenchmarkMetrics(benchmarkResult)),
            recommendations: this.generateRecommendations(performanceScore, reliabilityScore, efficiencyScore)
        };
    };
    ModelEvaluationService.prototype.calculatePerformanceScore = function (benchmarkResult) {
        // Calculate normalized performance score from benchmark results
        var latencyScore = this.normalizeScore(benchmarkResult.latency, 0, 2000);
        var throughputScore = this.normalizeScore(benchmarkResult.throughput, 0, 100);
        return (latencyScore + throughputScore) / 2;
    };
    ModelEvaluationService.prototype.calculateReliabilityScore = function (metrics) {
        // Calculate reliability score based on error rates and stability
        var errorRateScore = 1 - this.normalizeScore(metrics.errorRate, 0, 0.1);
        var stabilityScore = this.calculateStabilityScore(metrics);
        return (errorRateScore + stabilityScore) / 2;
    };
    ModelEvaluationService.prototype.calculateEfficiencyScore = function (benchmarkResult, metrics) {
        // Calculate efficiency score based on resource usage and throughput
        var resourceScore = this.normalizeScore(benchmarkResult.resourceUsage, 0, 100);
        var costScore = this.normalizeScore(metrics.costPerRequest || 0, 0, 0.1);
        return (resourceScore + costScore) / 2;
    };
    ModelEvaluationService.prototype.calculateStabilityScore = function (metrics) {
        if (!metrics.responseTimeHistory || metrics.responseTimeHistory.length < 2) {
            return 1;
        }
        // Calculate variance in response times
        var mean = metrics.responseTimeHistory.reduce(function (a, b) { return a + b; }, 0) / metrics.responseTimeHistory.length;
        var variance = metrics.responseTimeHistory.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / metrics.responseTimeHistory.length;
        // Convert variance to a 0-1 score where lower variance is better
        return 1 - this.normalizeScore(Math.sqrt(variance), 0, mean);
    };
    ModelEvaluationService.prototype.normalizeScore = function (value, min, max) {
        var normalized = (value - min) / (max - min);
        return Math.max(0, Math.min(1, normalized));
    };
    ModelEvaluationService.prototype.extractRelevantMetrics = function (metrics) {
        return {
            averageResponseTime: metrics.averageResponseTime,
            errorRate: metrics.errorRate,
            requestThroughput: metrics.requestsPerSecond || 0,
            tokenThroughput: metrics.tokensPerSecond || 0
        };
    };
    ModelEvaluationService.prototype.extractBenchmarkMetrics = function (benchmarkResult) {
        return {
            benchmarkLatency: benchmarkResult.latency,
            benchmarkThroughput: benchmarkResult.throughput,
            resourceUtilization: benchmarkResult.resourceUsage,
            memoryUsage: benchmarkResult.memoryUsage
        };
    };
    ModelEvaluationService.prototype.generateRecommendations = function (performanceScore, reliabilityScore, efficiencyScore) {
        var recommendations = [];
        if (performanceScore < 0.6) {
            recommendations.push('Consider optimizing model parameters for better performance', 'Evaluate hardware requirements and potential upgrades');
        }
        if (reliabilityScore < 0.7) {
            recommendations.push('Implement retry mechanism for failed requests', 'Monitor and adjust concurrent request limits');
        }
        if (efficiencyScore < 0.6) {
            recommendations.push('Review resource allocation and scaling policies', 'Consider implementing request batching');
        }
        return recommendations;
    };
    ModelEvaluationService.prototype.handleError = function (message, error) {
        this.logger.error(message, { error: error });
    };
    ModelEvaluationService.prototype.dispose = function () {
        this.removeAllListeners();
        this.evaluationHistory.clear();
        this.activeEvaluations.clear();
    };
    var _a, _b;
    ModelEvaluationService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
        __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ModelBenchmarkManager_1.ModelBenchmarkManager !== "undefined" && ModelBenchmarkManager_1.ModelBenchmarkManager) === "function" ? _b : Object, ModelMetricsService_1.ModelMetricsService])
    ], ModelEvaluationService);
    return ModelEvaluationService;
}(events_1.EventEmitter));
exports.ModelEvaluationService = ModelEvaluationService;
