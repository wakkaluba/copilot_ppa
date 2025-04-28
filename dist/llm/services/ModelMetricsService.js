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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMetricsService = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../utils/logger");
const events_1 = require("events");
let ModelMetricsService = class ModelMetricsService extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.metricsByModel = new Map();
        this.latestMetrics = new Map();
        this.metricsRetentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
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
                timestamp: new Date()
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
exports.ModelMetricsService = ModelMetricsService;
exports.ModelMetricsService = ModelMetricsService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object])
], ModelMetricsService);
//# sourceMappingURL=ModelMetricsService.js.map