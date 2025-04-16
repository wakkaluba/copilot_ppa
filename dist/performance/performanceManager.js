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
    constructor() {
        this.reportIntervalId = null;
        this.config = {
            profilingEnabled: false,
            bottleneckDetectionEnabled: false,
            cachingEnabled: true,
            maxCacheItems: 100,
            reportIntervalMinutes: 30
        };
        this.profiler = performanceProfiler_1.PerformanceProfiler.getInstance();
        this.bottleneckDetector = bottleneckDetector_1.BottleneckDetector.getInstance();
        this.cachingService = cachingService_1.CachingService.getInstance();
        this.asyncOptimizer = asyncOptimizer_1.AsyncOptimizer.getInstance();
        this.logger = logger_1.Logger.getInstance();
        // Load configuration
        this.loadConfiguration();
    }
    static getInstance() {
        if (!PerformanceManager.instance) {
            PerformanceManager.instance = new PerformanceManager();
        }
        return PerformanceManager.instance;
    }
    /**
     * Initialize the performance manager and apply configurations
     */
    initialize() {
        this.logger.log('Initializing PerformanceManager');
        this.applyConfiguration(this.config);
    }
    /**
     * Load configuration from VSCode settings
     */
    loadConfiguration() {
        const config = vscode.workspace.getConfiguration('localLLMAgent.performance');
        this.config = {
            profilingEnabled: config.get('profilingEnabled', false),
            bottleneckDetectionEnabled: config.get('bottleneckDetectionEnabled', false),
            cachingEnabled: config.get('cachingEnabled', true),
            maxCacheItems: config.get('maxCacheItems', 100),
            reportIntervalMinutes: config.get('reportIntervalMinutes', 30)
        };
    }
    /**
     * Apply configuration settings to all performance components
     */
    applyConfiguration(config) {
        // Configure profiler
        this.profiler.setEnabled(config.profilingEnabled);
        // Configure bottleneck detector
        this.bottleneckDetector.setEnabled(config.bottleneckDetectionEnabled);
        // Configure caching service
        this.cachingService.setMaxCacheSize(config.maxCacheItems);
        // Setup performance reporting if enabled
        this.setupPerformanceReporting(config.reportIntervalMinutes);
        this.logger.log('Performance configuration applied');
    }
    /**
     * Setup periodic performance reporting
     */
    setupPerformanceReporting(intervalMinutes) {
        // Clear existing interval if any
        if (this.reportIntervalId) {
            clearInterval(this.reportIntervalId);
            this.reportIntervalId = null;
        }
        // Only setup reporting if profiling is enabled
        if (!this.config.profilingEnabled) {
            return;
        }
        const intervalMs = intervalMinutes * 60 * 1000;
        this.reportIntervalId = setInterval(() => {
            this.generatePerformanceReport();
        }, intervalMs);
        this.logger.log(`Performance reporting scheduled every ${intervalMinutes} minutes`);
    }
    /**
     * Generate a performance report with current statistics
     */
    generatePerformanceReport() {
        if (!this.config.profilingEnabled) {
            this.logger.log('Performance reporting is disabled. Enable profiling to generate reports.');
            return;
        }
        this.logger.log('=== PERFORMANCE REPORT ===');
        // Get operation statistics
        const allStats = this.profiler.getAllStats();
        if (allStats.size === 0) {
            this.logger.log('No performance data collected yet.');
            this.logger.log('========================');
            return;
        }
        // Report overall statistics
        this.logger.log(`Total operations tracked: ${allStats.size}`);
        // Report slowest operations
        const sortedByAvg = Array.from(allStats.entries())
            .sort((a, b) => b[1].avg - a[1].avg)
            .slice(0, 5);
        this.logger.log('Top 5 slowest operations (by average time):');
        sortedByAvg.forEach(([opId, stats], index) => {
            this.logger.log(`${index + 1}. ${opId}: ${stats.avg.toFixed(2)}ms avg, ${stats.max.toFixed(2)}ms max (${stats.count} samples)`);
        });
        // Report most frequent operations
        const sortedByCount = Array.from(allStats.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);
        this.logger.log('Top 5 most frequent operations:');
        sortedByCount.forEach(([opId, stats], index) => {
            this.logger.log(`${index + 1}. ${opId}: ${stats.count} executions, ${stats.avg.toFixed(2)}ms avg`);
        });
        // Report detected bottlenecks if enabled
        if (this.config.bottleneckDetectionEnabled) {
            const bottlenecks = this.bottleneckDetector.analyzeAll();
            if (bottlenecks.critical.length > 0) {
                this.logger.log(`Critical bottlenecks detected: ${bottlenecks.critical.length}`);
            }
            if (bottlenecks.warnings.length > 0) {
                this.logger.log(`Performance warnings detected: ${bottlenecks.warnings.length}`);
            }
        }
        this.logger.log('========================');
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
        this.cachingService.dispose();
        this.asyncOptimizer.dispose();
        this.logger.log('Performance manager disposed');
    }
}
exports.PerformanceManager = PerformanceManager;
//# sourceMappingURL=performanceManager.js.map