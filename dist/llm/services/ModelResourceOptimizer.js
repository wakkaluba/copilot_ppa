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
exports.ModelResourceOptimizer = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
const ModelMetricsService_1 = require("./ModelMetricsService");
const ModelHealthMonitor_1 = require("./ModelHealthMonitor");
let ModelResourceOptimizer = class ModelResourceOptimizer extends events_1.EventEmitter {
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
                timestamp: new Date(),
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
exports.ModelResourceOptimizer = ModelResourceOptimizer;
exports.ModelResourceOptimizer = ModelResourceOptimizer = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __param(2, (0, inversify_1.inject)(ModelHealthMonitor_1.ModelHealthMonitor)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelMetricsService_1.ModelMetricsService, typeof (_b = typeof ModelHealthMonitor_1.ModelHealthMonitor !== "undefined" && ModelHealthMonitor_1.ModelHealthMonitor) === "function" ? _b : Object])
], ModelResourceOptimizer);
//# sourceMappingURL=ModelResourceOptimizer.js.map