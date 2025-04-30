import { EventEmitter } from 'events';
import { ProviderMetrics } from '../types';
export declare class LLMProviderMetricsTracker extends EventEmitter {
    private readonly metrics;
    private readonly lastResponseTimes;
    private readonly maxResponseTimeHistory;
    /**
     * Initialize metrics tracking for a provider
     */
    initializeProvider(providerId: string): Promise<void>;
    /**
     * Record a successful request
     */
    recordSuccess(providerId: string, responseTimeMs: number, tokenCount: number): void;
    /**
     * Record a failed request
     */
    recordError(providerId: string, error: Error, responseTimeMs?: number): void;
    /**
     * Get current metrics for a provider
     */
    getMetrics(providerId: string): ProviderMetrics | undefined;
    /**
     * Reset metrics for a provider
     */
    resetMetrics(providerId: string): void;
    /**
     * Update response time tracking
     */
    private updateResponseTime;
    /**
     * Emit metrics update event
     */
    private emitMetricsUpdate;
    dispose(): void;
}
