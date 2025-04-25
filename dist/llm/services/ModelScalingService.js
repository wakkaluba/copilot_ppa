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
exports.ModelScalingService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelScalingService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelScalingService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelScalingService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsService;
        scalingPolicy;
        deploymentService;
        dashboardService;
        activeOperations = new Map();
        operationHistory = new Map();
        operationHistoryLimit = 50;
        automaticScalingEnabled = true;
        intervalId = null;
        checkInterval = 60 * 1000; // 1 minute
        constructor(logger, metricsService, scalingPolicy, deploymentService, dashboardService) {
            super();
            this.logger = logger;
            this.metricsService = metricsService;
            this.scalingPolicy = scalingPolicy;
            this.deploymentService = deploymentService;
            this.dashboardService = dashboardService;
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
                timestamp: Date.now(),
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
    return ModelScalingService = _classThis;
})();
exports.ModelScalingService = ModelScalingService;
//# sourceMappingURL=ModelScalingService.js.map