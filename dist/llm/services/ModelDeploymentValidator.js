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
exports.ModelDeploymentValidator = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
const ModelHealthMonitor_1 = require("./ModelHealthMonitor");
const ModelMetricsService_1 = require("./ModelMetricsService");
let ModelDeploymentValidator = class ModelDeploymentValidator extends events_1.EventEmitter {
    constructor(logger, healthMonitor, metricsService) {
        super();
        this.logger = logger;
        this.healthMonitor = healthMonitor;
        this.metricsService = metricsService;
    }
    async validateDeployment(modelId, config) {
        try {
            const healthStatus = await this.healthMonitor.getSystemHealth();
            const metrics = await this.metricsService.getLatestMetrics();
            const modelMetrics = metrics.get(modelId);
            const result = {
                isValid: true,
                issues: [],
                warnings: [],
                recommendations: []
            };
            // Validate health score
            if (healthStatus.healthScore < config.minHealthScore) {
                result.issues.push(`Health score ${healthStatus.healthScore} below minimum ${config.minHealthScore}`);
                result.isValid = false;
            }
            // Validate error rate
            if (modelMetrics?.errorRate > config.maxErrorRate) {
                result.issues.push(`Error rate ${modelMetrics.errorRate} exceeds maximum ${config.maxErrorRate}`);
                result.isValid = false;
            }
            // Validate availability
            if (modelMetrics?.availability < config.minAvailability) {
                result.issues.push(`Availability ${modelMetrics.availability} below minimum ${config.minAvailability}`);
                result.isValid = false;
            }
            // Resource utilization warnings
            this.validateResourceUtilization(modelMetrics?.resourceUtilization, config.resourceThresholds, result);
            this.emit('validationComplete', { modelId, result });
            return result;
        }
        catch (error) {
            this.handleError('Deployment validation failed', error);
            throw error;
        }
    }
    validateResourceUtilization(current, thresholds, result) {
        if (!current)
            return;
        if (current.cpu > thresholds.cpu) {
            result.warnings.push(`High CPU utilization: ${current.cpu}%`);
            result.recommendations.push('Consider scaling CPU resources');
        }
        if (current.memory > thresholds.memory) {
            result.warnings.push(`High memory utilization: ${current.memory}%`);
            result.recommendations.push('Consider scaling memory resources');
        }
        if (current.gpu && thresholds.gpu && current.gpu > thresholds.gpu) {
            result.warnings.push(`High GPU utilization: ${current.gpu}%`);
            result.recommendations.push('Consider scaling GPU resources');
        }
    }
    handleError(message, error) {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }
};
exports.ModelDeploymentValidator = ModelDeploymentValidator;
exports.ModelDeploymentValidator = ModelDeploymentValidator = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelHealthMonitor_1.ModelHealthMonitor)),
    __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ModelHealthMonitor_1.ModelHealthMonitor !== "undefined" && ModelHealthMonitor_1.ModelHealthMonitor) === "function" ? _b : Object, ModelMetricsService_1.ModelMetricsService])
], ModelDeploymentValidator);
//# sourceMappingURL=ModelDeploymentValidator.js.map