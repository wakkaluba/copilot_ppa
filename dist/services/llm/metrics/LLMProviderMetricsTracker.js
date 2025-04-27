"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderMetricsTracker = void 0;
const events_1 = require("events");
class LLMProviderMetricsTracker extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.metrics = new Map();
        this.metricsWindow = 1000 * 60 * 60; // 1 hour window
    }
    async initializeProvider(providerId) {
        this.metrics.set(providerId, {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            tokenUsage: 0,
            averageResponseTime: 0,
            requestTimes: [],
            lastUpdated: Date.now()
        });
    }
    recordSuccess(providerId, responseTime, tokens) {
        const metrics = this.metrics.get(providerId);
        if (!metrics) {
            return;
        }
        const now = Date.now();
        // Update request times, keeping only those within the window
        metrics.requestTimes = [
            ...metrics.requestTimes.filter(t => now - t.timestamp <= this.metricsWindow),
            { timestamp: now, duration: responseTime }
        ];
        // Calculate new average response time
        metrics.averageResponseTime = metrics.requestTimes.reduce((sum, time) => sum + time.duration, 0) / metrics.requestTimes.length;
        metrics.requestCount++;
        metrics.successCount++;
        metrics.tokenUsage += tokens;
        metrics.lastUpdated = now;
        this.emit('metricsUpdated', {
            providerId,
            metrics: { ...metrics }
        });
    }
    recordError(providerId, error) {
        const metrics = this.metrics.get(providerId);
        if (!metrics) {
            return;
        }
        metrics.requestCount++;
        metrics.errorCount++;
        metrics.lastUpdated = Date.now();
        metrics.lastError = error;
        this.emit('metricsUpdated', {
            providerId,
            metrics: { ...metrics }
        });
    }
    getMetrics(providerId) {
        const metrics = this.metrics.get(providerId);
        return metrics ? { ...metrics } : undefined;
    }
    resetMetrics(providerId) {
        this.metrics.delete(providerId);
    }
    dispose() {
        this.metrics.clear();
        this.removeAllListeners();
    }
}
exports.LLMProviderMetricsTracker = LLMProviderMetricsTracker;
//# sourceMappingURL=LLMProviderMetricsTracker.js.map