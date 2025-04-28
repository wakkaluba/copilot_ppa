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
exports.ModelScalingValidatorService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
const ModelHealthMonitorV2_1 = require("./ModelHealthMonitorV2");
const ModelMetricsService_1 = require("./ModelMetricsService");
let ModelScalingValidatorService = class ModelScalingValidatorService extends events_1.EventEmitter {
    constructor(logger, healthMonitor, metricsService) {
        super();
        this.logger = logger;
        this.healthMonitor = healthMonitor;
        this.metricsService = metricsService;
        this.validationConfigs = new Map();
        this.rollbackConfigs = new Map();
        this.validationHistory = new Map();
        this.healthCheckTimers = new Map();
        this.initializeDefaultConfigs();
    }
    initializeDefaultConfigs() {
        const defaultValidation = {
            preScaleValidation: true,
            postScaleValidation: true,
            healthCheckTimeout: 30000,
            metricThresholds: {
                maxErrorRate: 0.05,
                minAvailability: 0.99,
                maxLatency: 2000
            }
        };
        const defaultRollback = {
            automaticRollback: true,
            rollbackThreshold: 0.8,
            healthCheckInterval: 5000,
            maxRollbackAttempts: 3
        };
        this.validationConfigs.set('default', defaultValidation);
        this.rollbackConfigs.set('default', defaultRollback);
    }
    async validateScalingOperation(modelId, phase) {
        try {
            const config = this.validationConfigs.get(modelId) || this.validationConfigs.get('default');
            const metrics = await this.collectValidationMetrics(modelId);
            const issues = [];
            if (metrics.errorRate > config.metricThresholds.maxErrorRate) {
                issues.push(`Error rate ${metrics.errorRate} exceeds threshold ${config.metricThresholds.maxErrorRate}`);
            }
            if (metrics.availability < config.metricThresholds.minAvailability) {
                issues.push(`Availability ${metrics.availability} below threshold ${config.metricThresholds.minAvailability}`);
            }
            if (metrics.latency > config.metricThresholds.maxLatency) {
                issues.push(`Latency ${metrics.latency}ms exceeds threshold ${config.metricThresholds.maxLatency}ms`);
            }
            const result = {
                isValid: issues.length === 0,
                issues,
                metrics
            };
            this.logValidationResult(modelId, phase, result);
            this.storeValidationHistory(modelId, result);
            return result;
        }
        catch (error) {
            this.handleError('Validation failed', error);
            throw error;
        }
    }
    async collectValidationMetrics(modelId) {
        const health = this.healthMonitor.getHealth(modelId);
        const metrics = await this.metricsService.getLatestMetrics();
        const modelMetrics = metrics.get(modelId);
        if (!health || !modelMetrics) {
            throw new Error(`Unable to collect metrics for model ${modelId}`);
        }
        return {
            errorRate: health.metrics.errorRate,
            availability: this.calculateAvailability(health),
            latency: health.metrics.responseTime,
            resourceUtilization: modelMetrics.resourceUtilization || 0
        };
    }
    async startHealthCheck(modelId) {
        if (this.healthCheckTimers.has(modelId)) {
            return;
        }
        const config = this.rollbackConfigs.get(modelId) || this.rollbackConfigs.get('default');
        const timer = setInterval(async () => {
            try {
                await this.performHealthCheck(modelId);
            }
            catch (error) {
                this.handleError('Health check failed', error);
            }
        }, config.healthCheckInterval);
        this.healthCheckTimers.set(modelId, timer);
    }
    stopHealthCheck(modelId) {
        const timer = this.healthCheckTimers.get(modelId);
        if (timer) {
            clearInterval(timer);
            this.healthCheckTimers.delete(modelId);
        }
    }
    async performHealthCheck(modelId) {
        const result = await this.validateScalingOperation(modelId, 'post');
        const config = this.rollbackConfigs.get(modelId) || this.rollbackConfigs.get('default');
        if (!result.isValid && config.automaticRollback) {
            this.emit('rollbackNeeded', {
                modelId,
                reason: result.issues,
                metrics: result.metrics
            });
        }
    }
    calculateAvailability(health) {
        const total = health.metrics.successes + health.metrics.failures;
        return total === 0 ? 1 : health.metrics.successes / total;
    }
    storeValidationHistory(modelId, result) {
        const history = this.validationHistory.get(modelId) || [];
        history.push(result);
        this.validationHistory.set(modelId, history);
    }
    logValidationResult(modelId, phase, result) {
        this.logger.info(`Validation result for model ${modelId} (${phase})`, {
            isValid: result.isValid,
            issues: result.issues,
            metrics: result.metrics
        });
    }
    handleError(message, error) {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }
};
exports.ModelScalingValidatorService = ModelScalingValidatorService;
exports.ModelScalingValidatorService = ModelScalingValidatorService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelHealthMonitorV2_1.ModelHealthMonitorV2)),
    __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelHealthMonitorV2_1.ModelHealthMonitorV2,
        ModelMetricsService_1.ModelMetricsService])
], ModelScalingValidatorService);
//# sourceMappingURL=ModelScalingValidatorService.js.map