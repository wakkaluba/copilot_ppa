"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMHealthMonitorService = void 0;
const events_1 = require("events");
class LLMHealthMonitorService extends events_1.EventEmitter {
    constructor(eventManager, healthCheckCallback) {
        super();
        this.eventManager = eventManager;
        this.healthCheckCallback = healthCheckCallback;
        this.healthStatus = new Map();
        this.checkIntervals = new Map();
        this.DEFAULT_CHECK_INTERVAL = 60000; // 1 minute
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.eventManager.on('stateChange', ({ providerId, newState }) => {
            this.handleStateChange(providerId, newState);
        });
    }
    handleStateChange(providerId, state) {
        if (state === 'connected') {
            this.startHealthChecks(providerId);
        }
        else if (state === 'disconnected') {
            this.stopHealthChecks(providerId);
        }
    }
    async performHealthCheck(providerId) {
        try {
            if (this.healthCheckCallback) {
                const result = await this.healthCheckCallback(providerId);
                this.updateHealthStatus(providerId, result);
                return result;
            }
            // Default health check if no callback provided
            const status = {
                isHealthy: true,
                latency: 0,
                lastCheck: Date.now(),
                errorCount: 0
            };
            this.updateHealthStatus(providerId, { status });
            return { status };
        }
        catch (error) {
            const status = {
                isHealthy: false,
                latency: -1,
                lastCheck: Date.now(),
                errorCount: (this.healthStatus.get(providerId)?.errorCount || 0) + 1,
                lastError: error instanceof Error ? error.message : String(error)
            };
            this.updateHealthStatus(providerId, { status });
            return { status, error };
        }
    }
    updateHealthStatus(providerId, result) {
        this.healthStatus.set(providerId, result.status);
        this.emit('healthUpdate', { providerId, ...result });
    }
    startHealthChecks(providerId, interval = this.DEFAULT_CHECK_INTERVAL) {
        if (this.checkIntervals.has(providerId)) {
            return;
        }
        const timer = setInterval(() => {
            this.performHealthCheck(providerId);
        }, interval);
        this.checkIntervals.set(providerId, timer);
    }
    stopHealthChecks(providerId) {
        const timer = this.checkIntervals.get(providerId);
        if (timer) {
            clearInterval(timer);
            this.checkIntervals.delete(providerId);
        }
    }
    getHealthStatus(providerId) {
        return this.healthStatus.get(providerId);
    }
    dispose() {
        this.removeAllListeners();
        for (const timer of this.checkIntervals.values()) {
            clearInterval(timer);
        }
        this.checkIntervals.clear();
        this.healthStatus.clear();
    }
}
exports.LLMHealthMonitorService = LLMHealthMonitorService;
//# sourceMappingURL=LLMHealthMonitorService.js.map