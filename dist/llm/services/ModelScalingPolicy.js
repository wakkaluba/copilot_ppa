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
exports.ModelScalingPolicy = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelScalingPolicy = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelScalingPolicy = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelScalingPolicy = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        scalingRules = new Map();
        recentDecisions = new Map();
        decisionHistoryLimit = 20;
        constructor(logger) {
            super();
            this.logger = logger;
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
                    cooldownPeriod: 5 * 60 * 1000, // 5 minutes
                    replicas: 1
                },
                {
                    name: 'high-memory-utilization',
                    description: 'Scale up when memory utilization is high',
                    condition: (metrics) => metrics.resources.memory > 85,
                    action: 'scale_up',
                    priority: 85,
                    cooldownPeriod: 5 * 60 * 1000, // 5 minutes
                    replicas: 1
                },
                {
                    name: 'long-response-time',
                    description: 'Scale up when response time exceeds threshold',
                    condition: (metrics) => metrics.performance.responseTime > 1000,
                    action: 'scale_up',
                    priority: 90,
                    cooldownPeriod: 3 * 60 * 1000, // 3 minutes
                    replicas: 1
                },
                {
                    name: 'high-queue-length',
                    description: 'Scale up when queue length is high',
                    condition: (metrics) => metrics.scaling.queueLength > 50,
                    action: 'scale_up',
                    priority: 95,
                    cooldownPeriod: 2 * 60 * 1000, // 2 minutes
                    replicas: 1
                },
                {
                    name: 'low-cpu-utilization',
                    description: 'Scale down when CPU utilization is low',
                    condition: (metrics) => metrics.resources.cpu < 20 && metrics.scaling.currentNodes > 1,
                    action: 'scale_down',
                    priority: 60,
                    cooldownPeriod: 15 * 60 * 1000, // 15 minutes
                    replicas: 1
                },
                {
                    name: 'low-queue-length',
                    description: 'Scale down when queue length is low',
                    condition: (metrics) => metrics.scaling.queueLength < 5 && metrics.scaling.currentNodes > 1,
                    action: 'scale_down',
                    priority: 50,
                    cooldownPeriod: 10 * 60 * 1000, // 10 minutes
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
                timestamp: Date.now(),
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
    return ModelScalingPolicy = _classThis;
})();
exports.ModelScalingPolicy = ModelScalingPolicy;
//# sourceMappingURL=ModelScalingPolicy.js.map