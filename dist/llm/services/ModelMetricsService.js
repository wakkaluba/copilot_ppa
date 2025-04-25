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
exports.ModelMetricsService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelMetricsService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelMetricsService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelMetricsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsByModel = new Map();
        latestMetrics = new Map();
        metricsRetentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        cleanupInterval;
        constructor(logger) {
            super();
            this.logger = logger;
            this.logger.info('ModelMetricsService initialized');
            // Set up periodic cleanup of old metrics
            this.cleanupInterval = setInterval(() => this.cleanupOldMetrics(), this.metricsRetentionPeriod);
        }
        /**
         * Record new metrics for a model
         */
        async recordMetrics(metrics) {
            try {
                const { modelId } = metrics;
                if (!modelId) {
                    throw new Error('Model ID is required for metrics recording');
                }
                // Ensure we have a metrics array for this model
                if (!this.metricsByModel.has(modelId)) {
                    this.metricsByModel.set(modelId, []);
                }
                // Add timestamp if not present
                if (!metrics.timestamp) {
                    metrics.timestamp = Date.now();
                }
                // Add to metrics history
                const modelMetrics = this.metricsByModel.get(modelId);
                modelMetrics.push(metrics);
                // Update latest metrics
                this.latestMetrics.set(modelId, metrics);
                // Emit event
                this.emit('metrics.recorded', { modelId, metrics });
                this.logger.info(`Recorded metrics for model ${modelId}`, metrics);
            }
            catch (error) {
                this.logger.error('Error recording model metrics', error);
                throw error;
            }
        }
        /**
         * Get metrics history for a model
         */
        async getMetricsHistory(modelId, timeRange) {
            try {
                const metrics = this.metricsByModel.get(modelId) || [];
                if (!timeRange) {
                    return metrics;
                }
                const cutoffTime = Date.now() - timeRange;
                return metrics.filter(m => m.timestamp >= cutoffTime);
            }
            catch (error) {
                this.logger.error(`Error getting metrics history for model ${modelId}`, error);
                throw error;
            }
        }
        /**
         * Get the latest metrics for all models
         */
        async getLatestMetrics() {
            return new Map(this.latestMetrics);
        }
        /**
         * Get the latest metrics for a specific model
         */
        async getLatestMetricsForModel(modelId) {
            return this.latestMetrics.get(modelId) || null;
        }
        /**
         * Calculate aggregated metrics for a model over a time period
         */
        async getAggregateMetrics(modelId, timeRange) {
            try {
                const metrics = await this.getMetricsHistory(modelId, timeRange);
                if (metrics.length === 0) {
                    return null;
                }
                // Calculate aggregates
                let totalResponseTime = 0;
                let totalRequests = 0;
                let totalErrors = 0;
                let totalTokens = 0;
                let totalPromptTokens = 0;
                let totalCompletionTokens = 0;
                const responseTimes = [];
                for (const metric of metrics) {
                    totalResponseTime += metric.averageResponseTime;
                    totalRequests += metric.successfulRequests + metric.failedRequests;
                    totalErrors += metric.failedRequests;
                    totalTokens += metric.totalTokens;
                    totalPromptTokens += metric.promptTokens;
                    totalCompletionTokens += metric.completionTokens;
                    // Store response times for percentile calculation
                    responseTimes.push(metric.averageResponseTime);
                }
                // Sort for percentile
                responseTimes.sort((a, b) => a - b);
                // Calculate p95
                const p95Index = Math.floor(responseTimes.length * 0.95);
                const p95ResponseTime = responseTimes[p95Index] || 0;
                return {
                    modelId,
                    averageResponseTime: totalRequests > 0 ? totalResponseTime / metrics.length : 0,
                    p95ResponseTime,
                    requestRate: totalRequests / (timeRange / 1000), // Requests per second
                    errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
                    successfulRequests: totalRequests - totalErrors,
                    failedRequests: totalErrors,
                    totalTokens,
                    promptTokens: totalPromptTokens,
                    completionTokens: totalCompletionTokens,
                    timestamp: Date.now()
                };
            }
            catch (error) {
                this.logger.error(`Error calculating aggregate metrics for model ${modelId}`, error);
                throw error;
            }
        }
        /**
         * Clean up old metrics beyond retention period
         */
        cleanupOldMetrics() {
            try {
                const cutoffTime = Date.now() - this.metricsRetentionPeriod;
                for (const [modelId, metrics] of this.metricsByModel.entries()) {
                    const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);
                    if (filteredMetrics.length !== metrics.length) {
                        this.metricsByModel.set(modelId, filteredMetrics);
                        this.logger.info(`Cleaned up old metrics for model ${modelId}`, {
                            removed: metrics.length - filteredMetrics.length,
                            remaining: filteredMetrics.length
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error('Error during metrics cleanup', error);
            }
        }
        /**
         * Dispose of resources
         */
        dispose() {
            clearInterval(this.cleanupInterval);
            this.removeAllListeners();
            this.metricsByModel.clear();
            this.latestMetrics.clear();
            this.logger.info('ModelMetricsService disposed');
        }
    };
    return ModelMetricsService = _classThis;
})();
exports.ModelMetricsService = ModelMetricsService;
//# sourceMappingURL=ModelMetricsService.js.map