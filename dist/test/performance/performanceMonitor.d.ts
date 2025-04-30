export declare class PerformanceMonitor {
    measure(fn: () => Promise<any>): Promise<{
        duration: number;
    }>;
    measureMemory(fn: () => Promise<any>): Promise<{
        heapUsed: number;
    }>;
}
