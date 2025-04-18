export interface MemoryMetrics {
    timestamp: number;
    heapUsed: number;
    cacheSizeEntries: number;
    optimizationCount: number;
    averageOptimizationTime: number;
}

export class MemoryPerformanceMonitor {
    private static readonly METRICS_LIMIT = 1000;
    private metrics: MemoryMetrics[] = [];
    private totalOptimizationTime = 0;

    recordMetrics(heapUsed: number, cacheSizeEntries: number, optimizationTime: number): void {
        this.totalOptimizationTime += optimizationTime;
        
        const metrics: MemoryMetrics = {
            timestamp: Date.now(),
            heapUsed,
            cacheSizeEntries,
            optimizationCount: this.metrics.length + 1,
            averageOptimizationTime: this.totalOptimizationTime / (this.metrics.length + 1)
        };

        this.metrics.push(metrics);
        
        // Keep only recent metrics
        if (this.metrics.length > MemoryPerformanceMonitor.METRICS_LIMIT) {
            this.metrics = this.metrics.slice(-MemoryPerformanceMonitor.METRICS_LIMIT);
        }
    }

    getPerformanceReport(): string {
        if (this.metrics.length === 0) {
            return "No memory optimization metrics available yet.";
        }

        const latest = this.metrics[this.metrics.length - 1];
        const first = this.metrics[0];
        const heapDiff = latest.heapUsed - first.heapUsed;

        return `
Memory Optimization Performance Report:
- Total optimizations: ${latest.optimizationCount}
- Average optimization time: ${latest.averageOptimizationTime.toFixed(2)}ms
- Current heap usage: ${(latest.heapUsed / 1024 / 1024).toFixed(2)} MB
- Heap change since start: ${(heapDiff / 1024 / 1024).toFixed(2)} MB
- Current cache entries: ${latest.cacheSizeEntries}
        `.trim();
    }

    getMetricsHistory(): MemoryMetrics[] {
        return [...this.metrics];
    }
}