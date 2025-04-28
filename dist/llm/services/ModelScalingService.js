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
exports.ModelScalingService = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../utils/logger");
const events_1 = require("events");
const ModelScalingMetricsService_1 = require("./ModelScalingMetricsService");
const ModelScalingPolicy_1 = require("./ModelScalingPolicy");
const ModelDeploymentService_1 = require("./ModelDeploymentService");
const ModelScalingDashboardService_1 = require("./ModelScalingDashboardService");
let ModelScalingService = class ModelScalingService extends events_1.EventEmitter {
    constructor(logger, metricsService, scalingPolicy, deploymentService, dashboardService) {
        super();
        this.logger = logger;
        this.metricsService = metricsService;
        this.scalingPolicy = scalingPolicy;
        this.deploymentService = deploymentService;
        this.dashboardService = dashboardService;
        this.activeOperations = new Map();
        this.operationHistory = new Map();
        this.operationHistoryLimit = 50;
        this.automaticScalingEnabled = true;
        this.intervalId = null;
        this.checkInterval = 60 * 1000; // 1 minute
        this.logger.info('ModelScalingService initialized');
        // Subscribe to metrics updates
        this.metricsService.on('metricsCollected', this.handleMetricsCollected.bind(this));
        // Start automatic scaling check if enabled
        if (this.automaticScalingEnabled) {
            this.startAutomaticScaling();
        }
    }
    /**
     * Start the automatic scaling check process
     */
    startAutomaticScaling() {
        if (this.intervalId) {
            return;
        }
        this.intervalId = setInterval(() => this.checkScalingConditions(), this.checkInterval);
        this.logger.info('Automatic scaling check started');
        this.emit('scaling.automatic.started');
    }
    /**
     * Stop the automatic scaling check process
     */
    stopAutomaticScaling() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.logger.info('Automatic scaling check stopped');
            this.emit('scaling.automatic.stopped');
        }
    }
    /**
     * Handle incoming metrics and potentially trigger scaling
     */
    handleMetricsCollected(event) {
        const { modelId, metrics } = event;
        // Only process if automatic scaling is enabled
        if (this.automaticScalingEnabled) {
            this.evaluateAndScale(modelId, metrics);
        }
        // Update dashboard with the latest metrics
        this.dashboardService.updateModelMetrics(modelId, metrics);
    }
    /**
     * Check scaling conditions for all models with recent metrics
     */
    async checkScalingConditions() {
        try {
            const metricsMap = await this.metricsService.getLatestMetrics();
            for (const [modelId, metrics] of metricsMap.entries()) {
                await this.evaluateAndScale(modelId, metrics);
            }
        }
        catch (error) {
            this.logger.error('Error checking scaling conditions', error);
        }
    }
    /**
     * Evaluate scaling decision and execute if needed
     */
    async evaluateAndScale(modelId, metrics) {
        try {
            // Skip if there's already an active scaling operation for this model
            if (this.hasActiveOperation(modelId)) {
                return;
            }
            // Get scaling decision
            const decision = this.scalingPolicy.evaluateScalingDecision(modelId, metrics);
            // Only proceed if action is required
            if (decision.action === 'no_action') {
                return;
            }
            // Execute the scaling operation
            await this.executeScalingOperation(decision);
        }
        catch (error) {
            this.logger.error(`Error in evaluate and scale for model ${modelId}`, error);
        }
    }
    /**
     * Execute a scaling operation based on a decision
     */
    async executeScalingOperation(decision) {
        const { modelId, action, reason, metrics, replicas = 1 } = decision;
        try {
            // Get current deployment info
            const deployment = await this.deploymentService.getModelDeployment(modelId);
            if (!deployment) {
                throw new Error(`No deployment found for model ${modelId}`);
            }
            // Calculate target replicas
            const currentReplicas = deployment.replicas;
            let targetReplicas = currentReplicas;
            if (action === 'scale_up') {
                targetReplicas = currentReplicas + replicas;
            }
            else if (action === 'scale_down') {
                targetReplicas = Math.max(1, currentReplicas - replicas);
            }
            // If no change needed, skip
            if (targetReplicas === currentReplicas) {
                return this.createOperation({
                    modelId,
                    action,
                    status: 'completed',
                    currentReplicas,
                    targetReplicas,
                    reason: `${reason} (No change needed)`,
                    metrics
                });
            }
            // Create and record operation
            const operation = this.createOperation({
                modelId,
                action,
                status: 'pending',
                currentReplicas,
                targetReplicas,
                reason,
                metrics
            });
            this.recordOperation(operation);
            // Update status
            operation.status = 'in_progress';
            this.emit('scaling.started', { operation });
            // Execute the scaling through deployment service
            await this.deploymentService.scaleModelDeployment(modelId, targetReplicas);
            // Mark as completed
            operation.status = 'completed';
            operation.completedAt = Date.now();
            this.emit('scaling.completed', { operation });
            this.logger.info(`Scaling operation completed for model ${modelId}`, operation);
            // Update dashboard
            this.dashboardService.addScalingEvent(operation);
            return operation;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Create failed operation record
            const operation = this.createOperation({
                modelId,
                action,
                status: 'failed',
                currentReplicas: 0, // Will be updated if available
                targetReplicas: 0, // Will be updated if available
                reason,
                error: errorMessage,
                metrics
            });
            // Try to get current deployment info
            try {
                const deployment = await this.deploymentService.getModelDeployment(modelId);
                if (deployment) {
                    operation.currentReplicas = deployment.replicas;
                    operation.targetReplicas = deployment.replicas + (action === 'scale_up' ? replicas : -replicas);
                }
            }
            catch (deployError) {
                // Ignore secondary errors
            }
            this.recordOperation(operation);
            this.emit('scaling.failed', { operation, error });
            this.logger.error(`Scaling operation failed for model ${modelId}`, { operation, error });
            // Update dashboard
            this.dashboardService.addScalingEvent(operation);
            return operation;
        }
    }
    /**
     * Check if there's an active scaling operation for a model
     */
    hasActiveOperation(modelId) {
        for (const operation of this.activeOperations.values()) {
            if (operation.modelId === modelId &&
                (operation.status === 'pending' || operation.status === 'in_progress')) {
                return true;
            }
        }
        return false;
    }
    /**
     * Create a new scaling operation object
     */
    createOperation(params) {
        const operationId = `${params.modelId}-${Date.now()}`;
        return {
            id: operationId,
            modelId: params.modelId,
            timestamp: new Date(),
            status: params.status,
            action: params.action,
            currentReplicas: params.currentReplicas,
            targetReplicas: params.targetReplicas,
            reason: params.reason,
            metrics: params.metrics,
            error: params.error
        };
    }
    /**
     * Record a scaling operation
     */
    recordOperation(operation) {
        // Store in active operations if not completed/failed
        if (operation.status === 'pending' || operation.status === 'in_progress') {
            this.activeOperations.set(operation.id, operation);
        }
        else {
            // Remove from active operations if it was there
            this.activeOperations.delete(operation.id);
        }
        // Add to history
        if (!this.operationHistory.has(operation.modelId)) {
            this.operationHistory.set(operation.modelId, []);
        }
        const history = this.operationHistory.get(operation.modelId);
        history.push(operation);
        // Limit history size
        if (history.length > this.operationHistoryLimit) {
            history.shift();
        }
    }
    /**
     * Manually trigger scaling for a model
     */
    async scaleModel(modelId, replicas, reason = 'Manual scaling') {
        try {
            this.logger.info(`Manual scaling requested for model ${modelId} to ${replicas} replicas`);
            // Get current deployment info
            const deployment = await this.deploymentService.getModelDeployment(modelId);
            if (!deployment) {
                throw new Error(`No deployment found for model ${modelId}`);
            }
            const currentReplicas = deployment.replicas;
            // Determine action
            const action = replicas > currentReplicas ? 'scale_up' : 'scale_down';
            // Create and record operation
            const operation = this.createOperation({
                modelId,
                action,
                status: 'pending',
                currentReplicas,
                targetReplicas: replicas,
                reason: `Manual scaling: ${reason}`
            });
            this.recordOperation(operation);
            // Update status
            operation.status = 'in_progress';
            this.emit('scaling.started', { operation });
            // Execute the scaling through deployment service
            await this.deploymentService.scaleModelDeployment(modelId, replicas);
            // Mark as completed
            operation.status = 'completed';
            operation.completedAt = Date.now();
            this.emit('scaling.completed', { operation });
            this.logger.info(`Manual scaling operation completed for model ${modelId}`, operation);
            // Update dashboard
            this.dashboardService.addScalingEvent(operation);
            return operation;
        }
        catch (error) {
            this.logger.error(`Manual scaling operation failed for model ${modelId}`, error);
            throw error;
        }
    }
    /**
     * Get scaling operation history for a model
     */
    getScalingHistory(modelId) {
        return this.operationHistory.get(modelId) || [];
    }
    /**
     * Get all active scaling operations
     */
    getActiveOperations() {
        return Array.from(this.activeOperations.values());
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.stopAutomaticScaling();
        this.removeAllListeners();
        this.activeOperations.clear();
        this.operationHistory.clear();
        this.logger.info('ModelScalingService disposed');
    }
};
exports.ModelScalingService = ModelScalingService;
exports.ModelScalingService = ModelScalingService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelScalingMetricsService_1.ModelScalingMetricsService)),
    __param(2, (0, inversify_1.inject)(ModelScalingPolicy_1.ModelScalingPolicy)),
    __param(3, (0, inversify_1.inject)(ModelDeploymentService_1.ModelDeploymentService)),
    __param(4, (0, inversify_1.inject)(ModelScalingDashboardService_1.ModelScalingDashboardService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelScalingMetricsService_1.ModelScalingMetricsService,
        ModelScalingPolicy_1.ModelScalingPolicy,
        ModelDeploymentService_1.ModelDeploymentService,
        ModelScalingDashboardService_1.ModelScalingDashboardService])
], ModelScalingService);
//# sourceMappingURL=ModelScalingService.js.map