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
exports.ModelScalingMetricsService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
let ModelScalingMetricsService = class ModelScalingMetricsService extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.metricsHistory = new Map();
        this.thresholds = new Map();
        this.retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        this.aggregationInterval = 60 * 1000; // 1 minute
        this.cleanupTimer = setInterval(() => this.cleanupOldMetrics(), this.retentionPeriod);
        this.initializeDefaultThresholds();
    }
    initializeDefaultThresholds() {
        const defaultThresholds = {
            performance: {
                maxResponseTime: 2000,
                minThroughput: 10,
                maxErrorRate: 0.05,
                maxRequestRate: 1000
            },
            resources: {
                maxCPU: 80,
                maxMemory: 85,
                maxGPU: 90,
                maxNetworkIO: 80
            },
            scaling: {
                maxQueueLength: 100,
                maxBacklog: 50,
                minAvailableNodes: 2
            }
        };
        this.thresholds.set('default', defaultThresholds);
    }
    // Add methods needed by the tests
    async updateMetrics(modelId, metrics) {
        try {
            await this.storeMetrics(modelId, metrics);
            await this.checkThresholds(modelId, metrics);
        }
        catch (error) {
            this.handleError(`Failed to update metrics for model ${modelId}`, error);
        }
    }
    getMetricsHistory(modelId, duration) {
        const history = this.metricsHistory.get(modelId) || [];
        if (!duration) {
            return history;
        }
        const cutoff = Date.now() - duration;
        return history.filter(m => m.timestamp >= cutoff);
    }
    async analyzePerformanceTrend(modelId) {
        const history = this.getMetricsHistory(modelId);
        if (history.length < 2) {
            return { degrading: false, recommendations: ['Not enough data for analysis'] };
        }
        // Sort by timestamp to ensure correct order
        history.sort((a, b) => a.timestamp - b.timestamp);
        const latest = history[history.length - 1];
        const previous = history[history.length - 2];
        const recommendations = [];
        let degrading = false;
        // Check response time trend
        if (latest.performance.responseTime > previous.performance.responseTime * 1.2) {
            degrading = true;
            recommendations.push('Response time increasing significantly');
        }
        // Check error rate trend
        if (latest.performance.errorRate > previous.performance.errorRate * 1.5) {
            degrading = true;
            recommendations.push('Error rate increasing significantly');
        }
        // Check resource utilization
        if (latest.resources.cpu > 75 || latest.resources.memory > 80) {
            recommendations.push('Consider scaling up');
            degrading = true;
        }
        return {
            degrading,
            recommendations
        };
    }
    async storeMetrics(modelId, metrics) {
        const history = this.metricsHistory.get(modelId) || [];
        history.push(metrics);
        this.metricsHistory.set(modelId, history);
        this.emit('metricsCollected', {
            modelId,
            metrics
        });
    }
    async checkThresholds(modelId, metrics) {
        const thresholds = this.thresholds.get(modelId) || this.thresholds.get('default');
        const violations = [];
        // Check performance thresholds
        if (metrics.performance.responseTime > thresholds.performance.maxResponseTime) {
            violations.push(`Response time ${metrics.performance.responseTime}ms exceeds threshold ${thresholds.performance.maxResponseTime}ms`);
        }
        if (metrics.performance.throughput < thresholds.performance.minThroughput) {
            violations.push(`Throughput ${metrics.performance.throughput} below threshold ${thresholds.performance.minThroughput}`);
        }
        // Check resource thresholds
        if (metrics.resources.cpu > thresholds.resources.maxCPU) {
            violations.push(`CPU usage ${metrics.resources.cpu}% exceeds threshold ${thresholds.resources.maxCPU}%`);
        }
        if (violations.length > 0) {
            this.emit('thresholdViolation', {
                modelId,
                violations,
                metrics
            });
        }
    }
    cleanupOldMetrics() {
        const cutoff = Date.now() - this.retentionPeriod;
        for (const [modelId, history] of this.metricsHistory.entries()) {
            const filteredHistory = history.filter(m => m.timestamp >= cutoff);
            if (filteredHistory.length !== history.length) {
                this.metricsHistory.set(modelId, filteredHistory);
                this.emit('metricsCleanup', {
                    modelId,
                    removed: history.length - filteredHistory.length
                });
            }
        }
    }
    setThresholds(modelId, thresholds) {
        this.thresholds.set(modelId, thresholds);
        this.emit('thresholdsUpdated', {
            modelId,
            thresholds
        });
    }
    handleError(message, error) {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }
    dispose() {
        clearInterval(this.cleanupTimer);
        this.removeAllListeners();
        this.metricsHistory.clear();
        this.thresholds.clear();
    }
};
ModelScalingMetricsService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object])
], ModelScalingMetricsService);
exports.ModelScalingMetricsService = ModelScalingMetricsService;
//# sourceMappingURL=ModelScalingMetricsService.js.map