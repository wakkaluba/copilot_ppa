"use strict";
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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelEvaluationService = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../../utils/logger");
const ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
const ModelMetricsService_1 = require("./ModelMetricsService");
const types_1 = require("../types");
const events_1 = require("events");
let ModelEvaluationService = class ModelEvaluationService extends events_1.EventEmitter {
    logger;
    benchmarkManager;
    metricsService;
    evaluationHistory = new Map();
    activeEvaluations = new Set();
    constructor(logger, benchmarkManager, metricsService) {
        super();
        this.logger = logger;
        this.benchmarkManager = benchmarkManager;
        this.metricsService = metricsService;
    }
    async evaluateModel(modelId, request) {
        if (this.activeEvaluations.has(modelId)) {
            throw new Error(`Evaluation already in progress for model ${modelId}`);
        }
        try {
            this.activeEvaluations.add(modelId);
            this.emit(types_1.ModelEvents.EvaluationStarted, { modelId, request });
            const benchmarkResult = await this.benchmarkManager.runBenchmark(modelId);
            const metrics = await this.metricsService.getMetrics(modelId);
            if (!metrics || !benchmarkResult) {
                throw new Error(`Unable to collect required data for model ${modelId}`);
            }
            const result = this.analyzeResults(modelId, benchmarkResult, metrics);
            // Store evaluation history
            const history = this.evaluationHistory.get(modelId) || [];
            history.push(result);
            this.evaluationHistory.set(modelId, history);
            this.emit(types_1.ModelEvents.EvaluationCompleted, { modelId, result });
            return result;
        }
        catch (error) {
            this.handleError('Evaluation failed', error);
            throw error;
        }
        finally {
            this.activeEvaluations.delete(modelId);
        }
    }
    getEvaluationHistory(modelId) {
        return this.evaluationHistory.get(modelId) || [];
    }
    analyzeResults(modelId, benchmarkResult, metrics) {
        const performanceScore = this.calculatePerformanceScore(benchmarkResult);
        const reliabilityScore = this.calculateReliabilityScore(metrics);
        const efficiencyScore = this.calculateEfficiencyScore(benchmarkResult, metrics);
        const overallScore = (performanceScore + reliabilityScore + efficiencyScore) / 3;
        return {
            modelId,
            timestamp: new Date(),
            scores: {
                performance: performanceScore,
                reliability: reliabilityScore,
                efficiency: efficiencyScore,
                overall: overallScore
            },
            metrics: {
                ...this.extractRelevantMetrics(metrics),
                ...this.extractBenchmarkMetrics(benchmarkResult)
            },
            recommendations: this.generateRecommendations(performanceScore, reliabilityScore, efficiencyScore)
        };
    }
    calculatePerformanceScore(benchmarkResult) {
        // Calculate normalized performance score from benchmark results
        const latencyScore = this.normalizeScore(benchmarkResult.latency, 0, 2000);
        const throughputScore = this.normalizeScore(benchmarkResult.throughput, 0, 100);
        return (latencyScore + throughputScore) / 2;
    }
    calculateReliabilityScore(metrics) {
        // Calculate reliability score based on error rates and stability
        const errorRateScore = 1 - this.normalizeScore(metrics.errorRate, 0, 0.1);
        const stabilityScore = this.calculateStabilityScore(metrics);
        return (errorRateScore + stabilityScore) / 2;
    }
    calculateEfficiencyScore(benchmarkResult, metrics) {
        // Calculate efficiency score based on resource usage and throughput
        const resourceScore = this.normalizeScore(benchmarkResult.resourceUsage, 0, 100);
        const costScore = this.normalizeScore(metrics.costPerRequest || 0, 0, 0.1);
        return (resourceScore + costScore) / 2;
    }
    calculateStabilityScore(metrics) {
        if (!metrics.responseTimeHistory || metrics.responseTimeHistory.length < 2) {
            return 1;
        }
        // Calculate variance in response times
        const mean = metrics.responseTimeHistory.reduce((a, b) => a + b, 0) / metrics.responseTimeHistory.length;
        const variance = metrics.responseTimeHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / metrics.responseTimeHistory.length;
        // Convert variance to a 0-1 score where lower variance is better
        return 1 - this.normalizeScore(Math.sqrt(variance), 0, mean);
    }
    normalizeScore(value, min, max) {
        const normalized = (value - min) / (max - min);
        return Math.max(0, Math.min(1, normalized));
    }
    extractRelevantMetrics(metrics) {
        return {
            averageResponseTime: metrics.averageResponseTime,
            errorRate: metrics.errorRate,
            requestThroughput: metrics.requestsPerSecond || 0,
            tokenThroughput: metrics.tokensPerSecond || 0
        };
    }
    extractBenchmarkMetrics(benchmarkResult) {
        return {
            benchmarkLatency: benchmarkResult.latency,
            benchmarkThroughput: benchmarkResult.throughput,
            resourceUtilization: benchmarkResult.resourceUsage,
            memoryUsage: benchmarkResult.memoryUsage
        };
    }
    generateRecommendations(performanceScore, reliabilityScore, efficiencyScore) {
        const recommendations = [];
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
    }
    handleError(message, error) {
        this.logger.error(message, { error });
    }
    dispose() {
        this.removeAllListeners();
        this.evaluationHistory.clear();
        this.activeEvaluations.clear();
    }
};
exports.ModelEvaluationService = ModelEvaluationService;
exports.ModelEvaluationService = ModelEvaluationService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
    __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ModelBenchmarkManager_1.ModelBenchmarkManager !== "undefined" && ModelBenchmarkManager_1.ModelBenchmarkManager) === "function" ? _b : Object, ModelMetricsService_1.ModelMetricsService])
], ModelEvaluationService);
//# sourceMappingURL=ModelEvaluationService.js.map