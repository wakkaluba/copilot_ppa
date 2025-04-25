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
exports.ModelScalingMetricsService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelScalingMetricsService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelScalingMetricsService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelScalingMetricsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsHistory = new Map();
        thresholds = new Map();
        retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        aggregationInterval = 60 * 1000; // 1 minute
        cleanupTimer;
        constructor(logger) {
            super();
            this.logger = logger;
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
    return ModelScalingMetricsService = _classThis;
})();
exports.ModelScalingMetricsService = ModelScalingMetricsService;
//# sourceMappingURL=ModelScalingMetricsService.js.map