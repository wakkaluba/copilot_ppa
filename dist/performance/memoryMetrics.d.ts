export interface MemoryMetrics {
    timestamp: number;
    heapUsed: number;
    cacheSizeEntries: number;
    optimizationCount: number;
    averageOptimizationTime: number;
}
export declare class MemoryPerformanceMonitor {
    private static readonly METRICS_LIMIT;
    private metrics;
    private totalOptimizationTime;
    recordMetrics(heapUsed: number, cacheSizeEntries: number, optimizationTime: number): void;
    getPerformanceReport(): string;
    getMetricsHistory(): MemoryMetrics[];
}
