import { EventEmitter } from 'events';
import { HostProcessInfo, HostMetrics } from '../interfaces/HostTypes';
export declare class LLMHostMetricsTracker extends EventEmitter {
    private metrics;
    private processStartTimes;
    private metricsInterval;
    private readonly updateInterval;
    constructor();
    recordStart(info: HostProcessInfo): void;
    recordStop(info: HostProcessInfo): void;
    private startMetricsUpdate;
    private updateMetrics;
    getCurrentMetrics(): HostMetrics;
    dispose(): void;
}
