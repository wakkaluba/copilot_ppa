import { EventEmitter } from 'events';
import { ProviderMetrics } from '../types';
export declare class LLMProviderMetricsTracker extends EventEmitter {
    private metrics;
    private readonly metricsWindow;
    initializeProvider(providerId: string): Promise<void>;
    recordSuccess(providerId: string, responseTime: number, tokens: number): void;
    recordError(providerId: string, error: Error): void;
    getMetrics(providerId: string): ProviderMetrics | undefined;
    resetMetrics(providerId: string): void;
    dispose(): void;
}
