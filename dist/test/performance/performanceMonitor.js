"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
class PerformanceMonitor {
    async measure(fn) {
        const start = Date.now();
        await fn();
        return { duration: Date.now() - start };
    }
    async measureMemory(fn) {
        const initialMemory = process.memoryUsage().heapUsed;
        await fn();
        const finalMemory = process.memoryUsage().heapUsed;
        return { heapUsed: finalMemory - initialMemory };
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
//# sourceMappingURL=performanceMonitor.js.map