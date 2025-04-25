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
exports.ModelResourceOptimizer = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelResourceOptimizer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelResourceOptimizer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelResourceOptimizer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsService;
        healthMonitor;
        constructor(logger, metricsService, healthMonitor) {
            super();
            this.logger = logger;
            this.metricsService = metricsService;
            this.healthMonitor = healthMonitor;
        }
        async optimizeResources(modelId) {
            try {
                const metrics = await this.gatherMetrics(modelId);
                const recommendations = this.generateRecommendations(metrics);
                const result = {
                    modelId,
                    timestamp: Date.now(),
                    recommendations,
                    metrics,
                    confidence: this.calculateConfidence(recommendations)
                };
                this.emit('optimizationCompleted', result);
                return result;
            }
            catch (error) {
                this.handleError('Resource optimization failed', error);
                throw error;
            }
        }
        async gatherMetrics(modelId) {
            const metrics = await this.metricsService.getLatestMetrics();
            const modelMetrics = metrics.get(modelId);
            if (!modelMetrics) {
                throw new Error(`No metrics available for model ${modelId}`);
            }
            return {
                cpuUtilization: modelMetrics.resourceUtilization.cpu,
                memoryUtilization: modelMetrics.resourceUtilization.memory,
                gpuUtilization: modelMetrics.resourceUtilization.gpu,
                latency: modelMetrics.latency,
                throughput: modelMetrics.throughput,
                errorRate: modelMetrics.errorRate
            };
        }
        generateRecommendations(metrics) {
            const recommendations = [];
            // CPU optimization
            if (metrics.cpuUtilization > 80) {
                recommendations.push({
                    type: 'cpu',
                    currentValue: metrics.cpuUtilization,
                    recommendedValue: metrics.cpuUtilization * 1.5,
                    impact: 0.8,
                    reason: 'High CPU utilization detected'
                });
            }
            // Memory optimization
            if (metrics.memoryUtilization > 85) {
                recommendations.push({
                    type: 'memory',
                    currentValue: metrics.memoryUtilization,
                    recommendedValue: metrics.memoryUtilization * 1.3,
                    impact: 0.7,
                    reason: 'High memory usage detected'
                });
            }
            // GPU optimization if available
            if (metrics.gpuUtilization !== undefined && metrics.gpuUtilization < 50) {
                recommendations.push({
                    type: 'gpu',
                    currentValue: metrics.gpuUtilization,
                    recommendedValue: Math.min(metrics.gpuUtilization * 2, 100),
                    impact: 0.6,
                    reason: 'Low GPU utilization detected'
                });
            }
            // Batch size optimization based on latency and throughput
            if (metrics.latency > 100 && metrics.throughput < 1000) {
                recommendations.push({
                    type: 'batch',
                    currentValue: this.estimateCurrentBatchSize(metrics),
                    recommendedValue: this.calculateOptimalBatchSize(metrics),
                    impact: 0.5,
                    reason: 'Suboptimal batch size for current load'
                });
            }
            return recommendations;
        }
        estimateCurrentBatchSize(metrics) {
            return Math.ceil(metrics.throughput / (1000 / metrics.latency));
        }
        calculateOptimalBatchSize(metrics) {
            const baseBatch = Math.ceil(metrics.throughput / (500 / metrics.latency));
            return Math.min(Math.max(baseBatch, 1), 32);
        }
        calculateConfidence(recommendations) {
            if (recommendations.length === 0)
                return 1;
            const averageImpact = recommendations.reduce((sum, rec) => sum + rec.impact, 0) / recommendations.length;
            return Math.min(Math.max(averageImpact, 0), 1);
        }
        handleError(message, error) {
            this.logger.error(message, { error });
            this.emit('error', { message, error });
        }
    };
    return ModelResourceOptimizer = _classThis;
})();
exports.ModelResourceOptimizer = ModelResourceOptimizer;
//# sourceMappingURL=ModelResourceOptimizer.js.map