import { EventEmitter } from 'events';
import { ProviderEvent, ProviderEventData, ProviderMetrics } from '../types';

export class ProviderEventEmitter extends EventEmitter {
    private static instance: ProviderEventEmitter;

    private constructor() {
        super();
        this.setMaxListeners(50); // Support many concurrent provider listeners
    }

    public static getInstance(): ProviderEventEmitter {
        if (!ProviderEventEmitter.instance) {
            ProviderEventEmitter.instance = new ProviderEventEmitter();
        }
        return ProviderEventEmitter.instance;
    }

    public emitProviderInit(providerId: string): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.Initialized
        };
        this.emit(ProviderEvent.Initialized, eventData);
    }

    public emitProviderConnect(providerId: string): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.Connected
        };
        this.emit(ProviderEvent.Connected, eventData);
    }

    public emitProviderDisconnect(providerId: string, reason?: string): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.Disconnected,
            metadata: { reason }
        };
        this.emit(ProviderEvent.Disconnected, eventData);
    }

    public emitProviderError(providerId: string, error: Error): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.Error,
            error
        };
        this.emit(ProviderEvent.Error, eventData);
    }

    public emitHealthCheck(providerId: string, isHealthy: boolean, metrics?: ProviderMetrics): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.HealthCheck,
            metadata: { isHealthy, metrics }
        };
        this.emit(ProviderEvent.HealthCheck, eventData);
    }

    public emitRequestStart(providerId: string, requestId: string): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.RequestStart,
            metadata: { requestId }
        };
        this.emit(ProviderEvent.RequestStart, eventData);
    }

    public emitRequestComplete(
        providerId: string, 
        requestId: string,
        duration: number,
        tokenUsage?: { prompt: number; completion: number; total: number }
    ): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.RequestComplete,
            metadata: { requestId, duration, tokenUsage }
        };
        this.emit(ProviderEvent.RequestComplete, eventData);
    }

    public emitRequestError(
        providerId: string,
        requestId: string,
        error: Error,
        duration: number
    ): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.RequestError,
            error,
            metadata: { requestId, duration }
        };
        this.emit(ProviderEvent.RequestError, eventData);
    }

    public emitProviderDestroy(providerId: string): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.Destroyed
        };
        this.emit(ProviderEvent.Destroyed, eventData);
    }

    public emitConfigChange(providerId: string, changes: Record<string, any>): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.ConfigChanged,
            metadata: { changes }
        };
        this.emit(ProviderEvent.ConfigChanged, eventData);
    }

    public emitMetricsUpdate(providerId: string, metrics: ProviderMetrics): void {
        const eventData: ProviderEventData = {
            providerId,
            timestamp: new Date(),
            type: ProviderEvent.MetricsUpdate,
            metadata: { metrics }
        };
        this.emit(ProviderEvent.MetricsUpdate, eventData);
    }

    public onProviderEvent(
        event: ProviderEvent,
        listener: (data: ProviderEventData) => void
    ): void {
        this.on(event, listener);
    }

    public offProviderEvent(
        event: ProviderEvent,
        listener: (data: ProviderEventData) => void
    ): void {
        this.off(event, listener);
    }

    public clearAllListeners(): void {
        this.removeAllListeners();
    }
}