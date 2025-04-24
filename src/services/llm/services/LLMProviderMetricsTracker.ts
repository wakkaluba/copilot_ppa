import { EventEmitter } from 'events';
import {
    ProviderMetrics,
    ProviderEvent,
    ProviderError
} from '../types';

export class LLMProviderMetricsTracker extends EventEmitter {
    private readonly metrics = new Map<string, ProviderMetrics>();
    private readonly lastResponseTimes = new Map<string, number[]>();
    private readonly maxResponseTimeHistory = 100;

    /**
     * Initialize metrics tracking for a provider
     */
    public async initializeProvider(providerId: string): Promise<void> {
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
    public recordSuccess(
        providerId: string,
        responseTimeMs: number,
        tokenCount: number
    ): void {
        const metrics = this.getMetrics(providerId);
        if (!metrics) {return;}

        metrics.requestCount++;
        metrics.successCount++;
        metrics.tokenUsage += tokenCount;

        this.updateResponseTime(providerId, responseTimeMs);
        this.emitMetricsUpdate(providerId);
    }

    /**
     * Record a failed request
     */
    public recordError(
        providerId: string,
        error: Error,
        responseTimeMs?: number
    ): void {
        const metrics = this.getMetrics(providerId);
        if (!metrics) {return;}

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
    public getMetrics(providerId: string): ProviderMetrics | undefined {
        return this.metrics.get(providerId);
    }

    /**
     * Reset metrics for a provider
     */
    public resetMetrics(providerId: string): void {
        this.initializeProvider(providerId);
    }

    /**
     * Update response time tracking
     */
    private updateResponseTime(providerId: string, responseTimeMs: number): void {
        const times = this.lastResponseTimes.get(providerId);
        if (!times) {return;}

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
    private emitMetricsUpdate(providerId: string): void {
        const metrics = this.metrics.get(providerId);
        if (metrics) {
            this.emit(ProviderEvent.MetricsUpdated, {
                providerId,
                metrics: { ...metrics }
            });
        }
    }

    public dispose(): void {
        this.metrics.clear();
        this.lastResponseTimes.clear();
        this.removeAllListeners();
    }
}