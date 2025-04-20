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
exports.PerformanceManager = void 0;
const vscode = __importStar(require("vscode"));
const performanceProfiler_1 = require("./performanceProfiler");
const bottleneckDetector_1 = require("./bottleneckDetector");
const cachingService_1 = require("./cachingService");
const asyncOptimizer_1 = require("./asyncOptimizer");
const logger_1 = require("../utils/logger");
/**
 * The PerformanceManager coordinates all performance optimization functionality
 * including profiling, bottleneck detection, caching, and async optimization
 */
class PerformanceManager {
    static instance;
    profiler;
    bottleneckDetector;
    cachingService;
    asyncOptimizer;
    logger;
    reportIntervalId = null;
    context;
    config = {
        profilingEnabled: false,
        bottleneckDetectionEnabled: false,
        cachingEnabled: true,
        maxCacheItems: 100,
        reportIntervalMinutes: 30,
        trendAnalysisEnabled: true
    };
    constructor(context) {
        this.context = context;
        this.profiler = performanceProfiler_1.PerformanceProfiler.getInstance(context);
        this.bottleneckDetector = bottleneckDetector_1.BottleneckDetector.getInstance();
        this.cachingService = cachingService_1.CachingService.getInstance();
        this.asyncOptimizer = asyncOptimizer_1.AsyncOptimizer.getInstance();
        this.logger = new logger_1.Logger();
        this.loadConfiguration();
    }
    static getInstance(context) {
        if (!PerformanceManager.instance) {
            if (!context) {
                throw new Error('Context required for first initialization of PerformanceManager');
            }
            PerformanceManager.instance = new PerformanceManager(context);
        }
        return PerformanceManager.instance;
    }
    /**
     * Initialize the performance manager and apply configurations
     */
    initialize() {
        this.logger.info('Initializing PerformanceManager');
        // Register configuration change listener
        this.registerDisposable(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('localLLMAgent.performance')) {
                this.loadConfiguration();
            }
        }));
        // Register commands
        this.registerCommands();
        // Load initial configuration
        this.loadConfiguration();
    }
    /**
     * Register performance-related commands
     */
    registerCommands() {
        this.registerDisposable(vscode.commands.registerCommand('localLLMAgent.clearPerformanceData', () => {
            this.clearPerformanceData();
        }));
        this.registerDisposable(vscode.commands.registerCommand('localLLMAgent.generatePerformanceReport', () => {
            this.generatePerformanceReport();
        }));
        this.registerDisposable(vscode.commands.registerCommand('localLLMAgent.toggleProfiling', () => {
            const newState = !this.config.profilingEnabled;
            this.context.workspaceState.update('profilingEnabled', newState);
            this.config.profilingEnabled = newState;
            this.applyConfiguration(this.config);
            this.logger.info(`Profiling ${newState ? 'enabled' : 'disabled'}`);
        }));
    }
    /**
     * Register a disposable for cleanup
     */
    registerDisposable(disposable) {
        this.context.subscriptions.push(disposable);
    }
    /**
     * Load configuration from VSCode settings and workspace state
     */
    loadConfiguration() {
        const config = vscode.workspace.getConfiguration('localLLMAgent.performance');
        const workspaceEnabled = this.context.workspaceState.get('profilingEnabled', false);
        this.config = {
            profilingEnabled: workspaceEnabled || config.get('profilingEnabled', false),
            bottleneckDetectionEnabled: config.get('bottleneckDetectionEnabled', false),
            cachingEnabled: config.get('cachingEnabled', true),
            maxCacheItems: config.get('maxCacheItems', 100),
            reportIntervalMinutes: config.get('reportIntervalMinutes', 30),
            trendAnalysisEnabled: config.get('trendAnalysisEnabled', true)
        };
        // Save current config to workspace state
        this.context.workspaceState.update('performanceConfig', this.config);
        // Apply the configuration
        this.applyConfiguration(this.config);
    }
    /**
     * Apply configuration settings to all performance components
     */
    applyConfiguration(config) {
        this.profiler.setEnabled(config.profilingEnabled);
        this.bottleneckDetector.setEnabled(config.bottleneckDetectionEnabled);
        this.cachingService.setMaxCacheSize(config.maxCacheItems);
        this.setupPerformanceReporting(config.reportIntervalMinutes);
        this.logger.info('Performance configuration applied', config);
    }
    /**
     * Setup periodic performance reporting
     */
    setupPerformanceReporting(intervalMinutes) {
        if (this.reportIntervalId) {
            clearInterval(this.reportIntervalId);
            this.reportIntervalId = null;
        }
        if (!this.config.profilingEnabled) {
            return;
        }
        const intervalMs = intervalMinutes * 60 * 1000;
        this.reportIntervalId = setInterval(() => {
            this.generatePerformanceReport();
        }, intervalMs);
        this.logger.info(`Performance reporting scheduled`, { intervalMinutes });
    }
    /**
     * Generate a performance report with current statistics
     */
    generatePerformanceReport() {
        if (!this.config.profilingEnabled) {
            this.logger.warn('Performance reporting is disabled');
            return;
        }
        this.logger.info('=== PERFORMANCE REPORT ===');
        const allStats = this.profiler.getAllStats();
        if (allStats.size === 0) {
            this.logger.info('No performance data collected yet');
            return;
        }
        this.logger.info(`Total operations tracked: ${allStats.size}`);
        // Report slowest operations
        const sortedByAvg = Array.from(allStats.entries())
            .sort((a, b) => b[1].avg - a[1].avg)
            .slice(0, 5);
        this.logger.info('Top 5 slowest operations:');
        sortedByAvg.forEach(([opId, stats], index) => {
            const trendInfo = this.config.trendAnalysisEnabled ? this.profiler.getOperationTrend(opId) : undefined;
            const resourceInfo = this.profiler.getOperationResourceStats(opId);
            const details = {
                stats,
                trend: trendInfo,
                resources: resourceInfo
            };
            const trendStr = trendInfo
                ? ` [${trendInfo.trend.toUpperCase()}: ${trendInfo.changePercent.toFixed(1)}% change]`
                : '';
            this.logger.info(`${index + 1}. ${opId}: ${stats.avg.toFixed(2)}ms avg, ${stats.max.toFixed(2)}ms max (${stats.count} samples)${trendStr}`, details);
        });
        // Report most frequent operations
        const sortedByCount = Array.from(allStats.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);
        this.logger.info('Top 5 most frequent operations:');
        sortedByCount.forEach(([opId, stats], index) => {
            const trendInfo = this.config.trendAnalysisEnabled ? this.profiler.getOperationTrend(opId) : undefined;
            const resourceInfo = this.profiler.getOperationResourceStats(opId);
            const details = {
                stats,
                trend: trendInfo,
                resources: resourceInfo
            };
            const trendStr = trendInfo
                ? ` [${trendInfo.trend.toUpperCase()}: recent ${trendInfo.recentAvg.toFixed(2)}ms vs historical ${trendInfo.historicalAvg.toFixed(2)}ms]`
                : '';
            this.logger.info(`${index + 1}. ${opId}: ${stats.count} executions, ${stats.avg.toFixed(2)}ms avg${trendStr}`, details);
        });
        // Report high memory usage operations
        const operationIds = Array.from(allStats.keys());
        const memoryStats = operationIds
            .map(opId => ({ opId, stats: this.profiler.getOperationResourceStats(opId) }))
            .filter(item => item.stats !== undefined)
            .sort((a, b) => (b.stats.memory.maxHeapUsed - a.stats.memory.maxHeapUsed))
            .slice(0, 3);
        if (memoryStats.length > 0) {
            this.logger.info('Top 3 memory intensive operations:');
            memoryStats.forEach(({ opId, stats }, index) => {
                const maxHeapMB = (stats.memory.maxHeapUsed / (1024 * 1024)).toFixed(2);
                const avgHeapMB = (stats.memory.avgHeapUsed / (1024 * 1024)).toFixed(2);
                this.logger.info(`${index + 1}. ${opId}: ${maxHeapMB}MB max heap Δ, ${avgHeapMB}MB avg heap Δ`, stats);
            });
        }
        // Report detected bottlenecks if enabled
        if (this.config.bottleneckDetectionEnabled) {
            const bottlenecks = this.bottleneckDetector.analyzeAll();
            if (bottlenecks.critical.length > 0) {
                this.logger.error('Critical bottlenecks detected:', bottlenecks.critical);
            }
            if (bottlenecks.warnings.length > 0) {
                this.logger.warn('Performance warnings detected:', bottlenecks.warnings);
            }
        }
    }
    async clearPerformanceData() {
        await this.profiler.clearStoredMetrics();
        this.bottleneckDetector.resetStats(); // Fix method name
        this.logger.info('All performance data cleared');
    }
    /**
     * Get the profiler instance
     */
    getProfiler() {
        return this.profiler;
    }
    /**
     * Get the bottleneck detector instance
     */
    getBottleneckDetector() {
        return this.bottleneckDetector;
    }
    /**
     * Get the caching service instance
     */
    getCachingService() {
        return this.cachingService;
    }
    /**
     * Get the async optimizer instance
     */
    getAsyncOptimizer() {
        return this.asyncOptimizer;
    }
    /**
     * Dispose all performance services
     */
    dispose() {
        if (this.reportIntervalId) {
            clearInterval(this.reportIntervalId);
            this.reportIntervalId = null;
        }
        this.profiler.dispose();
        this.cachingService.dispose();
        this.asyncOptimizer.dispose();
        this.logger.info('Performance manager disposed');
    }
}
exports.PerformanceManager = PerformanceManager;
//# sourceMappingURL=performanceManager.js.map