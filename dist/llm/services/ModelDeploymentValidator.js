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
exports.ModelDeploymentValidator = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelDeploymentValidator = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelDeploymentValidator = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelDeploymentValidator = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        healthMonitor;
        metricsService;
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
    return ModelDeploymentValidator = _classThis;
})();
exports.ModelDeploymentValidator = ModelDeploymentValidator;
//# sourceMappingURL=ModelDeploymentValidator.js.map