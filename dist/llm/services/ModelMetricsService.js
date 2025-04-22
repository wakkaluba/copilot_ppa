"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMetricsService = void 0;
const events_1 = require("events");
/**
 * Service for tracking model performance metrics
 */
class ModelMetricsService {
    metrics = new Map();
    eventEmitter = new events_1.EventEmitter();
    /**
     * Record metrics for a model invocation
     */
    recordMetrics(modelId, responseTime, tokens, error) {
        let modelMetrics = this.metrics.get(modelId);
        if (!modelMetrics) {
            modelMetrics = {
                averageResponseTime: 0,
                tokenThroughput: 0,
                errorRate: 0,
                totalRequests: 0,
                totalTokens: 0,
                lastUsed: new Date()
            };
            this.metrics.set(modelId, modelMetrics);
        }
        // Update metrics
        modelMetrics.totalRequests++;
        modelMetrics.totalTokens += tokens;
        const oldLastUsed = modelMetrics.lastUsed;
        modelMetrics.lastUsed = new Date();
        // Update moving averages
        modelMetrics.averageResponseTime = this.calculateMovingAverage(modelMetrics.averageResponseTime, responseTime, modelMetrics.totalRequests);
        const timespan = (modelMetrics.lastUsed.getTime() - oldLastUsed.getTime()) / 1000;
        if (timespan > 0) {
            modelMetrics.tokenThroughput = tokens / timespan;
        }
        if (error) {
            modelMetrics.errorRate = this.calculateMovingAverage(modelMetrics.errorRate, 1, modelMetrics.totalRequests);
        }
        this.eventEmitter.emit('metricsUpdated', modelId, modelMetrics);
    }
    /**
     * Get metrics for a specific model
     */
    getMetrics(modelId) {
        return this.metrics.get(modelId);
    }
    /**
     * Get metrics for all models
     */
    getAllMetrics() {
        return new Map(this.metrics);
    }
    /**
     * Reset metrics for a model
     */
    resetMetrics(modelId) {
        this.metrics.delete(modelId);
        this.eventEmitter.emit('metricsReset', modelId);
    }
    /**
     * Clear all metrics
     */
    clearAllMetrics() {
        this.metrics.clear();
        this.eventEmitter.emit('metricsCleared');
    }
    /**
     * Subscribe to metrics updates
     */
    onMetricsUpdated(listener) {
        this.eventEmitter.on('metricsUpdated', listener);
    }
    calculateMovingAverage(currentAvg, newValue, totalSamples) {
        return ((currentAvg * (totalSamples - 1)) + newValue) / totalSamples;
    }
    dispose() {
        this.eventEmitter.removeAllListeners();
    }
}
exports.ModelMetricsService = ModelMetricsService;
//# sourceMappingURL=ModelMetricsService.js.map