/**
 * Tracks performance metrics for LLM connections
 */
export class ConnectionMetricsTracker {
    private connectionAttempts = 0;
    private successfulConnections = 0;
    private requestCount = 0;
    private errorCount = 0;
    private totalLatency = 0;
    private lastError?: Error;
    private lastRequestTime?: number;

    public recordConnectionAttempt(): void {
        this.connectionAttempts++;
    }

    public recordConnectionSuccess(): void {
        this.successfulConnections++;
    }

    public recordRequest(latencyMs: number): void {
        this.requestCount++;
        this.totalLatency += latencyMs;
        this.lastRequestTime = Date.now();
    }

    public recordRequestFailure(error: Error): void {
        this.errorCount++;
        this.lastError = error;
    }

    public getMetrics(): {
        connectionAttempts: number;
        successfulConnections: number;
        requestCount: number;
        errorCount: number;
        averageLatency: number;
        lastError?: Error;
        lastRequestTime?: number;
    } {
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

    public reset(): void {
        this.connectionAttempts = 0;
        this.successfulConnections = 0;
        this.requestCount = 0;
        this.errorCount = 0;
        this.totalLatency = 0;
        this.lastError = undefined;
        this.lastRequestTime = undefined;
    }
}