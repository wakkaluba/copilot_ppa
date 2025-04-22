"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceProfiler = void 0;
const PerformanceSessionService_1 = require("./services/PerformanceSessionService");
const MetricsCaptureService_1 = require("./services/MetricsCaptureService");
const PersistenceService_1 = require("./services/PersistenceService");
const BottleneckDetectionService_1 = require("./services/BottleneckDetectionService");
const CachingService_1 = require("./services/CachingService");
/**
 * PerformanceProfiler measures, collects, and analyzes performance data
 * for various operations in the extension
 */
class PerformanceProfiler {
    static instance;
    sessionService;
    captureService;
    persistenceService;
    bottleneckService;
    cacheService;
    constructor(context) {
        this.sessionService = new PerformanceSessionService_1.PerformanceSessionService(context);
        this.captureService = new MetricsCaptureService_1.MetricsCaptureService();
        this.persistenceService = new PersistenceService_1.PersistenceService(context);
        this.bottleneckService = new BottleneckDetectionService_1.BottleneckDetectionService();
        this.cacheService = new CachingService_1.CachingService();
    }
    static getInstance(context) {
        if (!PerformanceProfiler.instance) {
            PerformanceProfiler.instance = new PerformanceProfiler(context);
        }
        return PerformanceProfiler.instance;
    }
    setEnabled(enabled) {
        this.sessionService.enableProfiling(enabled);
    }
    startOperation(id) {
        this.sessionService.startSession(id);
    }
    endOperation(id, note) {
        const metrics = this.captureService.capture(id);
        this.sessionService.recordMetrics(id, metrics, note);
        this.bottleneckService.analyze(id, metrics);
    }
    getStats(id) {
        return this.sessionService.getStats(id);
    }
    getTrend(id) {
        return this.sessionService.getTrend(id);
    }
    getResourceStats(id) {
        return this.sessionService.getResourceStats(id);
    }
    resetStats() {
        this.sessionService.reset(id);
    }
    async clearStoredMetrics() {
        await this.persistenceService.clear();
    }
    dispose() {
        this.persistenceService.persistAll();
    }
}
exports.PerformanceProfiler = PerformanceProfiler;
//# sourceMappingURL=performanceProfiler.js.map