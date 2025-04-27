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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelScalingPolicy = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../utils/logger");
const events_1 = require("events");
let ModelScalingPolicy = class ModelScalingPolicy extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.scalingRules = new Map();
        this.recentDecisions = new Map();
        this.decisionHistoryLimit = 20;
        this.logger.info('ModelScalingPolicy initialized');
        this.initializeDefaultRules();
    }
    initializeDefaultRules() {
        // Define default scaling rules
        const defaultRules = [
            {
                name: 'high-cpu-utilization',
                description: 'Scale up when CPU utilization is high',
                condition: (metrics) => metrics.resources.cpu > 80,
                action: 'scale_up',
                priority: 80,
                cooldownPeriod: 5 * 60 * 1000,
                replicas: 1
            },
            {
                name: 'high-memory-utilization',
                description: 'Scale up when memory utilization is high',
                condition: (metrics) => metrics.resources.memory > 85,
                action: 'scale_up',
                priority: 85,
                cooldownPeriod: 5 * 60 * 1000,
                replicas: 1
            },
            {
                name: 'long-response-time',
                description: 'Scale up when response time exceeds threshold',
                condition: (metrics) => metrics.performance.responseTime > 1000,
                action: 'scale_up',
                priority: 90,
                cooldownPeriod: 3 * 60 * 1000,
                replicas: 1
            },
            {
                name: 'high-queue-length',
                description: 'Scale up when queue length is high',
                condition: (metrics) => metrics.scaling.queueLength > 50,
                action: 'scale_up',
                priority: 95,
                cooldownPeriod: 2 * 60 * 1000,
                replicas: 1
            },
            {
                name: 'low-cpu-utilization',
                description: 'Scale down when CPU utilization is low',
                condition: (metrics) => metrics.resources.cpu < 20 && metrics.scaling.currentNodes > 1,
                action: 'scale_down',
                priority: 60,
                cooldownPeriod: 15 * 60 * 1000,
                replicas: 1
            },
            {
                name: 'low-queue-length',
                description: 'Scale down when queue length is low',
                condition: (metrics) => metrics.scaling.queueLength < 5 && metrics.scaling.currentNodes > 1,
                action: 'scale_down',
                priority: 50,
                cooldownPeriod: 10 * 60 * 1000,
                replicas: 1
            }
        ];
        // Set defaults for all models
        this.scalingRules.set('default', defaultRules);
    }
    /**
     * Add or update scaling rules for a specific model
     */
    setScalingRules(modelId, rules) {
        this.scalingRules.set(modelId, rules);
        this.logger.info(`Set scaling rules for model ${modelId}`, { rulesCount: rules.length });
        this.emit('rules.updated', { modelId, rules });
    }
    /**
     * Get scaling rules for a model (or default if not set)
     */
    getScalingRules(modelId) {
        return this.scalingRules.get(modelId) || this.scalingRules.get('default') || [];
    }
    /**
     * Evaluate metrics against rules to make a scaling decision
     */
    evaluateScalingDecision(modelId, metrics) {
        try {
            this.logger.info(`Evaluating scaling decision for model ${modelId}`);
            const rules = this.getScalingRules(modelId);
            const now = Date.now();
            const applicableRules = [];
            // Find applicable rules that are not in cooldown
            for (const rule of rules) {
                const lastTriggered = rule.lastTriggeredTime || 0;
                const cooldownExpired = (now - lastTriggered) > rule.cooldownPeriod;
                if (cooldownExpired && rule.condition(metrics)) {
                    applicableRules.push(rule);
                }
            }
            if (applicableRules.length === 0) {
                return this.createDecision(modelId, 'no_action', 'No applicable rules', metrics);
            }
            // Sort by priority (highest first)
            applicableRules.sort((a, b) => b.priority - a.priority);
            const selectedRule = applicableRules[0];
            // Update last triggered time
            if (selectedRule) {
                selectedRule.lastTriggeredTime = now;
                const decision = this.createDecision(modelId, selectedRule.action, `Rule "${selectedRule.name}" triggered: ${selectedRule.description}`, metrics, selectedRule);
                this.recordDecision(decision);
                this.logger.info(`Scaling decision for model ${modelId}: ${decision.action}`, {
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
            this.logger.error(`Error evaluating scaling decision for model ${modelId}`, error);
            // Return a safe default
            return this.createDecision(modelId, 'no_action', 'Error evaluating scaling rules', metrics);
        }
    }
    /**
     * Create a scaling decision object
     */
    createDecision(modelId, action, reason, metrics, rule) {
        return {
            modelId,
            timestamp: new Date(),
            action,
            reason,
            metrics,
            rule,
            replicas: rule?.replicas,
            resources: rule?.resources
        };
    }
    /**
     * Record a scaling decision in history
     */
    recordDecision(decision) {
        const { modelId } = decision;
        if (!this.recentDecisions.has(modelId)) {
            this.recentDecisions.set(modelId, []);
        }
        const decisions = this.recentDecisions.get(modelId);
        decisions.push(decision);
        // Limit the history size
        if (decisions.length > this.decisionHistoryLimit) {
            decisions.shift();
        }
        this.emit('decision.made', { decision });
    }
    /**
     * Get recent scaling decisions for a model
     */
    getRecentDecisions(modelId) {
        return this.recentDecisions.get(modelId) || [];
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.removeAllListeners();
        this.scalingRules.clear();
        this.recentDecisions.clear();
        this.logger.info('ModelScalingPolicy disposed');
    }
};
ModelScalingPolicy = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object])
], ModelScalingPolicy);
exports.ModelScalingPolicy = ModelScalingPolicy;
//# sourceMappingURL=ModelScalingPolicy.js.map