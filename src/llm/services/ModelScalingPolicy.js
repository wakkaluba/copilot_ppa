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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelScalingPolicy = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../utils/logger");
var events_1 = require("events");
var ModelScalingPolicy = /** @class */ (function (_super) {
    __extends(ModelScalingPolicy, _super);
    function ModelScalingPolicy(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.scalingRules = new Map();
        _this.recentDecisions = new Map();
        _this.decisionHistoryLimit = 20;
        _this.logger.info('ModelScalingPolicy initialized');
        _this.initializeDefaultRules();
        return _this;
    }
    ModelScalingPolicy.prototype.initializeDefaultRules = function () {
        // Define default scaling rules
        var defaultRules = [
            {
                name: 'high-cpu-utilization',
                description: 'Scale up when CPU utilization is high',
                condition: function (metrics) { return metrics.resources.cpu > 80; },
                action: 'scale_up',
                priority: 80,
                cooldownPeriod: 5 * 60 * 1000, // 5 minutes
                replicas: 1
            },
            {
                name: 'high-memory-utilization',
                description: 'Scale up when memory utilization is high',
                condition: function (metrics) { return metrics.resources.memory > 85; },
                action: 'scale_up',
                priority: 85,
                cooldownPeriod: 5 * 60 * 1000, // 5 minutes
                replicas: 1
            },
            {
                name: 'long-response-time',
                description: 'Scale up when response time exceeds threshold',
                condition: function (metrics) { return metrics.performance.responseTime > 1000; },
                action: 'scale_up',
                priority: 90,
                cooldownPeriod: 3 * 60 * 1000, // 3 minutes
                replicas: 1
            },
            {
                name: 'high-queue-length',
                description: 'Scale up when queue length is high',
                condition: function (metrics) { return metrics.scaling.queueLength > 50; },
                action: 'scale_up',
                priority: 95,
                cooldownPeriod: 2 * 60 * 1000, // 2 minutes
                replicas: 1
            },
            {
                name: 'low-cpu-utilization',
                description: 'Scale down when CPU utilization is low',
                condition: function (metrics) { return metrics.resources.cpu < 20 && metrics.scaling.currentNodes > 1; },
                action: 'scale_down',
                priority: 60,
                cooldownPeriod: 15 * 60 * 1000, // 15 minutes
                replicas: 1
            },
            {
                name: 'low-queue-length',
                description: 'Scale down when queue length is low',
                condition: function (metrics) { return metrics.scaling.queueLength < 5 && metrics.scaling.currentNodes > 1; },
                action: 'scale_down',
                priority: 50,
                cooldownPeriod: 10 * 60 * 1000, // 10 minutes
                replicas: 1
            }
        ];
        // Set defaults for all models
        this.scalingRules.set('default', defaultRules);
    };
    /**
     * Add or update scaling rules for a specific model
     */
    ModelScalingPolicy.prototype.setScalingRules = function (modelId, rules) {
        this.scalingRules.set(modelId, rules);
        this.logger.info("Set scaling rules for model ".concat(modelId), { rulesCount: rules.length });
        this.emit('rules.updated', { modelId: modelId, rules: rules });
    };
    /**
     * Get scaling rules for a model (or default if not set)
     */
    ModelScalingPolicy.prototype.getScalingRules = function (modelId) {
        return this.scalingRules.get(modelId) || this.scalingRules.get('default') || [];
    };
    /**
     * Evaluate metrics against rules to make a scaling decision
     */
    ModelScalingPolicy.prototype.evaluateScalingDecision = function (modelId, metrics) {
        try {
            this.logger.info("Evaluating scaling decision for model ".concat(modelId));
            var rules = this.getScalingRules(modelId);
            var now = Date.now();
            var applicableRules = [];
            // Find applicable rules that are not in cooldown
            for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
                var rule = rules_1[_i];
                var lastTriggered = rule.lastTriggeredTime || 0;
                var cooldownExpired = (now - lastTriggered) > rule.cooldownPeriod;
                if (cooldownExpired && rule.condition(metrics)) {
                    applicableRules.push(rule);
                }
            }
            if (applicableRules.length === 0) {
                return this.createDecision(modelId, 'no_action', 'No applicable rules', metrics);
            }
            // Sort by priority (highest first)
            applicableRules.sort(function (a, b) { return b.priority - a.priority; });
            var selectedRule = applicableRules[0];
            // Update last triggered time
            if (selectedRule) {
                selectedRule.lastTriggeredTime = now;
                var decision = this.createDecision(modelId, selectedRule.action, "Rule \"".concat(selectedRule.name, "\" triggered: ").concat(selectedRule.description), metrics, selectedRule);
                this.recordDecision(decision);
                this.logger.info("Scaling decision for model ".concat(modelId, ": ").concat(decision.action), {
                    reason: decision.reason,
                    rule: selectedRule.name
                });
                return decision;
            }
            // This should never happen since we check applicableRules.length above,
            // but this satisfies TypeScript's control flow analysis
            return this.createDecision(modelId, 'no_action', 'No applicable rule selected', metrics);
        }
        catch (error) {
            this.logger.error("Error evaluating scaling decision for model ".concat(modelId), error);
            // Return a safe default
            return this.createDecision(modelId, 'no_action', 'Error evaluating scaling rules', metrics);
        }
    };
    /**
     * Create a scaling decision object
     */
    ModelScalingPolicy.prototype.createDecision = function (modelId, action, reason, metrics, rule) {
        return {
            modelId: modelId,
            timestamp: new Date(),
            action: action,
            reason: reason,
            metrics: metrics,
            rule: rule,
            replicas: rule === null || rule === void 0 ? void 0 : rule.replicas,
            resources: rule === null || rule === void 0 ? void 0 : rule.resources
        };
    };
    /**
     * Record a scaling decision in history
     */
    ModelScalingPolicy.prototype.recordDecision = function (decision) {
        var modelId = decision.modelId;
        if (!this.recentDecisions.has(modelId)) {
            this.recentDecisions.set(modelId, []);
        }
        var decisions = this.recentDecisions.get(modelId);
        decisions.push(decision);
        // Limit the history size
        if (decisions.length > this.decisionHistoryLimit) {
            decisions.shift();
        }
        this.emit('decision.made', { decision: decision });
    };
    /**
     * Get recent scaling decisions for a model
     */
    ModelScalingPolicy.prototype.getRecentDecisions = function (modelId) {
        return this.recentDecisions.get(modelId) || [];
    };
    /**
     * Dispose of resources
     */
    ModelScalingPolicy.prototype.dispose = function () {
        this.removeAllListeners();
        this.scalingRules.clear();
        this.recentDecisions.clear();
        this.logger.info('ModelScalingPolicy disposed');
    };
    var _a;
    ModelScalingPolicy = __decorate([
        (0, inversify_1.injectable)(),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object])
    ], ModelScalingPolicy);
    return ModelScalingPolicy;
}(events_1.EventEmitter));
exports.ModelScalingPolicy = ModelScalingPolicy;
