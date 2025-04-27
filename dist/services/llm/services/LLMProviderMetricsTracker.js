"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderMetricsTracker = void 0;
const events_1 = require("events");
const types_1 = require("../types");
class LLMProviderMetricsTracker extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.metrics = new Map();
        this.lastResponseTimes = new Map();
        this.maxResponseTimeHistory = 100;
    }
    /**
     * Initialize metrics tracking for a provider
     */
    async initializeProvider(providerId) {
        if (this.metrics.has(providerId)) {
            return;
        }
        this.metrics.set(providerId, {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            tokenUsage: 0,
            averageResponseTime: 0,
            lastError: null
        });
        this.lastResponseTimes.set(providerId, []);
    }
    /**
     * Record a successful request
     */
    recordSuccess(providerId, responseTimeMs, tokenCount) {
        const metrics = this.getMetrics(providerId);
        if (!metrics) {
            return;
        }
        metrics.requestCount++;
        metrics.successCount++;
        metrics.tokenUsage += tokenCount;
        this.updateResponseTime(providerId, responseTimeMs);
        this.emitMetricsUpdate(providerId);
    }
    /**
     * Record a failed request
     */
    recordError(providerId, error, responseTimeMs) {
        const metrics = this.getMetrics(providerId);
        if (!metrics) {
            return;
        }
        metrics.requestCount++;
        metrics.errorCount++;
        metrics.lastError = error;
        if (responseTimeMs !== undefined) {
            this.updateResponseTime(providerId, responseTimeMs);
        }
        this.emitMetricsUpdate(providerId);
    }
    /**
     * Get current metrics for a provider
     */
    getMetrics(providerId) {
        return this.metrics.get(providerId);
    }
    /**
     * Reset metrics for a provider
     */
    resetMetrics(providerId) {
        this.initializeProvider(providerId);
    }
    /**
     * Update response time tracking
     */
    updateResponseTime(providerId, responseTimeMs) {
        const times = this.lastResponseTimes.get(providerId);
        if (!times) {
            return;
        }
        times.push(responseTimeMs);
        if (times.length > this.maxResponseTimeHistory) {
            times.shift();
        }
        const metrics = this.metrics.get(providerId);
        if (metrics) {
            metrics.averageResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
        }
    }
    /**
     * Emit metrics update event
     */
    emitMetricsUpdate(providerId) {
        const metrics = this.metrics.get(providerId);
        if (metrics) {
            this.emit(types_1.ProviderEvent.MetricsUpdated, {
                providerId,
                metrics: { ...metrics }
            });
        }
    }
    dispose() {
        this.metrics.clear();
        this.lastResponseTimes.clear();
        this.removeAllListeners();
    }
}
exports.LLMProviderMetricsTracker = LLMProviderMetricsTracker;
//# sourceMappingURL=LLMProviderMetricsTracker.js.map