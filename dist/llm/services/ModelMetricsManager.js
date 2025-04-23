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
exports.ModelMetricsManager = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
class ModelMetricsManager extends events_1.EventEmitter {
    outputChannel;
    metricsHistory = new Map();
    retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    samplingInterval = 60 * 1000; // 1 minute
    cleanupInterval = null;
    logger = new logger_1.Logger();
    constructor() {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Metrics');
        this.startPeriodicCleanup();
    }
    async trackMetrics(modelId, metrics) {
        try {
            this.addMetricsSnapshot(modelId, metrics);
            this.analyzePerformanceTrends(modelId);
            this.emitMetricsUpdate(modelId, metrics);
            this.logMetricsUpdate(modelId, metrics);
        }
        catch (error) {
            this.handleError('Failed to track metrics', error);
        }
    }
    getMetricsHistory(modelId) {
        return this.metricsHistory.get(modelId) || [];
    }
    getLatestSnapshot(history) {
        return history.length > 0 ? history[history.length - 1] : undefined;
    }
    getLatestMetrics(modelId) {
        const history = this.getMetricsHistory(modelId);
        return this.getLatestSnapshot(history)?.metrics;
    }
    getAggregateMetrics(modelId) {
        const history = this.getMetricsHistory(modelId);
        const latest = this.getLatestSnapshot(history);
        if (!latest)
            return undefined;
        return {
            averageResponseTime: this.calculateAverageResponseTime(history),
            tokenThroughput: this.calculateAverageThroughput(history),
            errorRate: this.calculateAverageErrorRate(history),
            totalRequests: this.calculateTotalRequests(history),
            totalTokens: this.calculateTotalTokens(history),
            lastUsed: new Date(latest.timestamp)
        };
    }
    addMetricsSnapshot(modelId, metrics) {
        const history = this.metricsHistory.get(modelId) || [];
        history.push({
            timestamp: Date.now(),
            metrics: { ...metrics }
        });
        this.metricsHistory.set(modelId, history);
    }
    analyzePerformanceTrends(modelId) {
        const history = this.getMetricsHistory(modelId);
        if (history.length < 2)
            return;
        const recentSnapshots = history.slice(-10); // Analyze last 10 snapshots
        // Analyze response time trend
        const responseTimeTrend = this.calculateTrend(recentSnapshots.map(s => s.metrics.averageResponseTime));
        // Analyze throughput trend
        const throughputTrend = this.calculateTrend(recentSnapshots.map(s => s.metrics.tokenThroughput));
        // Analyze error rate trend
        const errorRateTrend = this.calculateTrend(recentSnapshots.map(s => s.metrics.errorRate));
        this.emit('performanceTrend', {
            modelId,
            responseTimeTrend,
            throughputTrend,
            errorRateTrend
        });
        this.logPerformanceTrends(modelId, {
            responseTimeTrend,
            throughputTrend,
            errorRateTrend
        });
    }
    calculateTrend(values) {
        if (values.length < 2)
            return 0;
        const n = values.length;
        const sumX = values.reduce((sum, _, i) => sum + i, 0);
        const sumY = values.reduce((sum, value) => sum + value, 0);
        const sumXY = values.reduce((sum, value, i) => sum + i * value, 0);
        const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);
        // Calculate slope of linear regression
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }
    calculateAverageResponseTime(history) {
        return this.calculateAverage(history.map(s => s.metrics.averageResponseTime));
    }
    calculateAverageThroughput(history) {
        return this.calculateAverage(history.map(s => s.metrics.tokenThroughput));
    }
    calculateAverageErrorRate(history) {
        return this.calculateAverage(history.map(s => s.metrics.errorRate));
    }
    calculateTotalRequests(history) {
        return history.reduce((sum, s) => sum + s.metrics.totalRequests, 0);
    }
    calculateTotalTokens(history) {
        return history.reduce((sum, s) => sum + s.metrics.totalTokens, 0);
    }
    calculateAverage(values) {
        if (values.length === 0)
            return 0;
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    emitMetricsUpdate(modelId, metrics) {
        this.emit('metricsUpdated', { modelId, metrics });
    }
    startPeriodicCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cleanupInterval = setInterval(() => {
            try {
                this.cleanupOldMetrics();
            }
            catch (error) {
                this.handleError('Failed to cleanup metrics', error);
            }
        }, this.samplingInterval);
    }
    cleanupOldMetrics() {
        const cutoffTime = Date.now() - this.retentionPeriod;
        for (const [modelId, history] of this.metricsHistory.entries()) {
            const filteredHistory = history.filter(s => s.timestamp >= cutoffTime);
            if (filteredHistory.length !== history.length) {
                this.metricsHistory.set(modelId, filteredHistory);
                this.logMetricsCleanup(modelId, history.length - filteredHistory.length);
            }
        }
    }
    logMetricsUpdate(modelId, metrics) {
        this.outputChannel.appendLine('\nMetrics Update:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine(`Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
        this.outputChannel.appendLine(`Throughput: ${metrics.tokenThroughput.toFixed(2)} tokens/sec`);
        this.outputChannel.appendLine(`Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
    }
    logPerformanceTrends(modelId, trends) {
        this.outputChannel.appendLine('\nPerformance Trends:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        Object.entries(trends).forEach(([metric, trend]) => {
            const direction = trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable';
            this.outputChannel.appendLine(`${metric}: ${direction} (${Math.abs(trend).toFixed(4)})`);
        });
    }
    logMetricsCleanup(modelId, removedCount) {
        this.outputChannel.appendLine(`\nCleaned up ${removedCount} old metrics for model ${modelId}`);
    }
    handleError(message, error) {
        this.logger.error(`[ModelMetricsManager] ${message}: ${error.message}`);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    dispose() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.metricsHistory.clear();
    }
}
exports.ModelMetricsManager = ModelMetricsManager;
//# sourceMappingURL=ModelMetricsManager.js.map