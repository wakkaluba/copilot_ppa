"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryPerformanceMonitor = void 0;
var MemoryPerformanceMonitor = /** @class */ (function () {
    function MemoryPerformanceMonitor() {
        this.metrics = [];
        this.totalOptimizationTime = 0;
    }
    MemoryPerformanceMonitor.prototype.recordMetrics = function (heapUsed, cacheSizeEntries, optimizationTime) {
        this.totalOptimizationTime += optimizationTime;
        var metrics = {
            timestamp: new Date(),
            heapUsed: heapUsed,
            cacheSizeEntries: cacheSizeEntries,
            optimizationCount: this.metrics.length + 1,
            averageOptimizationTime: this.totalOptimizationTime / (this.metrics.length + 1)
        };
        this.metrics.push(metrics);
        // Keep only recent metrics
        if (this.metrics.length > MemoryPerformanceMonitor.METRICS_LIMIT) {
            this.metrics = this.metrics.slice(-MemoryPerformanceMonitor.METRICS_LIMIT);
        }
    };
    MemoryPerformanceMonitor.prototype.getPerformanceReport = function () {
        if (this.metrics.length === 0) {
            return "No memory optimization metrics available yet.";
        }
        var latest = this.metrics[this.metrics.length - 1];
        var first = this.metrics[0];
        var heapDiff = latest.heapUsed - first.heapUsed;
        return "\nMemory Optimization Performance Report:\n- Total optimizations: ".concat(latest.optimizationCount, "\n- Average optimization time: ").concat(latest.averageOptimizationTime.toFixed(2), "ms\n- Current heap usage: ").concat((latest.heapUsed / 1024 / 1024).toFixed(2), " MB\n- Heap change since start: ").concat((heapDiff / 1024 / 1024).toFixed(2), " MB\n- Current cache entries: ").concat(latest.cacheSizeEntries, "\n        ").trim();
    };
    MemoryPerformanceMonitor.prototype.getMetricsHistory = function () {
        return __spreadArray([], this.metrics, true);
    };
    MemoryPerformanceMonitor.METRICS_LIMIT = 1000;
    return MemoryPerformanceMonitor;
}());
exports.MemoryPerformanceMonitor = MemoryPerformanceMonitor;
