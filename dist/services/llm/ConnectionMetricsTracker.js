"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionMetricsTracker = void 0;
/**
 * Tracks performance metrics for LLM connections
 */
class ConnectionMetricsTracker {
    constructor() {
        this.connectionAttempts = 0;
        this.successfulConnections = 0;
        this.requestCount = 0;
        this.errorCount = 0;
        this.totalLatency = 0;
    }
    recordConnectionAttempt() {
        this.connectionAttempts++;
    }
    recordConnectionSuccess() {
        this.successfulConnections++;
    }
    recordRequest(latencyMs) {
        this.requestCount++;
        this.totalLatency += latencyMs;
        this.lastRequestTime = Date.now();
    }
    recordRequestFailure(error) {
        this.errorCount++;
        this.lastError = error;
    }
    getMetrics() {
        return {
            connectionAttempts: this.connectionAttempts,
            successfulConnections: this.successfulConnections,
            requestCount: this.requestCount,
            errorCount: this.errorCount,
            averageLatency: this.requestCount > 0 ? this.totalLatency / this.requestCount : 0,
            lastError: this.lastError,
            lastRequestTime: this.lastRequestTime
        };
    }
    reset() {
        this.connectionAttempts = 0;
        this.successfulConnections = 0;
        this.requestCount = 0;
        this.errorCount = 0;
        this.totalLatency = 0;
        this.lastError = undefined;
        this.lastRequestTime = undefined;
    }
}
exports.ConnectionMetricsTracker = ConnectionMetricsTracker;
//# sourceMappingURL=ConnectionMetricsTracker.js.map