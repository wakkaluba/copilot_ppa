/**
 * Tracks performance metrics for LLM connections
 */
export declare class ConnectionMetricsTracker {
    private connectionAttempts;
    private successfulConnections;
    private requestCount;
    private errorCount;
    private totalLatency;
    private lastError?;
    private lastRequestTime?;
    recordConnectionAttempt(): void;
    recordConnectionSuccess(): void;
    recordRequest(latencyMs: number): void;
    recordRequestFailure(error: Error): void;
    getMetrics(): {
        connectionAttempts: number;
        successfulConnections: number;
        requestCount: number;
        errorCount: number;
        averageLatency: number;
        lastError?: Error;
        lastRequestTime?: number;
    };
    reset(): void;
}
