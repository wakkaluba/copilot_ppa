"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionMetricsTracker = void 0;
const events_1 = require("events");
const interfaces_1 = require("./interfaces");
const errors_1 = require("./errors");
/**
 * Default metrics state
 */
const DEFAULT_METRICS = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalLatency: 0,
    averageLatency: 0,
    maxLatency: 0,
    minLatency: Infinity,
    errors: {},
    requestsInLastMinute: 0,
    requestsInLastHour: 0,
    lastUpdated: Date.now()
};
/**
 * Tracks performance metrics for LLM connections
 */
class ConnectionMetricsTracker extends events_1.EventEmitter {
    metrics = { ...DEFAULT_METRICS };
    recentRequests = [];
    MINUTE = 60 * 1000;
    HOUR = 60 * 60 * 1000;
    constructor() {
        super();
        this.startPeriodicCleanup();
    }
    /**
     * Record a successful connection
     */
    recordConnectionSuccess() {
        this.updateMetrics({
            type: 'connection',
            success: true
        });
    }
    /**
     * Record a successful request with timing
     */
    recordRequest(durationMs) {
        this.updateMetrics({
            type: 'request',
            success: true,
            duration: durationMs
        });
    }
    /**
     * Record a failed request
     */
    recordRequestFailure(error) {
        this.updateMetrics({
            type: 'request',
            success: false,
            error
        });
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        this.updateTimeBasedMetrics();
        return { ...this.metrics };
    }
    /**
     * Reset metrics
     */
    reset() {
        this.metrics = { ...DEFAULT_METRICS };
        this.recentRequests = [];
        this.emit('metricsReset');
    }
    updateMetrics(event) {
        const now = Date.now();
        this.metrics.lastUpdated = now;
        this.metrics.totalRequests++;
        if (event.success) {
            this.metrics.successfulRequests++;
            if (event.duration !== undefined) {
                this.updateLatencyMetrics(event.duration);
                this.recentRequests.push({
                    timestamp: now,
                    duration: event.duration
                });
            }
        }
        else {
            this.metrics.failedRequests++;
            if (event.error) {
                this.recordError(event.error);
            }
        }
        this.updateTimeBasedMetrics();
        this.emit('metricsUpdated', this.getMetrics());
    }
    updateLatencyMetrics(duration) {
        this.metrics.totalLatency += duration;
        this.metrics.averageLatency = this.metrics.totalLatency / this.metrics.successfulRequests;
        this.metrics.maxLatency = Math.max(this.metrics.maxLatency, duration);
        this.metrics.minLatency = Math.min(this.metrics.minLatency, duration);
    }
    recordError(error) {
        let errorType = 'unknown';
        if (error instanceof errors_1.LLMConnectionError) {
            errorType = interfaces_1.ConnectionErrorCode[error.code] || 'unknown';
        }
        else {
            errorType = error.constructor.name;
        }
        this.metrics.errors[errorType] = (this.metrics.errors[errorType] || 0) + 1;
    }
    updateTimeBasedMetrics() {
        const now = Date.now();
        const minuteAgo = now - this.MINUTE;
        const hourAgo = now - this.HOUR;
        // Update recent request counts
        this.recentRequests = this.recentRequests.filter(r => r.timestamp >= hourAgo);
        this.metrics.requestsInLastMinute = this.recentRequests.filter(r => r.timestamp >= minuteAgo).length;
        this.metrics.requestsInLastHour = this.recentRequests.length;
    }
    startPeriodicCleanup() {
        setInterval(() => {
            const now = Date.now();
            const hourAgo = now - this.HOUR;
            // Remove requests older than an hour
            this.recentRequests = this.recentRequests.filter(r => r.timestamp >= hourAgo);
            // Update time-based metrics
            this.updateTimeBasedMetrics();
        }, this.MINUTE); // Clean up every minute
    }
    dispose() {
        this.removeAllListeners();
    }
}
exports.ConnectionMetricsTracker = ConnectionMetricsTracker;
//# sourceMappingURL=ConnectionMetricsTracker.js.map