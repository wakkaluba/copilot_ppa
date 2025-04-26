import * as vscode from 'vscode';
import { WorkspacePerformanceResult, PerformanceAnalysisResult } from './types';
import { PerformanceAnalyzerService } from './services/PerformanceAnalyzerService';
import { PerformanceStatusService } from './services/PerformanceStatusService';
import { PerformanceDiagnosticsService } from './services/PerformanceDiagnosticsService';
import { PerformanceFileMonitorService } from './services/PerformanceFileMonitorService';
import { PerformanceConfigService } from './services/PerformanceConfigService';
import { PerformanceProfiler } from './performanceProfiler';
import { BottleneckDetector } from './bottleneckDetector';
import { EventEmitter } from 'events';
import { CachingService } from './cachingService';
import { AsyncOptimizer } from './asyncOptimizer';
import { LoggerImpl } from '../utils/logger';

/**
 * Central manager for all performance-related functionality in the extension.
 * Coordinates analysis, profiling, monitoring and reporting of performance metrics.
 */
export class PerformanceManager implements vscode.Disposable {
    private static instance: PerformanceManager;
    private readonly analyzerService: PerformanceAnalyzerService;
    private readonly statusService: PerformanceStatusService;
    private readonly diagnosticsService: PerformanceDiagnosticsService;
    private readonly fileMonitorService: PerformanceFileMonitorService;
    private readonly configService: PerformanceConfigService;
    private readonly profiler: PerformanceProfiler;
    private readonly bottleneckDetector: BottleneckDetector;
    private readonly cachingService: CachingService;
    private readonly asyncOptimizer: AsyncOptimizer;
    private readonly eventEmitter: EventEmitter;
    private readonly logger: LoggerImpl;

    private constructor(extensionContext: vscode.ExtensionContext) {
        this.eventEmitter = new EventEmitter();
        this.configService = new PerformanceConfigService();
        this.analyzerService = new PerformanceAnalyzerService(this.configService);
        this.statusService = new PerformanceStatusService();
        this.diagnosticsService = new PerformanceDiagnosticsService();
        this.fileMonitorService = new PerformanceFileMonitorService();
        this.profiler = PerformanceProfiler.getInstance(extensionContext);
        this.bottleneckDetector = BottleneckDetector.getInstance();
        this.cachingService = CachingService.getInstance();
        this.asyncOptimizer = AsyncOptimizer.getInstance();
        this.logger = new LoggerImpl();
        
        this.setupEventListeners();
        this.initializeServices().catch(error => {
            this.logger.error('Failed to initialize performance services:', error);
            vscode.window.showErrorMessage('Failed to initialize performance services');
        });
    }

    public static getInstance(context?: vscode.ExtensionContext): PerformanceManager {
        if (!PerformanceManager.instance) {
            if (!context) {
                throw new Error('Context required for PerformanceManager initialization');
            }
            PerformanceManager.instance = new PerformanceManager(context);
        }
        return PerformanceManager.instance;
    }

    private async initializeServices(): Promise<void> {
        try {
            await this.configService.initialize();
            this.profiler.setEnabled(this.configService.isProfilingEnabled());
            this.bottleneckDetector.setEnabled(this.configService.isBottleneckDetectionEnabled());
            
            const cachingOptions = this.configService.getCachingOptions();
            this.cachingService.setMaxCacheSize(cachingOptions.maxSize);
            
            this.asyncOptimizer.setConfig(this.configService.getAsyncOptions());
            
            this.eventEmitter.emit('servicesInitialized');
        } catch (error) {
            this.logger.error('Failed to initialize performance services:', error);
            throw error;
        }
    }

    /**
     * Analyzes the performance of the entire workspace.
     * This includes analyzing all relevant files and collecting workspace-wide metrics.
     */
    public async analyzeWorkspace(): Promise<WorkspacePerformanceResult> {
        if (!vscode.workspace.workspaceFolders) {
            throw new Error('No workspace folders found');
        }

        const operationId = 'workspace-analysis';
        this.profiler.startOperation(operationId);
        
        try {
            return await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing workspace performance",
                cancellable: true
            }, async (progress, token) => {
                const files = await this.fileMonitorService.findAnalyzableFiles();
                const result = await this.analyzerService.analyzeWorkspace(files, progress, token);
                
                if (token.isCancellationRequested) {
                    throw new Error('Analysis cancelled by user');
                }

                this.eventEmitter.emit('workspaceAnalysisComplete', result);
                await this.updateWorkspaceMetrics(result);
                return result;
            });
        } catch (error) {
            this.logger.error('Workspace analysis failed:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Workspace analysis failed: ${message}`);
            throw error;
        } finally {
            this.profiler.endOperation(operationId);
        }
    }

    /**
     * Analyzes a specific file for performance issues.
     * @param document The document to analyze
     */
    public async analyzeFile(document: vscode.TextDocument): Promise<PerformanceAnalysisResult | null> {
        const operationId = `file-analysis-${document.uri.fsPath}`;
        this.profiler.startOperation(operationId);

        try {
            const result = await this.analyzerService.analyzeFile(document);
            if (result) {
                this.statusService.updateStatusBar(result);
                this.diagnosticsService.updateDiagnostics(document, result);
                this.bottleneckDetector.analyzeOperation(operationId);
                this.eventEmitter.emit('fileAnalysisComplete', result);
                await this.updateFileMetrics(document.uri, result);
            }
            return result;
        } catch (error) {
            this.logger.error(`File analysis failed for ${document.uri.fsPath}:`, error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`File analysis failed: ${message}`);
            return null;
        } finally {
            this.profiler.endOperation(operationId);
        }
    }

    /**
     * Analyzes the currently active file in the editor.
     */
    public async analyzeCurrentFile(): Promise<PerformanceAnalysisResult | null> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }
        return this.analyzeFile(editor.document);
    }

    /**
     * Generates a performance report with current metrics and bottleneck analysis.
     */
    public generatePerformanceReport(): void {
        const operationStats = this.profiler.getStats('all');
        const bottleneckAnalysis = this.bottleneckDetector.analyzeAll();
        const cacheStats = this.cachingService.getCacheStats();
        const asyncStats = this.asyncOptimizer.getStats();

        this.logger.info('Performance Report:');
        this.logger.info(`Operations analyzed: ${operationStats?.length || 0}`);
        this.logger.info(`Critical bottlenecks detected: ${bottleneckAnalysis.critical.length}`);
        this.logger.info(`Performance warnings detected: ${bottleneckAnalysis.warnings.length}`);
        this.logger.info(`Cache hits: ${cacheStats.hits}, misses: ${cacheStats.misses}, evictions: ${cacheStats.evictions}`);
        this.logger.info(`Async operations optimized: ${asyncStats.optimizedCount}`);

        this.eventEmitter.emit('performanceReport', {
            operationStats,
            bottleneckAnalysis,
            cacheStats,
            asyncStats
        });
    }

    private setupEventListeners(): void {
        this.fileMonitorService.onDocumentSaved((document: vscode.TextDocument) => 
            this.handleDocumentChange(document)
        );
        
        this.fileMonitorService.onActiveEditorChanged((editor: vscode.TextEditor | undefined) => {
            if (editor) {
                this.analyzeFile(editor.document).catch(error => {
                    this.logger.error('Failed to analyze active editor:', error);
                });
            }
        });

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('performance')) {
                this.initializeServices().catch(error => {
                    this.logger.error('Failed to reinitialize services:', error);
                });
            }
        });
    }

    private handleDocumentChange(document: vscode.TextDocument): void {
        this.fileMonitorService.throttleDocumentChange(document, async () => {
            const result = await this.analyzeFile(document);
            if (result) {
                this.statusService.updateStatusBar(result);
                this.diagnosticsService.updateDiagnostics(document, result);
                await this.updateFileMetrics(document.uri, result);
            }
        });
    }

    private async updateWorkspaceMetrics(result: WorkspacePerformanceResult): Promise<void> {
        try {
            const operationId = 'workspace-analysis';
            const stats = this.profiler.getStats(operationId);
            if (stats) {
                stats.metadata = {
                    filesAnalyzed: result.summary.filesAnalyzed,
                    totalIssues: result.summary.totalIssues,
                    criticalIssues: result.summary.criticalIssues,
                    highIssues: result.summary.highIssues
                };
            }

            // Update bottleneck tracking
            for (const fileResult of result.fileResults) {
                const fileStats = this.profiler.getStats(`file-analysis-${fileResult.filePath}`);
                this.bottleneckDetector.analyzeOperation(`file-${fileResult.filePath}`, {
                    stats: fileStats,
                    issues: fileResult.issues.length,
                    metrics: fileResult.metrics
                });
            }

            this.eventEmitter.emit('workspaceMetricsUpdated', result.summary);
        } catch (error) {
            this.logger.error('Failed to update workspace metrics:', error);
        }
    }

    private async updateFileMetrics(uri: vscode.Uri, result: PerformanceAnalysisResult): Promise<void> {
        try {
            const operationId = `file-analysis-${uri.fsPath}`;
            const stats = this.profiler.getStats(operationId);
            if (stats) {
                stats.metadata = {
                    issues: result.issues.length,
                    ...result.metrics
                };
            }

            // Update bottleneck tracking
            this.bottleneckDetector.analyzeOperation(`file-${uri.fsPath}`, {
                stats: this.profiler.getStats(operationId),
                issues: result.issues.length,
                metrics: result.metrics
            });

            this.eventEmitter.emit('fileMetricsUpdated', { uri, metrics: result.metrics });
        } catch (error) {
            this.logger.error(`Failed to update metrics for ${uri.fsPath}:`, error);
        }
    }

    public getProfiler(): PerformanceProfiler {
        return this.profiler;
    }

    public getBottleneckDetector(): BottleneckDetector {
        return this.bottleneckDetector;
    }

    public getCachingService(): CachingService {
        return this.cachingService;
    }

    public getAsyncOptimizer(): AsyncOptimizer {
        return this.asyncOptimizer;
    }

    public on(event: string, listener: (...args: unknown[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    public off(event: string, listener: (...args: unknown[]) => void): void {
        this.eventEmitter.off(event, listener);
    }

    public dispose(): void {
        this.statusService.dispose();
        this.diagnosticsService.dispose();
        this.fileMonitorService.dispose();
        this.cachingService.dispose();
        this.asyncOptimizer.dispose();
        this.eventEmitter.removeAllListeners();
    }
}
