import * as vscode from 'vscode';
import { PerformanceProfiler } from './performanceProfiler';
import { BottleneckDetector } from './bottleneckDetector';
import { CachingService } from './cachingService';
import { AsyncOptimizer } from './asyncOptimizer';
import { Logger } from '../utils/logger';
import * as path from 'path';

/**
 * Performance configuration options
 */
export interface PerformanceConfig {
    profilingEnabled: boolean;
    bottleneckDetectionEnabled: boolean;
    cachingEnabled: boolean;
    maxCacheItems: number;
    reportIntervalMinutes: number;
}

/**
 * The PerformanceManager coordinates all performance optimization functionality
 * including profiling, bottleneck detection, caching, and async optimization
 */
export class PerformanceManager {
    private static instance: PerformanceManager;
    private profiler: PerformanceProfiler;
    private bottleneckDetector: BottleneckDetector;
    private cachingService: CachingService;
    private asyncOptimizer: AsyncOptimizer;
    private logger: Logger;
    private reportIntervalId: NodeJS.Timeout | null = null;
    private config: PerformanceConfig = {
        profilingEnabled: false,
        bottleneckDetectionEnabled: false,
        cachingEnabled: true,
        maxCacheItems: 100,
        reportIntervalMinutes: 30
    };
    
    private constructor() {
        this.profiler = PerformanceProfiler.getInstance();
        this.bottleneckDetector = BottleneckDetector.getInstance();
        this.cachingService = CachingService.getInstance();
        this.asyncOptimizer = AsyncOptimizer.getInstance();
        this.logger = Logger.getInstance();
        
        // Load configuration
        this.loadConfiguration();
    }
    
    public static getInstance(): PerformanceManager {
        if (!PerformanceManager.instance) {
            PerformanceManager.instance = new PerformanceManager();
        }
        return PerformanceManager.instance;
    }
    
    /**
     * Initialize the performance manager and apply configurations
     */
    public initialize(): void {
        this.logger.log('Initializing PerformanceManager');
        this.applyConfiguration(this.config);
    }
    
    /**
     * Load configuration from VSCode settings
     */
    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('localLLMAgent.performance');
        
        this.config = {
            profilingEnabled: config.get<boolean>('profilingEnabled', false),
            bottleneckDetectionEnabled: config.get<boolean>('bottleneckDetectionEnabled', false),
            cachingEnabled: config.get<boolean>('cachingEnabled', true),
            maxCacheItems: config.get<number>('maxCacheItems', 100),
            reportIntervalMinutes: config.get<number>('reportIntervalMinutes', 30)
        };
    }
    
    /**
     * Apply configuration settings to all performance components
     */
    private applyConfiguration(config: PerformanceConfig): void {
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
    private setupPerformanceReporting(intervalMinutes: number): void {
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
    public generatePerformanceReport(): void {
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
    public getProfiler(): PerformanceProfiler {
        return this.profiler;
    }
    
    /**
     * Get the bottleneck detector instance
     */
    public getBottleneckDetector(): BottleneckDetector {
        return this.bottleneckDetector;
    }
    
    /**
     * Get the caching service instance
     */
    public getCachingService(): CachingService {
        return this.cachingService;
    }
    
    /**
     * Get the async optimizer instance
     */
    public getAsyncOptimizer(): AsyncOptimizer {
        return this.asyncOptimizer;
    }
    
    /**
     * Dispose all performance services
     */
    public dispose(): void {
        if (this.reportIntervalId) {
            clearInterval(this.reportIntervalId);
            this.reportIntervalId = null;
        }
        
        this.cachingService.dispose();
        this.asyncOptimizer.dispose();
        
        this.logger.log('Performance manager disposed');
    }
}
