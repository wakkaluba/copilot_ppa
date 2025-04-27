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
exports.ModelAutoScalingService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
const ModelHealthMonitor_1 = require("./ModelHealthMonitor");
const ModelMetricsService_1 = require("./ModelMetricsService");
let ModelAutoScalingService = class ModelAutoScalingService extends events_1.EventEmitter {
    constructor(logger, healthMonitor, metricsService) {
        super();
        this.logger = logger;
        this.healthMonitor = healthMonitor;
        this.metricsService = metricsService;
        this.scalingHistory = new Map();
        this.scaleCheckInterval = setInterval(() => this.checkScaling(), 60000);
    }
    async enableAutoScaling(modelId, config) {
        try {
            await this.validateConfig(config);
            await this.applyScalingConfig(modelId, config);
            this.emit('autoScalingEnabled', { modelId, config });
        }
        catch (error) {
            this.handleError('Failed to enable auto-scaling', error);
            throw error;
        }
    }
    async checkScaling() {
        try {
            const metrics = await this.metricsService.getLatestMetrics();
            const healthStatus = await this.healthMonitor.getSystemHealth();
            for (const [modelId, modelMetrics] of metrics) {
                const scalingDecision = this.calculateScalingDecision(modelMetrics, healthStatus);
                if (scalingDecision.shouldScale) {
                    await this.executeScaling(modelId, scalingDecision);
                }
            }
        }
        catch (error) {
            this.handleError('Error during scaling check', error);
        }
    }
    async executeScaling(modelId, decision) {
        try {
            const scalingEvent = {
                timestamp: new Date(),
                type: decision.scaleUp ? 'scaleUp' : 'scaleDown',
                reason: decision.reason,
                metrics: decision.metrics
            };
            await this.performScaling(modelId, decision);
            this.recordScalingEvent(modelId, scalingEvent);
            this.emit('scaled', { modelId, event: scalingEvent });
        }
        catch (error) {
            this.handleError(`Failed to execute scaling for model ${modelId}`, error);
        }
    }
    handleError(message, error) {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }
    dispose() {
        clearInterval(this.scaleCheckInterval);
        this.removeAllListeners();
        this.scalingHistory.clear();
    }
};
ModelAutoScalingService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelHealthMonitor_1.ModelHealthMonitor)),
    __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ModelHealthMonitor_1.ModelHealthMonitor !== "undefined" && ModelHealthMonitor_1.ModelHealthMonitor) === "function" ? _b : Object, ModelMetricsService_1.ModelMetricsService])
], ModelAutoScalingService);
exports.ModelAutoScalingService = ModelAutoScalingService;
//# sourceMappingURL=ModelAutoScalingService.js.map