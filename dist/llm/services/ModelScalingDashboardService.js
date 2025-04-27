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
exports.ModelScalingDashboardService = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../utils/logger");
const ModelScalingMetricsService_1 = require("./ModelScalingMetricsService");
const events_1 = require("events");
/**
 * Service for displaying scaling metrics in a dashboard
 */
let ModelScalingDashboardService = class ModelScalingDashboardService extends events_1.EventEmitter {
    constructor(logger, metricsService) {
        super();
        this.logger = logger;
        this.metricsService = metricsService;
        this.dashboardState = new Map();
        this.subscribedModels = new Set();
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
ModelScalingDashboardService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelScalingMetricsService_1.ModelScalingMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelScalingMetricsService_1.ModelScalingMetricsService])
], ModelScalingDashboardService);
exports.ModelScalingDashboardService = ModelScalingDashboardService;
//# sourceMappingURL=ModelScalingDashboardService.js.map