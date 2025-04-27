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
exports.ModelHealthMonitorV2 = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../utils/logger");
const events_1 = require("events");
/**
 * Service for monitoring model health
 */
let ModelHealthMonitorV2 = class ModelHealthMonitorV2 extends events_1.EventEmitter {
    constructor(logger, config = {}) {
        super();
        this.logger = logger;
        this.config = config;
        this.health = new Map();
        this.monitoringInterval = null;
        this.startTimes = new Map();
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
ModelHealthMonitorV2 = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)('HealthMonitorConfig')),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, Object])
], ModelHealthMonitorV2);
exports.ModelHealthMonitorV2 = ModelHealthMonitorV2;
//# sourceMappingURL=ModelHealthMonitorV2.js.map