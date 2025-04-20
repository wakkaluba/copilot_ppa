"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsStorage = void 0;
class MetricsStorage {
    context;
    static STORAGE_KEY = 'performanceMetrics';
    static MAX_HISTORY_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
    static MAX_SAMPLES_PER_OPERATION = 1000;
    constructor(context) {
        this.context = context;
    }
    async saveMetrics(metrics) {
        // Clean up old data before saving
        const cleanedMetrics = this.cleanupOldData(metrics);
        await this.context.globalState.update(MetricsStorage.STORAGE_KEY, cleanedMetrics);
    }
    async loadMetrics() {
        const metrics = this.context.globalState.get(MetricsStorage.STORAGE_KEY);
        if (!metrics) {
            return {
                operationTimings: {},
                operationTrends: {},
                resourceUsage: {},
                lastUpdated: Date.now()
            };
        }
        return metrics;
    }
    cleanupOldData(metrics) {
        const now = Date.now();
        const cutoffTime = now - MetricsStorage.MAX_HISTORY_AGE;
        // Clean up operation timings
        Object.entries(metrics.operationTimings).forEach(([opId, timings]) => {
            if (timings.length > MetricsStorage.MAX_SAMPLES_PER_OPERATION) {
                metrics.operationTimings[opId] = timings.slice(-MetricsStorage.MAX_SAMPLES_PER_OPERATION);
            }
        });
        // Clean up operation trends
        Object.entries(metrics.operationTrends).forEach(([opId, trends]) => {
            metrics.operationTrends[opId] = trends
                .filter(trend => trend.timestamp > cutoffTime)
                .slice(-MetricsStorage.MAX_SAMPLES_PER_OPERATION);
        });
        // Clean up resource usage data
        Object.entries(metrics.resourceUsage).forEach(([id, usage]) => {
            const resourceData = metrics.resourceUsage[id];
            if (resourceData) {
                if (usage.memory.length > MetricsStorage.MAX_SAMPLES_PER_OPERATION) {
                    resourceData.memory = usage.memory.slice(-MetricsStorage.MAX_SAMPLES_PER_OPERATION);
                }
                if (usage.cpu.length > MetricsStorage.MAX_SAMPLES_PER_OPERATION) {
                    resourceData.cpu = usage.cpu.slice(-MetricsStorage.MAX_SAMPLES_PER_OPERATION);
                }
            }
        });
        metrics.lastUpdated = now;
        return metrics;
    }
    async clearMetrics() {
        await this.context.globalState.update(MetricsStorage.STORAGE_KEY, undefined);
    }
}
exports.MetricsStorage = MetricsStorage;
//# sourceMappingURL=metricsStorage.js.map