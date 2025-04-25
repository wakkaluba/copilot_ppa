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
exports.ModelScalingDashboardService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
/**
 * Service for displaying scaling metrics in a dashboard
 */
let ModelScalingDashboardService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelScalingDashboardService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelScalingDashboardService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsService;
        dashboardState = new Map();
        subscribedModels = new Set();
        metricsListener;
        constructor(logger, metricsService) {
            super();
            this.logger = logger;
            this.metricsService = metricsService;
            this.logger.info('ModelScalingDashboardService initialized');
            this.setupListeners();
        }
        /**
         * Setup event listeners
         */
        setupListeners() {
            this.metricsListener = (event) => {
                const { modelId, metrics } = event;
                if (this.subscribedModels.has(modelId)) {
                    this.updateDashboard(modelId, metrics);
                }
            };
            this.metricsService.on('metricsCollected', this.metricsListener);
            this.metricsService.on('metricsUpdated', this.metricsListener);
        }
        /**
         * Show dashboard for a model
         */
        async showDashboard(modelId) {
            try {
                this.logger.info(`Showing dashboard for model: ${modelId}`);
                // Subscribe to updates for this model
                this.subscribedModels.add(modelId);
                // Get initial metrics
                const metrics = this.metricsService.getMetricsHistory(modelId);
                // Initialize dashboard
                this.dashboardState.set(modelId, {
                    modelId,
                    lastUpdated: Date.now(),
                    metrics: metrics.length > 0 ? metrics[metrics.length - 1] : null,
                    history: metrics
                });
                this.emit('dashboardOpened', { modelId });
            }
            catch (error) {
                this.logger.error(`Error showing dashboard for model ${modelId}`, error);
                throw error;
            }
        }
        /**
         * Update dashboard with new metrics
         */
        updateDashboard(modelId, metrics) {
            try {
                const dashboard = this.dashboardState.get(modelId) || {
                    modelId,
                    history: []
                };
                // Update dashboard state
                dashboard.lastUpdated = Date.now();
                dashboard.metrics = metrics;
                dashboard.history.push(metrics);
                // Cap history length to avoid memory issues
                if (dashboard.history.length > 100) {
                    dashboard.history = dashboard.history.slice(-100);
                }
                this.dashboardState.set(modelId, dashboard);
                this.logger.info(`Dashboard updated for model ${modelId}`, { timestamp: metrics.timestamp });
                this.emit('dashboardUpdated', { modelId, metrics });
            }
            catch (error) {
                this.logger.error(`Error updating dashboard for model ${modelId}`, error);
            }
        }
        /**
         * Get current dashboard state
         */
        getDashboard(modelId) {
            return this.dashboardState.get(modelId);
        }
        /**
         * Close dashboard for a model
         */
        closeDashboard(modelId) {
            this.subscribedModels.delete(modelId);
            this.emit('dashboardClosed', { modelId });
        }
        /**
         * Dispose of resources
         */
        dispose() {
            this.metricsService.removeListener('metricsCollected', this.metricsListener);
            this.metricsService.removeListener('metricsUpdated', this.metricsListener);
            this.removeAllListeners();
            this.subscribedModels.clear();
            this.dashboardState.clear();
            this.logger.info('ModelScalingDashboardService disposed');
        }
    };
    return ModelScalingDashboardService = _classThis;
})();
exports.ModelScalingDashboardService = ModelScalingDashboardService;
//# sourceMappingURL=ModelScalingDashboardService.js.map