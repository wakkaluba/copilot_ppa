"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMMetricsService = void 0;
/**
 * Service for tracking and managing LLM connection metrics
 */
class LLMMetricsService {
    metrics = new Map();
    activeProvider = null;
    startTimes = new Map();
    initializeMetrics(providerName) {
        if (!this.metrics.has(providerName)) {
            this.metrics.set(providerName, {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                lastResponseTime: 0,
                uptime: 0,
                lastError: undefined,
                lastErrorTime: undefined
            });
        }
    }
    setActiveProvider(providerName) {
        this.activeProvider = providerName;
        this.startTimes.set(providerName, Date.now());
        this.updateUptime(providerName);
    }
    recordRequest(providerName, success, responseTime) {
        const metrics = this.getProviderMetrics(providerName);
        metrics.totalRequests++;
        if (success) {
            metrics.successfulRequests++;
        }
        else {
            metrics.failedRequests++;
        }
        metrics.lastResponseTime = responseTime;
        metrics.averageResponseTime = this.calculateNewAverage(metrics.averageResponseTime, responseTime, metrics.totalRequests);
    }
    recordError(providerName, error) {
        const metrics = this.getProviderMetrics(providerName);
        metrics.lastError = error;
        metrics.lastErrorTime = new Date();
        metrics.failedRequests++;
    }
    recordConnectionTime(providerName, connectionTime) {
        const metrics = this.getProviderMetrics(providerName);
        metrics.lastResponseTime = connectionTime;
        metrics.averageResponseTime = this.calculateNewAverage(metrics.averageResponseTime, connectionTime, metrics.totalRequests + 1);
    }
    getMetrics(providerName) {
        return this.metrics.get(providerName || this.activeProvider || '');
    }
    getAllMetrics() {
        // Update all uptimes before returning
        for (const [providerName] of this.metrics) {
            this.updateUptime(providerName);
        }
        return new Map(this.metrics);
    }
    getProviderMetrics(providerName) {
        if (!this.metrics.has(providerName)) {
            this.initializeMetrics(providerName);
        }
        return this.metrics.get(providerName);
    }
    calculateNewAverage(currentAvg, newValue, totalCount) {
        return (currentAvg * (totalCount - 1) + newValue) / totalCount;
    }
    updateUptime(providerName) {
        const startTime = this.startTimes.get(providerName);
        if (startTime && this.activeProvider === providerName) {
            const metrics = this.getProviderMetrics(providerName);
            metrics.uptime = Date.now() - startTime;
        }
    }
    resetMetrics(providerName) {
        this.metrics.set(providerName, {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastResponseTime: 0,
            uptime: 0,
            lastError: undefined,
            lastErrorTime: undefined
        });
        this.startTimes.delete(providerName);
    }
    dispose() {
        this.metrics.clear();
        this.startTimes.clear();
        this.activeProvider = null;
    }
}
exports.LLMMetricsService = LLMMetricsService;
//# sourceMappingURL=LLMMetricsService.js.map