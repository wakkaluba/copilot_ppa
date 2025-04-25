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
exports.ModelScalingValidatorService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelScalingValidatorService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelScalingValidatorService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelScalingValidatorService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        healthMonitor;
        metricsService;
        validationConfigs = new Map();
        rollbackConfigs = new Map();
        validationHistory = new Map();
        healthCheckTimers = new Map();
        constructor(logger, healthMonitor, metricsService) {
            super();
            this.logger = logger;
            this.healthMonitor = healthMonitor;
            this.metricsService = metricsService;
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
    return ModelScalingValidatorService = _classThis;
})();
exports.ModelScalingValidatorService = ModelScalingValidatorService;
//# sourceMappingURL=ModelScalingValidatorService.js.map