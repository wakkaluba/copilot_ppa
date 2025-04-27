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
exports.ModelPerformanceTracker = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
const ModelHealthMonitor_1 = require("./ModelHealthMonitor");
const ModelMetricsService_1 = require("./ModelMetricsService");
let ModelPerformanceTracker = class ModelPerformanceTracker extends events_1.EventEmitter {
    constructor(logger, healthMonitor, metricsService) {
        super();
        this.logger = logger;
        this.healthMonitor = healthMonitor;
        this.metricsService = metricsService;
        this.metricsHistory = new Map();
        this.trackingInterval = setInterval(() => this.trackPerformance(), 30000);
    }
    async trackPerformance() {
        try {
            const metrics = await this.metricsService.getLatestMetrics();
            const health = await this.healthMonitor.getSystemHealth();
            for (const [modelId, modelMetrics] of metrics) {
                const performanceMetrics = this.calculatePerformanceMetrics(modelMetrics, health);
                this.updateMetricsHistory(modelId, performanceMetrics);
                this.emit('performanceUpdate', { modelId, metrics: performanceMetrics });
            }
        }
        catch (error) {
            this.handleError('Error tracking performance', error);
        }
    }
    calculatePerformanceMetrics(modelMetrics, healthStatus) {
        return {
            responseTime: this.calculateAverageResponseTime(modelMetrics),
            throughput: this.calculateThroughput(modelMetrics),
            errorRate: this.calculateErrorRate(modelMetrics),
            resourceUtilization: this.calculateResourceUtilization(healthStatus),
            requestCount: modelMetrics.requestCount || 0,
            successRate: this.calculateSuccessRate(modelMetrics)
        };
    }
    getPerformanceHistory(modelId, timeRange) {
        const history = this.metricsHistory.get(modelId) || [];
        if (!timeRange)
            return history;
        const cutoff = Date.now() - timeRange;
        return history.filter(metrics => metrics.timestamp > cutoff);
    }
    handleError(message, error) {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }
    dispose() {
        clearInterval(this.trackingInterval);
        this.removeAllListeners();
        this.metricsHistory.clear();
    }
};
ModelPerformanceTracker = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelHealthMonitor_1.ModelHealthMonitor)),
    __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ModelHealthMonitor_1.ModelHealthMonitor !== "undefined" && ModelHealthMonitor_1.ModelHealthMonitor) === "function" ? _b : Object, ModelMetricsService_1.ModelMetricsService])
], ModelPerformanceTracker);
exports.ModelPerformanceTracker = ModelPerformanceTracker;
//# sourceMappingURL=ModelPerformanceTracker.js.map