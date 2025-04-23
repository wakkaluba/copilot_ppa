import { EventEmitter } from 'events';
import { HostProcessInfo, HostMetrics } from '../interfaces/HostTypes';

export class LLMHostMetricsTracker extends EventEmitter {
    private metrics: HostMetrics = {
        totalStarts: 0,
        totalErrors: 0,
        uptime: 0,
        averageCpuUsage: 0,
        averageMemoryUsage: 0,
        lastStartTime: null,
        lastErrorTime: null
    };

    private processStartTimes = new Map<number, number>();
    private metricsInterval: NodeJS.Timeout | null = null;
    private readonly updateInterval = 60000; // 1 minute

    constructor() {
        super();
        this.startMetricsUpdate();
    }

    public recordStart(info: HostProcessInfo): void {
        this.metrics.totalStarts++;
        this.metrics.lastStartTime = Date.now();
        this.processStartTimes.set(info.pid, Date.now());
        this.updateMetrics();
    }

    public recordStop(info: HostProcessInfo): void {
        this.processStartTimes.delete(info.pid);
        this.updateMetrics();
    }

    private startMetricsUpdate(): void {
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
        }, this.updateInterval);
    }

    private updateMetrics(): void {
        let totalUptime = 0;
        const now = Date.now();

        for (const startTime of this.processStartTimes.values()) {
            totalUptime += now - startTime;
        }

        this.metrics.uptime = totalUptime;
        this.emit('metrics:updated', this.getCurrentMetrics());
    }

    public getCurrentMetrics(): HostMetrics {
        return { ...this.metrics };
    }

    public dispose(): void {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        this.removeAllListeners();
    }
}
