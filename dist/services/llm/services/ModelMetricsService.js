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
exports.ModelMetricsService = void 0;
const events_1 = require("events");
const inversify_1 = require("inversify");
const types_1 = require("../types");
let ModelMetricsService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelMetricsService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelMetricsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        storage;
        metrics = new Map();
        retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        aggregationInterval = 5 * 60 * 1000; // 5 minutes
        aggregationTimer = null;
        constructor(logger, storage) {
            super();
            this.logger = logger;
            this.storage = storage;
            this.startAggregation();
        }
        /**
         * Record metrics for a model
         */
        async recordMetrics(modelId, metrics) {
            try {
                const current = this.metrics.get(modelId) || this.createDefaultMetrics();
                const updated = {
                    ...current,
                    ...metrics,
                    lastUpdated: Date.now()
                };
                this.metrics.set(modelId, updated);
                await this.persistMetrics(modelId);
                this.emit(types_1.ModelEvents.MetricsUpdated, {
                    modelId,
                    metrics: updated
                });
            }
            catch (error) {
                this.handleError('Failed to record metrics', error);
                throw error;
            }
        }
        /**
         * Get current metrics for a model
         */
        getMetrics(modelId) {
            return this.metrics.get(modelId);
        }
        /**
         * Get aggregated metrics for all models
         */
        getAggregatedMetrics() {
            return new Map(this.metrics);
        }
        createDefaultMetrics() {
            return {
                requestCount: 0,
                successCount: 0,
                errorCount: 0,
                averageLatency: 0,
                tokenUsage: 0,
                memoryUsage: 0,
                lastUpdated: Date.now()
            };
        }
        async persistMetrics(modelId) {
            try {
                const metrics = this.metrics.get(modelId);
                if (metrics) {
                    await this.storage.set(`metrics:${modelId}`, metrics);
                }
            }
            catch (error) {
                this.handleError('Failed to persist metrics', error);
            }
        }
        startAggregation() {
            this.aggregationTimer = setInterval(() => {
                this.aggregateMetrics();
            }, this.aggregationInterval);
        }
        aggregateMetrics() {
            try {
                const now = Date.now();
                const cutoff = now - this.retentionPeriod;
                // Clean up old metrics
                for (const [modelId, metrics] of this.metrics.entries()) {
                    if (metrics.lastUpdated < cutoff) {
                        this.metrics.delete(modelId);
                        this.emit(types_1.ModelEvents.MetricsExpired, { modelId });
                    }
                }
                this.emit(types_1.ModelEvents.MetricsAggregated, {
                    timestamp: now,
                    metrics: this.getAggregatedMetrics()
                });
            }
            catch (error) {
                this.handleError('Failed to aggregate metrics', error);
            }
        }
        handleError(message, error) {
            this.logger.error(message, { error });
        }
        dispose() {
            if (this.aggregationTimer) {
                clearInterval(this.aggregationTimer);
                this.aggregationTimer = null;
            }
            this.removeAllListeners();
            this.metrics.clear();
        }
    };
    return ModelMetricsService = _classThis;
})();
exports.ModelMetricsService = ModelMetricsService;
//# sourceMappingURL=ModelMetricsService.js.map