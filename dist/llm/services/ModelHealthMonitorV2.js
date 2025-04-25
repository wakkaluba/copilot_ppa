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
exports.ModelHealthMonitorV2 = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
/**
 * Service for monitoring model health
 */
let ModelHealthMonitorV2 = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelHealthMonitorV2 = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelHealthMonitorV2 = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        config;
        health = new Map();
        monitoringInterval = null;
        startTimes = new Map();
        constructor(logger, config = {}) {
            super();
            this.logger = logger;
            this.config = config;
            this.logger.info('ModelHealthMonitorV2 initialized');
            this.startMonitoring();
        }
        /**
         * Start health monitoring at regular intervals
         */
        startMonitoring() {
            const frequency = this.config.monitoringFrequency || 30000; // Default to 30 seconds
            if (this.monitoringInterval) {
                return;
            }
            this.monitoringInterval = setInterval(async () => {
                try {
                    await this.checkHealth();
                }
                catch (error) {
                    this.logger.error('Error checking health', error);
                }
            }, frequency);
            this.logger.info(`Started health monitoring with frequency ${frequency}ms`);
        }
        /**
         * Check health of all registered models
         */
        async checkHealth() {
            try {
                const modelIds = Array.from(this.health.keys());
                for (const modelId of modelIds) {
                    const currentHealth = this.health.get(modelId);
                    const newHealth = await this.simulateHealthCheck(modelId, currentHealth);
                    // Check if status changed
                    const statusChanged = currentHealth.status !== newHealth.status;
                    // Update health
                    this.health.set(modelId, newHealth);
                    if (statusChanged) {
                        this.emit('healthStatusChanged', {
                            modelId,
                            previousStatus: currentHealth.status,
                            currentStatus: newHealth.status,
                            health: newHealth
                        });
                    }
                    this.emit('healthChecked', {
                        modelId,
                        health: newHealth
                    });
                }
                this.logger.debug(`Checked health for ${modelIds.length} models`);
            }
            catch (error) {
                this.logger.error('Error in health check cycle', error);
            }
        }
        /**
         * Simulate a health check (for testing)
         */
        async simulateHealthCheck(modelId, currentHealth) {
            // Calculate uptime
            const startTime = this.startTimes.get(modelId) || Date.now();
            const uptime = Date.now() - startTime;
            // Default to healthy with small random fluctuations
            const errorRate = Math.max(0, currentHealth.metrics.errorRate + (Math.random() * 0.01) - 0.005);
            const latency = Math.max(10, currentHealth.metrics.latency + (Math.random() * 20) - 10);
            // Determine status based on metrics
            let status;
            let degradedPeriods = currentHealth.metrics.degradedPeriods;
            if (errorRate > 0.1 || latency > 500) {
                status = 'failing';
                degradedPeriods++;
            }
            else if (errorRate > 0.02 || latency > 300) {
                status = 'degraded';
                degradedPeriods++;
            }
            else {
                status = 'healthy';
            }
            return {
                status,
                uptime,
                metrics: {
                    errorRate,
                    latency,
                    degradedPeriods
                },
                lastCheck: Date.now(),
            };
        }
        /**
         * Register a model for health monitoring
         */
        registerModel(modelId) {
            if (!this.health.has(modelId)) {
                const now = Date.now();
                this.startTimes.set(modelId, now);
                const initialHealth = {
                    status: 'healthy',
                    uptime: 0,
                    metrics: {
                        errorRate: 0.005,
                        latency: 150,
                        degradedPeriods: 0
                    },
                    lastCheck: now
                };
                this.health.set(modelId, initialHealth);
                this.emit('modelRegistered', { modelId, health: initialHealth });
                this.logger.info(`Registered model for health monitoring: ${modelId}`);
            }
        }
        /**
         * Get health status for a model
         */
        getHealth(modelId) {
            const health = this.health.get(modelId);
            if (!health) {
                // Auto-register if not found
                this.registerModel(modelId);
                return this.health.get(modelId);
            }
            return health;
        }
        /**
         * Update health metrics manually
         */
        updateHealth(modelId, metrics) {
            const currentHealth = this.getHealth(modelId) || this.createDefaultHealth(modelId);
            const updatedHealth = {
                ...currentHealth,
                ...metrics,
                metrics: {
                    ...currentHealth.metrics,
                    ...(metrics.metrics || {})
                },
                lastCheck: Date.now()
            };
            const statusChanged = currentHealth.status !== updatedHealth.status;
            this.health.set(modelId, updatedHealth);
            if (statusChanged) {
                this.emit('healthStatusChanged', {
                    modelId,
                    previousStatus: currentHealth.status,
                    currentStatus: updatedHealth.status,
                    health: updatedHealth
                });
            }
            this.emit('healthUpdated', {
                modelId,
                health: updatedHealth
            });
            this.logger.debug(`Updated health for model ${modelId}`, updatedHealth);
        }
        createDefaultHealth(modelId) {
            const now = Date.now();
            this.startTimes.set(modelId, now);
            return {
                status: 'healthy',
                uptime: 0,
                metrics: {
                    errorRate: 0.005,
                    latency: 150,
                    degradedPeriods: 0
                },
                lastCheck: now
            };
        }
        /**
         * Dispose of resources
         */
        dispose() {
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            this.removeAllListeners();
            this.health.clear();
            this.startTimes.clear();
            this.logger.info('ModelHealthMonitorV2 disposed');
        }
    };
    return ModelHealthMonitorV2 = _classThis;
})();
exports.ModelHealthMonitorV2 = ModelHealthMonitorV2;
//# sourceMappingURL=ModelHealthMonitorV2.js.map