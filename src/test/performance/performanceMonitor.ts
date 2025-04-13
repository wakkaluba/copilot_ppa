export class PerformanceMonitor {
    async measure(fn: () => Promise<any>): Promise<{ duration: number }> {
        const start = Date.now();
        await fn();
        return { duration: Date.now() - start };
    }

    async measureMemory(fn: () => Promise<any>): Promise<{ heapUsed: number }> {
        const initialMemory = process.memoryUsage().heapUsed;
        await fn();
        const finalMemory = process.memoryUsage().heapUsed;
        return { heapUsed: finalMemory - initialMemory };
    }
}
