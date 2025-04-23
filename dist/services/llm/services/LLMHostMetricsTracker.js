"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMHostMetricsTracker = void 0;
const events_1 = require("events");
class LLMHostMetricsTracker extends events_1.EventEmitter {
    metrics = {
        totalStarts: 0,
        totalErrors: 0,
        uptime: 0,
        averageCpuUsage: 0,
        averageMemoryUsage: 0,
        lastStartTime: null,
        lastErrorTime: null
    };
    processStartTimes = new Map();
    metricsInterval = null;
    updateInterval = 60000; // 1 minute
    constructor() {
        super();
        this.startMetricsUpdate();
    }
    recordStart(info) {
        this.metrics.totalStarts++;
        this.metrics.lastStartTime = Date.now();
        this.processStartTimes.set(info.pid, Date.now());
        this.updateMetrics();
    }
    recordStop(info) {
        this.processStartTimes.delete(info.pid);
        this.updateMetrics();
    }
    startMetricsUpdate() {
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
        }, this.updateInterval);
    }
    updateMetrics() {
        let totalUptime = 0;
        const now = Date.now();
        for (const startTime of this.processStartTimes.values()) {
            totalUptime += now - startTime;
        }
        this.metrics.uptime = totalUptime;
        this.emit('metrics:updated', this.getCurrentMetrics());
    }
    getCurrentMetrics() {
        return { ...this.metrics };
    }
    dispose() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        this.removeAllListeners();
    }
}
exports.LLMHostMetricsTracker = LLMHostMetricsTracker;
//# sourceMappingURL=LLMHostMetricsTracker.js.map