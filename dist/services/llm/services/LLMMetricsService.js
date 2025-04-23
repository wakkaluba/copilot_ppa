"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMMetricsService = void 0;
const events_1 = require("events");
/**
 * Service for tracking and managing LLM connection metrics
 */
class LLMMetricsService extends events_1.EventEmitter {
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
                lastErrorTime: undefined,
                totalTokens: 0,
                errorRates: new Map(),
                resourceUsage: {
                    memory: 0,
                    cpu: 0
                },
                estimatedCost: 0
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
    recordRequestSuccess(providerId, responseTime, tokenCount) {
        const metrics = this.getProviderMetrics(providerId);
        metrics.totalRequests++;
        metrics.successfulRequests++;
        metrics.totalTokens += tokenCount;
        metrics.lastResponseTime = responseTime;
        metrics.averageResponseTime = this.calculateNewAverage(metrics.averageResponseTime, responseTime, metrics.successfulRequests);
        metrics.estimatedCost += this.calculateCost(tokenCount);
        this.updateResourceUsage(providerId);
    }
    recordRequestFailure(providerId, error) {
        const metrics = this.getProviderMetrics(providerId);
        metrics.totalRequests++;
        const errorType = error.name;
        metrics.errorRates.set(errorType, (metrics.errorRates.get(errorType) || 0) + 1);
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
    calculateCost(tokenCount) {
        // Implement cost calculation based on provider pricing
        return tokenCount * 0.0001; // Example rate
    }
    updateResourceUsage(providerId) {
        const metrics = this.getProviderMetrics(providerId);
        const usage = process.memoryUsage();
        metrics.resourceUsage = {
            memory: usage.heapUsed,
            cpu: process.cpuUsage().user
        };
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
            lastErrorTime: undefined,
            totalTokens: 0,
            errorRates: new Map(),
            resourceUsage: {
                memory: 0,
                cpu: 0
            },
            estimatedCost: 0
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