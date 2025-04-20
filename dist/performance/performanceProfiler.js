"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceProfiler = void 0;
const vscode = __importStar(require("vscode"));
const perf_hooks_1 = require("perf_hooks");
const logger_1 = require("../utils/logger");
const metricsStorage_1 = require("./metricsStorage");
const bottleneckDetector_1 = require("./bottleneckDetector");
const cachingService_1 = require("./cachingService");
/**
 * PerformanceProfiler measures, collects, and analyzes performance data
 * for various operations in the extension
 */
class PerformanceProfiler {
    static instance;
    profilerEnabled = false;
    operationTimes = new Map();
    operationStartTimes = new Map(); // Changed to array to track timestamps
    operationTrends = new Map();
    memoryUsage = new Map();
    cpuUsage = new Map();
    logger;
    metricsStorage;
    persistenceTimer = null;
    static PERSIST_INTERVAL = 5 * 60 * 1000; // 5 minutes
    sessions;
    bottleneckDetector;
    cachingService;
    isProfilingEnabled;
    samplingRate;
    metricsHistory;
    constructor(context) {
        this.logger = new logger_1.Logger();
        this.metricsStorage = new metricsStorage_1.MetricsStorage(context);
        this.loadStoredMetrics();
        this.setupPersistence();
        this.sessions = new Map();
        this.bottleneckDetector = new bottleneckDetector_1.BottleneckDetector();
        this.cachingService = new cachingService_1.CachingService();
        this.isProfilingEnabled = false;
        this.samplingRate = 100; // ms
        this.metricsHistory = new Map();
    }
    static getInstance(context) {
        if (!PerformanceProfiler.instance) {
            if (!context) {
                throw new Error('Context required for first initialization of PerformanceProfiler');
            }
            PerformanceProfiler.instance = new PerformanceProfiler(context);
        }
        return PerformanceProfiler.instance;
    }
    async loadStoredMetrics() {
        try {
            const storedMetrics = await this.metricsStorage.loadMetrics();
            // Convert stored objects back to Maps
            Object.entries(storedMetrics.operationTimings).forEach(([opId, timings]) => {
                this.operationTimes.set(opId, timings);
            });
            Object.entries(storedMetrics.operationTrends).forEach(([opId, trends]) => {
                this.operationTrends.set(opId, trends);
            });
            Object.entries(storedMetrics.resourceUsage).forEach(([opId, usage]) => {
                this.memoryUsage.set(opId, usage.memory);
                this.cpuUsage.set(opId, usage.cpu);
            });
            this.logger.info('Loaded stored performance metrics', {
                operations: this.operationTimes.size,
                lastUpdated: new Date(storedMetrics.lastUpdated).toISOString()
            });
        }
        catch (error) {
            this.logger.error('Failed to load stored metrics', error);
        }
    }
    setupPersistence() {
        if (this.persistenceTimer) {
            clearInterval(this.persistenceTimer);
        }
        this.persistenceTimer = setInterval(() => {
            this.persistMetrics();
        }, PerformanceProfiler.PERSIST_INTERVAL);
    }
    async persistMetrics() {
        if (!this.profilerEnabled)
            return;
        try {
            const metrics = {
                operationTimings: Object.fromEntries(this.operationTimes),
                operationTrends: Object.fromEntries(this.operationTrends),
                resourceUsage: Object.fromEntries(Array.from(this.memoryUsage.entries()).map(([opId, memory]) => [
                    opId,
                    {
                        memory,
                        cpu: this.cpuUsage.get(opId) || []
                    }
                ])),
                lastUpdated: Date.now()
            };
            await this.metricsStorage.saveMetrics(metrics);
            this.logger.info('Persisted performance metrics', { operations: this.operationTimes.size });
        }
        catch (error) {
            this.logger.error('Failed to persist metrics', error);
        }
    }
    dispose() {
        if (this.persistenceTimer) {
            clearInterval(this.persistenceTimer);
            this.persistenceTimer = null;
        }
        this.persistMetrics().catch(error => this.logger.error('Failed to persist metrics during disposal', error));
    }
    /**
     * Enable or disable the performance profiler
     */
    setEnabled(enabled) {
        this.profilerEnabled = enabled;
        this.logger.info('Performance profiler ' + (enabled ? 'enabled' : 'disabled'));
        if (!enabled) {
            // Clear data when disabling
            this.operationTimes.clear();
            this.operationStartTimes.clear();
            this.operationTrends.clear();
            this.memoryUsage.clear();
            this.cpuUsage.clear();
        }
    }
    /**
     * Start timing an operation
     */
    startOperation(operationId) {
        if (!this.profilerEnabled)
            return;
        const timestamp = perf_hooks_1.performance.now();
        if (!this.operationStartTimes.has(operationId)) {
            this.operationStartTimes.set(operationId, []);
        }
        const startTimes = this.operationStartTimes.get(operationId);
        if (startTimes) {
            startTimes.push(timestamp);
        }
        // Record initial resource usage
        if (!this.memoryUsage.has(operationId)) {
            this.memoryUsage.set(operationId, []);
        }
        if (!this.cpuUsage.has(operationId)) {
            this.cpuUsage.set(operationId, []);
        }
        const memUsage = this.memoryUsage.get(operationId);
        const cpuUsage = this.cpuUsage.get(operationId);
        const memBefore = process.memoryUsage();
        const cpuBefore = process.cpuUsage();
        if (memUsage) {
            memUsage.push({ before: memBefore, after: memBefore });
        }
        if (cpuUsage) {
            cpuUsage.push({ before: cpuBefore, after: cpuBefore });
        }
    }
    /**
     * End timing an operation and record its duration
     */
    endOperation(operationId, note) {
        if (!this.profilerEnabled)
            return;
        const startTimes = this.operationStartTimes.get(operationId);
        if (!startTimes || startTimes.length === 0) {
            this.logger.warn(`No start time found for operation: ${operationId}`);
            return;
        }
        const startTime = startTimes.shift();
        const duration = perf_hooks_1.performance.now() - startTime;
        // Store operation time
        if (!this.operationTimes.has(operationId)) {
            this.operationTimes.set(operationId, []);
        }
        const times = this.operationTimes.get(operationId);
        if (times) {
            times.push(duration);
        }
        // Store trend data
        if (!this.operationTrends.has(operationId)) {
            this.operationTrends.set(operationId, []);
        }
        const trends = this.operationTrends.get(operationId);
        if (trends) {
            trends.push({ timestamp: startTime, duration });
        }
        // Update resource usage
        const memUsage = this.memoryUsage.get(operationId);
        const cpuUsage = this.cpuUsage.get(operationId);
        if (memUsage && memUsage.length > 0) {
            const lastEntry = memUsage[memUsage.length - 1];
            if (lastEntry) {
                lastEntry.after = process.memoryUsage();
            }
        }
        if (cpuUsage && cpuUsage.length > 0) {
            const lastEntry = cpuUsage[cpuUsage.length - 1];
            if (lastEntry) {
                lastEntry.after = process.cpuUsage();
            }
        }
        // Log the operation completion
        const message = note
            ? `Operation ${operationId} completed in ${duration.toFixed(2)}ms: ${note}`
            : `Operation ${operationId} completed in ${duration.toFixed(2)}ms`;
        this.logger.info(message);
    }
    /**
     * Get performance statistics for an operation
     */
    getOperationStats(operationId) {
        const times = this.operationTimes.get(operationId);
        if (!times || times.length === 0) {
            return undefined;
        }
        const total = times.reduce((sum, time) => sum + time, 0);
        return {
            avg: total / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
            count: times.length
        };
    }
    /**
     * Get stats for all operations
     */
    getAllStats() {
        const stats = new Map();
        for (const [opId, times] of this.operationTimes.entries()) {
            if (times.length === 0)
                continue;
            const total = times.reduce((sum, time) => sum + time, 0);
            stats.set(opId, {
                avg: total / times.length,
                min: Math.min(...times),
                max: Math.max(...times),
                count: times.length
            });
        }
        return stats;
    }
    /**
     * Get trend analysis for an operation
     */
    getOperationTrend(operationId) {
        const trendData = this.operationTrends.get(operationId);
        if (!trendData || trendData.length < 10)
            return undefined;
        const recentSamples = trendData.slice(-10);
        const historicalSamples = trendData.slice(0, -10);
        if (historicalSamples.length === 0)
            return undefined;
        const recentAvg = recentSamples.reduce((sum, d) => sum + d.duration, 0) / recentSamples.length;
        const historicalAvg = historicalSamples.reduce((sum, d) => sum + d.duration, 0) / historicalSamples.length;
        const changePercent = ((recentAvg - historicalAvg) / historicalAvg) * 100;
        return {
            trend: Math.abs(changePercent) < 5 ? 'stable' : changePercent > 0 ? 'degrading' : 'improving',
            changePercent: Math.abs(changePercent),
            recentAvg,
            historicalAvg
        };
    }
    /**
     * Get resource usage statistics for an operation
     */
    getOperationResourceStats(operationId) {
        const memStats = this.memoryUsage.get(operationId);
        const cpuStats = this.cpuUsage.get(operationId);
        if (!memStats || !cpuStats || memStats.length === 0)
            return undefined;
        const heapUsedDeltas = memStats.map(m => m.after.heapUsed - m.before.heapUsed);
        const externalMemDeltas = memStats.map(m => m.after.external - m.before.external);
        const userTimeDeltas = cpuStats.map(c => c.after.user - c.before.user);
        const systemTimeDeltas = cpuStats.map(c => c.after.system - c.before.system);
        return {
            memory: {
                avgHeapUsed: heapUsedDeltas.reduce((a, b) => a + b, 0) / heapUsedDeltas.length,
                maxHeapUsed: Math.max(...heapUsedDeltas),
                avgExternalMem: externalMemDeltas.reduce((a, b) => a + b, 0) / externalMemDeltas.length
            },
            cpu: {
                avgUserTime: userTimeDeltas.reduce((a, b) => a + b, 0) / userTimeDeltas.length,
                avgSystemTime: systemTimeDeltas.reduce((a, b) => a + b, 0) / systemTimeDeltas.length,
                totalUserTime: userTimeDeltas.reduce((a, b) => a + b, 0),
                totalSystemTime: systemTimeDeltas.reduce((a, b) => a + b, 0)
            }
        };
    }
    /**
     * Reset all collected stats
     */
    resetStats() {
        this.operationTimes.clear();
        this.operationStartTimes.clear();
        this.operationTrends.clear();
        this.memoryUsage.clear();
        this.cpuUsage.clear();
    }
    async clearStoredMetrics() {
        await this.metricsStorage.clearMetrics();
        this.operationTimes.clear();
        this.operationStartTimes.clear();
        this.operationTrends.clear();
        this.memoryUsage.clear();
        this.cpuUsage.clear();
        this.logger.info('Cleared all stored performance metrics');
    }
    startProfiling(sessionId, thresholds) {
        if (this.sessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} already exists`);
        }
        const session = {
            id: sessionId,
            startTime: perf_hooks_1.performance.now(),
            metrics: [],
            markers: new Map(),
            thresholds: {
                maxExecutionTime: thresholds?.maxExecutionTime ?? 1000,
                maxMemoryUsage: thresholds?.maxMemoryUsage ?? 100 * 1024 * 1024, // 100MB
                maxOperationsCount: thresholds?.maxOperationsCount ?? 1000
            }
        };
        this.sessions.set(sessionId, session);
        this.startMetricsCollection(sessionId);
    }
    startMetricsCollection(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        const collectMetrics = () => {
            if (!this.sessions.has(sessionId))
                return;
            const metrics = this.captureMetrics();
            session.metrics.push(metrics);
            // Check for performance issues
            this.analyzeMetrics(sessionId, metrics);
            // Store historical data
            const history = this.metricsHistory.get(sessionId) || [];
            history.push(metrics);
            this.metricsHistory.set(sessionId, history.slice(-100)); // Keep last 100 samples
            setTimeout(collectMetrics, this.samplingRate);
        };
        collectMetrics();
    }
    captureMetrics() {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        return {
            executionTime: perf_hooks_1.performance.now(),
            memoryUsage: {
                heapUsed: memoryUsage.heapUsed,
                heapTotal: memoryUsage.heapTotal,
                external: memoryUsage.external,
                arrayBuffers: memoryUsage.arrayBuffers
            },
            cpuUsage: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            operationsCount: this.bottleneckDetector.getOperationsCount()
        };
    }
    addMarker(sessionId, markerName) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        session.markers.set(markerName, perf_hooks_1.performance.now());
    }
    async stopProfiling(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        const metrics = session.metrics;
        this.sessions.delete(sessionId);
        // Analyze final results
        await this.generateProfilingReport(sessionId, metrics);
        return metrics;
    }
    analyzeMetrics(sessionId, metrics) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        // Check execution time
        if (metrics.executionTime > session.thresholds.maxExecutionTime) {
            this.bottleneckDetector.reportPerformanceIssue({
                type: 'execution-time',
                metric: metrics.executionTime,
                threshold: session.thresholds.maxExecutionTime,
                sessionId
            });
        }
        // Check memory usage
        if (metrics.memoryUsage.heapUsed > session.thresholds.maxMemoryUsage) {
            this.bottleneckDetector.reportPerformanceIssue({
                type: 'memory-usage',
                metric: metrics.memoryUsage.heapUsed,
                threshold: session.thresholds.maxMemoryUsage,
                sessionId
            });
        }
        // Check operation count
        if (metrics.operationsCount > session.thresholds.maxOperationsCount) {
            this.bottleneckDetector.reportPerformanceIssue({
                type: 'operations-count',
                metric: metrics.operationsCount,
                threshold: session.thresholds.maxOperationsCount,
                sessionId
            });
        }
        // Analyze trends
        this.analyzeTrends(sessionId);
    }
    analyzeTrends(sessionId) {
        const history = this.metricsHistory.get(sessionId);
        if (!history || history.length < 2)
            return;
        // Calculate memory growth rate
        const memoryGrowthRate = this.calculateGrowthRate(history.map(m => m.memoryUsage.heapUsed));
        // Calculate operation rate
        const operationGrowthRate = this.calculateGrowthRate(history.map(m => m.operationsCount));
        if (memoryGrowthRate > 0.1) { // 10% growth
            this.bottleneckDetector.reportPerformanceIssue({
                type: 'memory-leak-suspected',
                metric: memoryGrowthRate,
                threshold: 0.1,
                sessionId
            });
        }
        if (operationGrowthRate > 0.2) { // 20% growth
            this.bottleneckDetector.reportPerformanceIssue({
                type: 'operation-count-growth',
                metric: operationGrowthRate,
                threshold: 0.2,
                sessionId
            });
        }
    }
    calculateGrowthRate(values) {
        if (values.length < 2)
            return 0;
        const first = values[0];
        const last = values[values.length - 1];
        return (last - first) / first;
    }
    async generateProfilingReport(sessionId, metrics) {
        const report = {
            sessionId,
            duration: metrics[metrics.length - 1].executionTime - metrics[0].executionTime,
            averageMemoryUsage: this.calculateAverage(metrics.map(m => m.memoryUsage.heapUsed)),
            peakMemoryUsage: Math.max(...metrics.map(m => m.memoryUsage.heapUsed)),
            totalOperations: metrics[metrics.length - 1].operationsCount,
            performanceIssues: this.bottleneckDetector.getIssues(sessionId),
            recommendations: this.generateRecommendations(metrics)
        };
        // Save report
        await this.saveReport(sessionId, report);
    }
    calculateAverage(values) {
        return values.reduce((a, b) => a + b, 0) / values.length;
    }
    generateRecommendations(metrics) {
        const recommendations = [];
        // Memory recommendations
        const memoryGrowth = this.calculateGrowthRate(metrics.map(m => m.memoryUsage.heapUsed));
        if (memoryGrowth > 0.1) {
            recommendations.push('Consider implementing memory cleanup or garbage collection');
        }
        // Operation count recommendations
        const operationGrowth = this.calculateGrowthRate(metrics.map(m => m.operationsCount));
        if (operationGrowth > 0.2) {
            recommendations.push('Review algorithms for potential optimization opportunities');
        }
        // Cache recommendations
        if (this.cachingService.shouldEnableCache(metrics)) {
            recommendations.push('Consider implementing caching for frequently accessed data');
        }
        return recommendations;
    }
    async saveReport(sessionId, report) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportPath = `performance-reports/${sessionId}-${timestamp}.json`;
            // Ensure directory exists
            await vscode.workspace.fs.createDirectory(vscode.Uri.parse('performance-reports'));
            // Save report
            await vscode.workspace.fs.writeFile(vscode.Uri.parse(reportPath), Buffer.from(JSON.stringify(report, null, 2)));
            vscode.window.showInformationMessage(`Performance report saved: ${reportPath}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to save performance report: ${error}`);
        }
    }
}
exports.PerformanceProfiler = PerformanceProfiler;
//# sourceMappingURL=performanceProfiler.js.map