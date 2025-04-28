"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionHealthMonitor = void 0;
const events_1 = require("events");
const ConnectionMetricsTracker_1 = require("./ConnectionMetricsTracker");
const ConnectionRetryHandler_1 = require("./ConnectionRetryHandler");
/**
 * Default health check configuration
 */
const DEFAULT_HEALTH_CONFIG = {
    checkIntervalMs: 30000, // 30 seconds
    timeoutMs: 5000,
    unhealthyThreshold: 3,
    healthyThreshold: 2,
    maxConsecutiveFailures: 5
};
/**
 * Monitors health of LLM connections
 */
class ConnectionHealthMonitor extends events_1.EventEmitter {
    constructor() {
        super();
        this.healthStates = new Map();
        this.checkIntervals = new Map();
        this.connectionManagers = new Map();
        this.metricsTracker = new ConnectionMetricsTracker_1.ConnectionMetricsTracker();
        this.retryHandler = ConnectionRetryHandler_1.ConnectionRetryHandler.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ConnectionHealthMonitor();
        }
        return this.instance;
    }
    registerConnectionManager(providerId, manager) {
        this.connectionManagers.set(providerId, manager);
        this.initializeHealth(providerId);
    }
    initializeHealth(providerId) {
        if (!this.healthStates.has(providerId)) {
            this.healthStates.set(providerId, {
                status: types_1.ProviderStatus.UNKNOWN,
                lastCheck: 0,
                lastSuccess: 0,
                consecutiveSuccesses: 0,
                consecutiveFailures: 0,
                totalChecks: 0,
                error: undefined
            });
        }
    }
    startMonitoring(providerId, healthCheck, config) {
        this.initializeHealthState(providerId);
        this.stopMonitoring(providerId);
        const interval = setInterval(async () => {
            await this.performHealthCheck(providerId, healthCheck, config);
        }, config.checkIntervalMs);
        this.checkIntervals.set(providerId, interval);
        // Perform initial health check
        this.performHealthCheck(providerId, healthCheck, config);
    }
    async performHealthCheck(providerId, healthCheck, config) {
        const state = this.healthStates.get(providerId);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Health check timeout')), config.timeoutMs);
        });
        try {
            const response = await Promise.race([healthCheck(), timeoutPromise]);
            this.handleSuccessfulCheck(providerId, state, config);
            this.emit('healthCheckSuccess', { providerId, response });
        }
        catch (error) {
            this.handleFailedCheck(providerId, state, config, error);
            this.emit('healthCheckFailure', { providerId, error });
        }
        state.totalChecks++;
        this.emit('healthStateChanged', { providerId, state: { ...state } });
    }
    handleSuccessfulCheck(providerId, state, config) {
        state.lastSuccess = Date.now();
        state.consecutiveFailures = 0;
        state.consecutiveSuccesses++;
        state.error = undefined;
        if (state.consecutiveSuccesses >= config.healthyThreshold) {
            state.status = types_1.ProviderStatus.HEALTHY;
        }
    }
    handleFailedCheck(providerId, state, config, error) {
        state.consecutiveFailures++;
        state.consecutiveSuccesses = 0;
        state.error = error;
        if (state.consecutiveFailures >= config.unhealthyThreshold) {
            state.status = types_1.ProviderStatus.UNHEALTHY;
        }
    }
    initializeHealthState(providerId) {
        if (!this.healthStates.has(providerId)) {
            this.healthStates.set(providerId, {
                status: types_1.ProviderStatus.UNKNOWN,
                lastCheck: 0,
                lastSuccess: 0,
                consecutiveFailures: 0,
                consecutiveSuccesses: 0,
                totalChecks: 0
            });
        }
    }
    stopMonitoring(providerId) {
        const interval = this.checkIntervals.get(providerId);
        if (interval) {
            clearInterval(interval);
            this.checkIntervals.delete(providerId);
        }
    }
    getProviderHealth(providerId) {
        return this.healthStates.get(providerId);
    }
    isHealthy(providerId) {
        const health = this.healthStates.get(providerId);
        return health?.status === types_1.ProviderStatus.HEALTHY;
    }
    dispose() {
        for (const interval of this.checkIntervals.values()) {
            clearInterval(interval);
        }
        this.checkIntervals.clear();
        this.healthStates.clear();
        this.connectionManagers.clear();
        this.removeAllListeners();
    }
}
exports.ConnectionHealthMonitor = ConnectionHealthMonitor;
//# sourceMappingURL=ConnectionHealthMonitor.js.map