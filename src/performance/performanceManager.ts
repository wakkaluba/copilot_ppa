import * as vscode from 'vscode';
import { PerformanceProfiler } from './performanceProfiler';
import { BottleneckDetector } from './bottleneckDetector';
import { CachingService } from './cachingService';
import { AsyncOptimizer } from './asyncOptimizer';
import { Logger } from '../utils/logger';

/**
 * Performance configuration options
 */
export interface PerformanceConfig {
    profilingEnabled: boolean;
    bottleneckDetectionEnabled: boolean;
    cachingEnabled: boolean;
    maxCacheItems: number;
    reportIntervalMinutes: number;
    trendAnalysisEnabled?: boolean;
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
    private context: vscode.ExtensionContext;
    private config: PerformanceConfig = {
        profilingEnabled: false,
        bottleneckDetectionEnabled: false,
        cachingEnabled: true,
        maxCacheItems: 100,
        reportIntervalMinutes: 30,
        trendAnalysisEnabled: true
    };

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.profiler = PerformanceProfiler.getInstance(context);
        this.bottleneckDetector = BottleneckDetector.getInstance();
        this.cachingService = CachingService.getInstance();
        this.asyncOptimizer = AsyncOptimizer.getInstance();
        this.logger = new Logger();
        
        this.loadConfiguration();
    }

    public static getInstance(context?: vscode.ExtensionContext): PerformanceManager {
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
    public initialize(): void {
        this.logger.info('Initializing PerformanceManager');
        
        // Register configuration change listener
        this.registerDisposable(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('localLLMAgent.performance')) {
                    this.loadConfiguration();
                }
            })
        );

        // Register commands
        this.registerCommands();
        
        // Load initial configuration
        this.loadConfiguration();
    }

    /**
     * Register performance-related commands
     */
    private registerCommands(): void {
        this.registerDisposable(
            vscode.commands.registerCommand('localLLMAgent.clearPerformanceData', () => {
                this.clearPerformanceData();
            })
        );

        this.registerDisposable(
            vscode.commands.registerCommand('localLLMAgent.generatePerformanceReport', () => {
                this.generatePerformanceReport();
            })
        );

        this.registerDisposable(
            vscode.commands.registerCommand('localLLMAgent.toggleProfiling', () => {
                const newState = !this.config.profilingEnabled;
                this.context.workspaceState.update('profilingEnabled', newState);
                this.config.profilingEnabled = newState;
                this.applyConfiguration(this.config);
                this.logger.info(`Profiling ${newState ? 'enabled' : 'disabled'}`);
            })
        );
    }

    /**
     * Register a disposable for cleanup
     */
    private registerDisposable(disposable: vscode.Disposable): void {
        this.context.subscriptions.push(disposable);
    }

    /**
     * Load configuration from VSCode settings and workspace state
     */
    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('localLLMAgent.performance');
        const workspaceEnabled = this.context.workspaceState.get<boolean>('profilingEnabled', false);
        
        this.config = {
            profilingEnabled: workspaceEnabled || config.get<boolean>('profilingEnabled', false),
            bottleneckDetectionEnabled: config.get<boolean>('bottleneckDetectionEnabled', false),
            cachingEnabled: config.get<boolean>('cachingEnabled', true),
            maxCacheItems: config.get<number>('maxCacheItems', 100),
            reportIntervalMinutes: config.get<number>('reportIntervalMinutes', 30),
            trendAnalysisEnabled: config.get<boolean>('trendAnalysisEnabled', true)
        };

        // Save current config to workspace state
        this.context.workspaceState.update('performanceConfig', this.config);

        // Apply the configuration
        this.applyConfiguration(this.config);
    }

    /**
     * Apply configuration settings to all performance components
     */
    private applyConfiguration(config: PerformanceConfig): void {
        this.profiler.setEnabled(config.profilingEnabled);
        this.bottleneckDetector.setEnabled(config.bottleneckDetectionEnabled);
        this.cachingService.setMaxCacheSize(config.maxCacheItems);
        this.setupPerformanceReporting(config.reportIntervalMinutes);
        
        this.logger.info('Performance configuration applied', config);
    }

    /**
     * Setup periodic performance reporting
     */
    private setupPerformanceReporting(intervalMinutes: number): void {
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
    public generatePerformanceReport(): void {
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
            
            const details: any = {
                stats,
                trend: trendInfo,
                resources: resourceInfo
            };
            
            const trendStr = trendInfo 
                ? ` [${trendInfo.trend.toUpperCase()}: ${trendInfo.changePercent.toFixed(1)}% change]` 
                : '';
            
            this.logger.info(
                `${index + 1}. ${opId}: ${stats.avg.toFixed(2)}ms avg, ${stats.max.toFixed(2)}ms max (${stats.count} samples)${trendStr}`,
                details
            );
        });
        
        // Report most frequent operations
        const sortedByCount = Array.from(allStats.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);
            
        this.logger.info('Top 5 most frequent operations:');
        sortedByCount.forEach(([opId, stats], index) => {
            const trendInfo = this.config.trendAnalysisEnabled ? this.profiler.getOperationTrend(opId) : undefined;
            const resourceInfo = this.profiler.getOperationResourceStats(opId);
            
            const details: any = {
                stats,
                trend: trendInfo,
                resources: resourceInfo
            };
            
            const trendStr = trendInfo
                ? ` [${trendInfo.trend.toUpperCase()}: recent ${trendInfo.recentAvg.toFixed(2)}ms vs historical ${trendInfo.historicalAvg.toFixed(2)}ms]`
                : '';
            
            this.logger.info(
                `${index + 1}. ${opId}: ${stats.count} executions, ${stats.avg.toFixed(2)}ms avg${trendStr}`,
                details
            );
        });
        
        // Report high memory usage operations
        const operationIds = Array.from(allStats.keys());
        const memoryStats = operationIds
            .map(opId => ({ opId, stats: this.profiler.getOperationResourceStats(opId) }))
            .filter(item => item.stats !== undefined)
            .sort((a, b) => (b.stats!.memory.maxHeapUsed - a.stats!.memory.maxHeapUsed))
            .slice(0, 3);

        if (memoryStats.length > 0) {
            this.logger.info('Top 3 memory intensive operations:');
            memoryStats.forEach(({ opId, stats }, index) => {
                const maxHeapMB = (stats!.memory.maxHeapUsed / (1024 * 1024)).toFixed(2);
                const avgHeapMB = (stats!.memory.avgHeapUsed / (1024 * 1024)).toFixed(2);
                this.logger.info(
                    `${index + 1}. ${opId}: ${maxHeapMB}MB max heap Δ, ${avgHeapMB}MB avg heap Δ`,
                    stats
                );
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

    public async clearPerformanceData(): Promise<void> {
        await this.profiler.clearStoredMetrics();
        this.bottleneckDetector.resetStats(); // Fix method name
        this.logger.info('All performance data cleared');
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
        
        this.profiler.dispose();
        this.cachingService.dispose();
        this.asyncOptimizer.dispose();
        
        this.logger.info('Performance manager disposed');
    }
}
