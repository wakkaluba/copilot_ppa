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
exports.ModelAutoScalingService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelAutoScalingService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelAutoScalingService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelAutoScalingService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        healthMonitor;
        metricsService;
        scaleCheckInterval;
        scalingHistory = new Map();
        constructor(logger, healthMonitor, metricsService) {
            super();
            this.logger = logger;
            this.healthMonitor = healthMonitor;
            this.metricsService = metricsService;
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
                    timestamp: Date.now(),
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
    return ModelAutoScalingService = _classThis;
})();
exports.ModelAutoScalingService = ModelAutoScalingService;
//# sourceMappingURL=ModelAutoScalingService.js.map