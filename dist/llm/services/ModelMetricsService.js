"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMetricsService = void 0;
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
class ModelMetricsService {
    collectionIntervalMs;
    _metricsEmitter = new events_1.EventEmitter();
    _metrics = new Map();
    _logger;
    _collectionInterval = null;
    constructor(collectionIntervalMs = 5000) {
        this.collectionIntervalMs = collectionIntervalMs;
        this._logger = logger_1.Logger.for('ModelMetricsService');
        this.startMetricsCollection();
    }
    async trackPerformance(modelId, metrics) {
        try {
            const currentMetrics = this._metrics.get(modelId) || this.createDefaultMetrics();
            currentMetrics.performance = {
                ...currentMetrics.performance,
                ...metrics,
                lastUpdated: new Date()
            };
            this._metrics.set(modelId, currentMetrics);
            this._metricsEmitter.emit('performanceUpdate', { modelId, metrics });
        }
        catch (error) {
            this._logger.error('Failed to track performance metrics', { modelId, error });
            throw error;
        }
    }
    async trackUsage(modelId, metrics) {
        try {
            const currentMetrics = this._metrics.get(modelId) || this.createDefaultMetrics();
            currentMetrics.usage = {
                ...currentMetrics.usage,
                ...metrics,
                lastUpdated: new Date()
            };
            this._metrics.set(modelId, currentMetrics);
            this._metricsEmitter.emit('usageUpdate', { modelId, metrics });
        }
        catch (error) {
            this._logger.error('Failed to track usage metrics', { modelId, error });
            throw error;
        }
    }
    onMetricsUpdated(listener) {
        this._metricsEmitter.on('metricsUpdated', listener);
        return {
            dispose: () => this._metricsEmitter.removeListener('metricsUpdated', listener)
        };
    }
    createDefaultMetrics() {
        return {
            performance: {
                responseTime: 0,
                throughput: 0,
                errorRate: 0,
                lastUpdated: new Date()
            },
            usage: {
                totalRequests: 0,
                totalTokens: 0,
                activeConnections: 0,
                lastUpdated: new Date()
            }
        };
    }
    startMetricsCollection() {
        if (this._collectionInterval) {
            return;
        }
        this._collectionInterval = setInterval(() => this.collectMetrics(), this.collectionIntervalMs);
    }
    async collectMetrics() {
        try {
            const timestamp = new Date();
            for (const [modelId, metrics] of this._metrics.entries()) {
                this._metricsEmitter.emit('metricsCollected', {
                    modelId,
                    metrics,
                    timestamp
                });
            }
        }
        catch (error) {
            this._logger.error('Failed to collect metrics', { error });
        }
    }
    dispose() {
        if (this._collectionInterval) {
            clearInterval(this._collectionInterval);
            this._collectionInterval = null;
        }
        this._metricsEmitter.removeAllListeners();
        this._metrics.clear();
    }
}
exports.ModelMetricsService = ModelMetricsService;
//# sourceMappingURL=ModelMetricsService.js.map