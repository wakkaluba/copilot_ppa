"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelScalingService = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../utils/logger");
var events_1 = require("events");
var ModelScalingMetricsService_1 = require("./ModelScalingMetricsService");
var ModelScalingPolicy_1 = require("./ModelScalingPolicy");
var ModelDeploymentService_1 = require("./ModelDeploymentService");
var ModelScalingDashboardService_1 = require("./ModelScalingDashboardService");
var ModelScalingService = /** @class */ (function (_super) {
    __extends(ModelScalingService, _super);
    function ModelScalingService(logger, metricsService, scalingPolicy, deploymentService, dashboardService) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsService = metricsService;
        _this.scalingPolicy = scalingPolicy;
        _this.deploymentService = deploymentService;
        _this.dashboardService = dashboardService;
        _this.activeOperations = new Map();
        _this.operationHistory = new Map();
        _this.operationHistoryLimit = 50;
        _this.automaticScalingEnabled = true;
        _this.intervalId = null;
        _this.checkInterval = 60 * 1000; // 1 minute
        _this.logger.info('ModelScalingService initialized');
        // Subscribe to metrics updates
        _this.metricsService.on('metricsCollected', _this.handleMetricsCollected.bind(_this));
        // Start automatic scaling check if enabled
        if (_this.automaticScalingEnabled) {
            _this.startAutomaticScaling();
        }
        return _this;
    }
    /**
     * Start the automatic scaling check process
     */
    ModelScalingService.prototype.startAutomaticScaling = function () {
        var _this = this;
        if (this.intervalId) {
            return;
        }
        this.intervalId = setInterval(function () { return _this.checkScalingConditions(); }, this.checkInterval);
        this.logger.info('Automatic scaling check started');
        this.emit('scaling.automatic.started');
    };
    /**
     * Stop the automatic scaling check process
     */
    ModelScalingService.prototype.stopAutomaticScaling = function () {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.logger.info('Automatic scaling check stopped');
            this.emit('scaling.automatic.stopped');
        }
    };
    /**
     * Handle incoming metrics and potentially trigger scaling
     */
    ModelScalingService.prototype.handleMetricsCollected = function (event) {
        var modelId = event.modelId, metrics = event.metrics;
        // Only process if automatic scaling is enabled
        if (this.automaticScalingEnabled) {
            this.evaluateAndScale(modelId, metrics);
        }
        // Update dashboard with the latest metrics
        this.dashboardService.updateModelMetrics(modelId, metrics);
    };
    /**
     * Check scaling conditions for all models with recent metrics
     */
    ModelScalingService.prototype.checkScalingConditions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metricsMap, _i, _a, _b, modelId, metrics, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.metricsService.getLatestMetrics()];
                    case 1:
                        metricsMap = _c.sent();
                        _i = 0, _a = metricsMap.entries();
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], modelId = _b[0], metrics = _b[1];
                        return [4 /*yield*/, this.evaluateAndScale(modelId, metrics)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _c.sent();
                        this.logger.error('Error checking scaling conditions', error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Evaluate scaling decision and execute if needed
     */
    ModelScalingService.prototype.evaluateAndScale = function (modelId, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var decision, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Skip if there's already an active scaling operation for this model
                        if (this.hasActiveOperation(modelId)) {
                            return [2 /*return*/];
                        }
                        decision = this.scalingPolicy.evaluateScalingDecision(modelId, metrics);
                        // Only proceed if action is required
                        if (decision.action === 'no_action') {
                            return [2 /*return*/];
                        }
                        // Execute the scaling operation
                        return [4 /*yield*/, this.executeScalingOperation(decision)];
                    case 1:
                        // Execute the scaling operation
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error("Error in evaluate and scale for model ".concat(modelId), error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a scaling operation based on a decision
     */
    ModelScalingService.prototype.executeScalingOperation = function (decision) {
        return __awaiter(this, void 0, void 0, function () {
            var modelId, action, reason, metrics, _a, replicas, deployment, currentReplicas, targetReplicas, operation, error_3, errorMessage, operation, deployment, deployError_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        modelId = decision.modelId, action = decision.action, reason = decision.reason, metrics = decision.metrics, _a = decision.replicas, replicas = _a === void 0 ? 1 : _a;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 9]);
                        return [4 /*yield*/, this.deploymentService.getModelDeployment(modelId)];
                    case 2:
                        deployment = _b.sent();
                        if (!deployment) {
                            throw new Error("No deployment found for model ".concat(modelId));
                        }
                        currentReplicas = deployment.replicas;
                        targetReplicas = currentReplicas;
                        if (action === 'scale_up') {
                            targetReplicas = currentReplicas + replicas;
                        }
                        else if (action === 'scale_down') {
                            targetReplicas = Math.max(1, currentReplicas - replicas);
                        }
                        // If no change needed, skip
                        if (targetReplicas === currentReplicas) {
                            return [2 /*return*/, this.createOperation({
                                    modelId: modelId,
                                    action: action,
                                    status: 'completed',
                                    currentReplicas: currentReplicas,
                                    targetReplicas: targetReplicas,
                                    reason: "".concat(reason, " (No change needed)"),
                                    metrics: metrics
                                })];
                        }
                        operation = this.createOperation({
                            modelId: modelId,
                            action: action,
                            status: 'pending',
                            currentReplicas: currentReplicas,
                            targetReplicas: targetReplicas,
                            reason: reason,
                            metrics: metrics
                        });
                        this.recordOperation(operation);
                        // Update status
                        operation.status = 'in_progress';
                        this.emit('scaling.started', { operation: operation });
                        // Execute the scaling through deployment service
                        return [4 /*yield*/, this.deploymentService.scaleModelDeployment(modelId, targetReplicas)];
                    case 3:
                        // Execute the scaling through deployment service
                        _b.sent();
                        // Mark as completed
                        operation.status = 'completed';
                        operation.completedAt = Date.now();
                        this.emit('scaling.completed', { operation: operation });
                        this.logger.info("Scaling operation completed for model ".concat(modelId), operation);
                        // Update dashboard
                        this.dashboardService.addScalingEvent(operation);
                        return [2 /*return*/, operation];
                    case 4:
                        error_3 = _b.sent();
                        errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                        operation = this.createOperation({
                            modelId: modelId,
                            action: action,
                            status: 'failed',
                            currentReplicas: 0, // Will be updated if available
                            targetReplicas: 0, // Will be updated if available
                            reason: reason,
                            error: errorMessage,
                            metrics: metrics
                        });
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.deploymentService.getModelDeployment(modelId)];
                    case 6:
                        deployment = _b.sent();
                        if (deployment) {
                            operation.currentReplicas = deployment.replicas;
                            operation.targetReplicas = deployment.replicas + (action === 'scale_up' ? replicas : -replicas);
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        deployError_1 = _b.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        this.recordOperation(operation);
                        this.emit('scaling.failed', { operation: operation, error: error_3 });
                        this.logger.error("Scaling operation failed for model ".concat(modelId), { operation: operation, error: error_3 });
                        // Update dashboard
                        this.dashboardService.addScalingEvent(operation);
                        return [2 /*return*/, operation];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if there's an active scaling operation for a model
     */
    ModelScalingService.prototype.hasActiveOperation = function (modelId) {
        for (var _i = 0, _a = this.activeOperations.values(); _i < _a.length; _i++) {
            var operation = _a[_i];
            if (operation.modelId === modelId &&
                (operation.status === 'pending' || operation.status === 'in_progress')) {
                return true;
            }
        }
        return false;
    };
    /**
     * Create a new scaling operation object
     */
    ModelScalingService.prototype.createOperation = function (params) {
        var operationId = "".concat(params.modelId, "-").concat(Date.now());
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
    };
    /**
     * Record a scaling operation
     */
    ModelScalingService.prototype.recordOperation = function (operation) {
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
        var history = this.operationHistory.get(operation.modelId);
        history.push(operation);
        // Limit history size
        if (history.length > this.operationHistoryLimit) {
            history.shift();
        }
    };
    /**
     * Manually trigger scaling for a model
     */
    ModelScalingService.prototype.scaleModel = function (modelId_1, replicas_1) {
        return __awaiter(this, arguments, void 0, function (modelId, replicas, reason) {
            var deployment, currentReplicas, action, operation, error_4;
            if (reason === void 0) { reason = 'Manual scaling'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.logger.info("Manual scaling requested for model ".concat(modelId, " to ").concat(replicas, " replicas"));
                        return [4 /*yield*/, this.deploymentService.getModelDeployment(modelId)];
                    case 1:
                        deployment = _a.sent();
                        if (!deployment) {
                            throw new Error("No deployment found for model ".concat(modelId));
                        }
                        currentReplicas = deployment.replicas;
                        action = replicas > currentReplicas ? 'scale_up' : 'scale_down';
                        operation = this.createOperation({
                            modelId: modelId,
                            action: action,
                            status: 'pending',
                            currentReplicas: currentReplicas,
                            targetReplicas: replicas,
                            reason: "Manual scaling: ".concat(reason)
                        });
                        this.recordOperation(operation);
                        // Update status
                        operation.status = 'in_progress';
                        this.emit('scaling.started', { operation: operation });
                        // Execute the scaling through deployment service
                        return [4 /*yield*/, this.deploymentService.scaleModelDeployment(modelId, replicas)];
                    case 2:
                        // Execute the scaling through deployment service
                        _a.sent();
                        // Mark as completed
                        operation.status = 'completed';
                        operation.completedAt = Date.now();
                        this.emit('scaling.completed', { operation: operation });
                        this.logger.info("Manual scaling operation completed for model ".concat(modelId), operation);
                        // Update dashboard
                        this.dashboardService.addScalingEvent(operation);
                        return [2 /*return*/, operation];
                    case 3:
                        error_4 = _a.sent();
                        this.logger.error("Manual scaling operation failed for model ".concat(modelId), error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get scaling operation history for a model
     */
    ModelScalingService.prototype.getScalingHistory = function (modelId) {
        return this.operationHistory.get(modelId) || [];
    };
    /**
     * Get all active scaling operations
     */
    ModelScalingService.prototype.getActiveOperations = function () {
        return Array.from(this.activeOperations.values());
    };
    /**
     * Dispose of resources
     */
    ModelScalingService.prototype.dispose = function () {
        this.stopAutomaticScaling();
        this.removeAllListeners();
        this.activeOperations.clear();
        this.operationHistory.clear();
        this.logger.info('ModelScalingService disposed');
    };
    var _a;
    ModelScalingService = __decorate([
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
    return ModelScalingService;
}(events_1.EventEmitter));
exports.ModelScalingService = ModelScalingService;
