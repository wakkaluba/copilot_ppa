import * as vscode from 'vscode';

interface StoredMetrics {
    operationTimings: { [operationId: string]: number[] };
    operationTrends: { [operationId: string]: { timestamp: number, duration: number }[] };
    resourceUsage: {
        [operationId: string]: {
            memory: { before: NodeJS.MemoryUsage, after: NodeJS.MemoryUsage }[];
            cpu: { before: NodeJS.CpuUsage, after: NodeJS.CpuUsage }[];
        };
    };
    lastUpdated: number;
}

export class MetricsStorage {
    private static readonly STORAGE_KEY = 'performanceMetrics';
    private static readonly MAX_HISTORY_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
    private static readonly MAX_SAMPLES_PER_OPERATION = 1000;

    constructor(private context: vscode.ExtensionContext) {}

    public async saveMetrics(metrics: StoredMetrics): Promise<void> {
        // Clean up old data before saving
        const cleanedMetrics = this.cleanupOldData(metrics);
        await this.context.globalState.update(MetricsStorage.STORAGE_KEY, cleanedMetrics);
    }

    public async loadMetrics(): Promise<StoredMetrics> {
        const metrics = this.context.globalState.get<StoredMetrics>(MetricsStorage.STORAGE_KEY);
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

    private cleanupOldData(metrics: StoredMetrics): StoredMetrics {
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

    public async clearMetrics(): Promise<void> {
        await this.context.globalState.update(MetricsStorage.STORAGE_KEY, undefined);
    }
}