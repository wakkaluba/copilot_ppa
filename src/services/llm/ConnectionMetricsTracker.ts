import { EventEmitter } from 'events';
import { ConnectionErrorCode } from './interfaces';
import { LLMConnectionError } from './errors';

/**
 * Performance metrics for LLM connections
 */
interface ConnectionMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalLatency: number;
    averageLatency: number;
    maxLatency: number;
    minLatency: number;
    errors: Record<string, number>;
    requestsInLastMinute: number;
    requestsInLastHour: number;
    lastUpdated: number;
}

/**
 * Timestamp and duration for a request
 */
interface RequestTiming {
    timestamp: number;
    duration: number;
}

/**
 * Default metrics state
 */
const DEFAULT_METRICS: ConnectionMetrics = {
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
export class ConnectionMetricsTracker extends EventEmitter {
    private metrics: ConnectionMetrics = { ...DEFAULT_METRICS };
    private recentRequests: RequestTiming[] = [];
    private readonly MINUTE = 60 * 1000;
    private readonly HOUR = 60 * 60 * 1000;

    constructor() {
        super();
        this.startPeriodicCleanup();
    }

    /**
     * Record a successful connection
     */
    public recordConnectionSuccess(): void {
        this.updateMetrics({
            type: 'connection',
            success: true
        });
    }

    /**
     * Record a successful request with timing
     */
    public recordRequest(durationMs: number): void {
        this.updateMetrics({
            type: 'request',
            success: true,
            duration: durationMs
        });
    }

    /**
     * Record a failed request
     */
    public recordRequestFailure(error: Error): void {
        this.updateMetrics({
            type: 'request',
            success: false,
            error
        });
    }

    /**
     * Get current metrics
     */
    public getMetrics(): ConnectionMetrics {
        this.updateTimeBasedMetrics();
        return { ...this.metrics };
    }

    /**
     * Reset metrics
     */
    public reset(): void {
        this.metrics = { ...DEFAULT_METRICS };
        this.recentRequests = [];
        this.emit('metricsReset');
    }

    private updateMetrics(event: {
        type: 'connection' | 'request';
        success: boolean;
        duration?: number;
        error?: Error;
    }): void {
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
        } else {
            this.metrics.failedRequests++;
            if (event.error) {
                this.recordError(event.error);
            }
        }

        this.updateTimeBasedMetrics();
        this.emit('metricsUpdated', this.getMetrics());
    }

    private updateLatencyMetrics(duration: number): void {
        this.metrics.totalLatency += duration;
        this.metrics.averageLatency = this.metrics.totalLatency / this.metrics.successfulRequests;
        this.metrics.maxLatency = Math.max(this.metrics.maxLatency, duration);
        this.metrics.minLatency = Math.min(this.metrics.minLatency, duration);
    }

    private recordError(error: Error): void {
        let errorType = 'unknown';
        
        if (error instanceof LLMConnectionError) {
            errorType = ConnectionErrorCode[error.code] || 'unknown';
        } else {
            errorType = error.constructor.name;
        }

        this.metrics.errors[errorType] = (this.metrics.errors[errorType] || 0) + 1;
    }

    private updateTimeBasedMetrics(): void {
        const now = Date.now();
        const minuteAgo = now - this.MINUTE;
        const hourAgo = now - this.HOUR;

        // Update recent request counts
        this.recentRequests = this.recentRequests.filter(r => r.timestamp >= hourAgo);
        this.metrics.requestsInLastMinute = this.recentRequests.filter(
            r => r.timestamp >= minuteAgo
        ).length;
        this.metrics.requestsInLastHour = this.recentRequests.length;
    }

    private startPeriodicCleanup(): void {
        setInterval(() => {
            const now = Date.now();
            const hourAgo = now - this.HOUR;
            
            // Remove requests older than an hour
            this.recentRequests = this.recentRequests.filter(r => r.timestamp >= hourAgo);
            
            // Update time-based metrics
            this.updateTimeBasedMetrics();
        }, this.MINUTE); // Clean up every minute
    }

    public dispose(): void {
        this.removeAllListeners();
    }
}