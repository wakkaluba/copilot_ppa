import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMRequest, ILLMResponse } from '../types';

export interface ITelemetryEvent {
    eventType: string;
    timestamp: number;
    source: string;
    data: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

export interface IPerformanceMetrics {
    latency: number;
    tokenCount: number;
    promptTokens: number;
    completionTokens: number;
    modelLoadTime?: number;
    inferenceTime?: number;
    totalProcessingTime: number;
}

export interface IUsageMetrics {
    totalRequests: number;
    totalTokens: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    errorRate: number;
}

export interface ITelemetryConfig {
    enabled: boolean;
    samplingRate: number;
    flushIntervalMs: number;
    maxBatchSize: number;
    retentionPeriodDays: number;
}

@injectable()
export class LLMTelemetryManager extends EventEmitter {
    private readonly events: ITelemetryEvent[] = [];
    private readonly metrics = new Map<string, IUsageMetrics>();
    private flushInterval?: NodeJS.Timer;
    private config: ITelemetryConfig;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.initializeConfig();
        this.startFlushInterval();
    }

    private initializeConfig(): void {
        this.config = {
            enabled: true,
            samplingRate: 1.0, // 100% sampling
            flushIntervalMs: 60000, // 1 minute
            maxBatchSize: 100,
            retentionPeriodDays: 30
        };
    }

    public trackEvent(event: Omit<ITelemetryEvent, 'timestamp'>): void {
        if (!this.config.enabled || Math.random() > this.config.samplingRate) {
            return;
        }

        const telemetryEvent: ITelemetryEvent = {
            ...event,
            timestamp: Date.now()
        };

        this.events.push(telemetryEvent);
        this.emit('eventTracked', telemetryEvent);

        if (this.events.length >= this.config.maxBatchSize) {
            this.flush();
        }
    }

    public trackRequestMetrics(
        request: ILLMRequest,
        response: ILLMResponse,
        metrics: IPerformanceMetrics
    ): void {
        try {
            this.trackEvent({
                eventType: 'request_completed',
                source: request.model,
                data: {
                    requestId: request.id,
                    latency: metrics.latency,
                    tokenCount: metrics.tokenCount,
                    success: true
                }
            });

            this.updateMetrics(request.model, metrics, true);
        } catch (error) {
            this.handleError('Failed to track request metrics', error as Error);
        }
    }

    public trackError(
        request: ILLMRequest,
        error: Error,
        metrics?: Partial<IPerformanceMetrics>
    ): void {
        try {
            this.trackEvent({
                eventType: 'request_failed',
                source: request.model,
                data: {
                    requestId: request.id,
                    error: error.message,
                    ...(metrics || {})
                }
            });

            if (metrics) {
                this.updateMetrics(request.model, metrics as IPerformanceMetrics, false);
            }
        } catch (error) {
            this.handleError('Failed to track error', error as Error);
        }
    }

    private updateMetrics(
        modelId: string,
        metrics: IPerformanceMetrics,
        success: boolean
    ): void {
        const current = this.metrics.get(modelId) || {
            totalRequests: 0,
            totalTokens: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0,
            errorRate: 0
        };

        const updated: IUsageMetrics = {
            totalRequests: current.totalRequests + 1,
            totalTokens: current.totalTokens + metrics.tokenCount,
            successfulRequests: current.successfulRequests + (success ? 1 : 0),
            failedRequests: current.failedRequests + (success ? 0 : 1),
            averageLatency: (
                (current.averageLatency * current.totalRequests + metrics.latency) /
                (current.totalRequests + 1)
            ),
            errorRate: (current.failedRequests + (success ? 0 : 1)) / (current.totalRequests + 1)
        };

        this.metrics.set(modelId, updated);
        this.emit('metricsUpdated', { modelId, metrics: updated });
    }

    public getMetrics(modelId: string): IUsageMetrics | undefined {
        return this.metrics.get(modelId);
    }

    public async updateConfig(config: Partial<ITelemetryConfig>): Promise<void> {
        this.config = { ...this.config, ...config };

        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }

        if (this.config.enabled) {
            this.startFlushInterval();
        }

        this.emit('configUpdated', this.config);
    }

    private startFlushInterval(): void {
        if (this.config.enabled && this.config.flushIntervalMs > 0) {
            this.flushInterval = setInterval(() => {
                this.flush();
            }, this.config.flushIntervalMs);
        }
    }

    private async flush(): Promise<void> {
        if (this.events.length === 0) {
            return;
        }

        try {
            const eventsToFlush = [...this.events];
            this.events.length = 0;

            // This would implement actual telemetry persistence
            this.emit('eventsFlushed', { count: eventsToFlush.length });
        } catch (error) {
            this.handleError('Failed to flush telemetry events', error as Error);
            // Restore events that failed to flush
            this.events.unshift(...this.events);
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[LLMTelemetryManager]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }

        // Flush any remaining events
        this.flush().catch(error => {
            this.logger.error('Failed to flush events during disposal', error);
        });

        this.events.length = 0;
        this.metrics.clear();
        this.removeAllListeners();
    }
}
