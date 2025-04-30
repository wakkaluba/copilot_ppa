import { EventEmitter } from 'events';
import { ProviderEvent, ProviderEventData, ProviderMetrics } from '../types';
export declare class ProviderEventEmitter extends EventEmitter {
    private static instance;
    private constructor();
    static getInstance(): ProviderEventEmitter;
    emitProviderInit(providerId: string): void;
    emitProviderConnect(providerId: string): void;
    emitProviderDisconnect(providerId: string, reason?: string): void;
    emitProviderError(providerId: string, error: Error): void;
    emitHealthCheck(providerId: string, isHealthy: boolean, metrics?: ProviderMetrics): void;
    emitRequestStart(providerId: string, requestId: string): void;
    emitRequestComplete(providerId: string, requestId: string, duration: number, tokenUsage?: {
        prompt: number;
        completion: number;
        total: number;
    }): void;
    emitRequestError(providerId: string, requestId: string, error: Error, duration: number): void;
    emitProviderDestroy(providerId: string): void;
    emitConfigChange(providerId: string, changes: Record<string, any>): void;
    emitMetricsUpdate(providerId: string, metrics: ProviderMetrics): void;
    onProviderEvent(event: ProviderEvent, listener: (data: ProviderEventData) => void): void;
    offProviderEvent(event: ProviderEvent, listener: (data: ProviderEventData) => void): void;
    clearAllListeners(): void;
}
