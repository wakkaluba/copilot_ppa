"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelEvaluationService = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../types");
const events_1 = require("events");
let ModelEvaluationService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelEvaluationService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelEvaluationService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
                timestamp: Date.now(),
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
    return ModelEvaluationService = _classThis;
})();
exports.ModelEvaluationService = ModelEvaluationService;
//# sourceMappingURL=ModelEvaluationService.js.map