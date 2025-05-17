import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { AsyncOptimizer } from './asyncOptimizer';
import { BottleneckDetector } from './bottleneckDetector';
import { CachingService } from './cachingService';
import { PerformanceProfiler } from './performanceProfiler';
import { PerformanceAnalyzerService } from './services/PerformanceAnalyzerService';
import { PerformanceConfigService } from './services/performanceConfigService';
import { PerformanceDiagnosticsService } from './services/performanceDiagnosticsService';
import { PerformanceFileMonitorService } from './services/performanceFileMonitorService';
import { PerformanceStatusService } from './services/performanceStatusService';
import { Logger } from './utils/logger';

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
  private readonly logger: Logger;
  private analysisCache: Map<string, PerformanceAnalysisResult> = new Map();
  private disposed = false;

  private constructor(
    extensionContext: vscode.ExtensionContext,
    analyzerService?: PerformanceAnalyzerService,
  ) {
    this.eventEmitter = new EventEmitter();
    this.configService = new PerformanceConfigService();
    this.analyzerService = analyzerService ?? new PerformanceAnalyzerService(extensionContext);
    this.statusService = new PerformanceStatusService();
    this.diagnosticsService = new PerformanceDiagnosticsService();
    this.fileMonitorService = new PerformanceFileMonitorService();
    this.profiler = PerformanceProfiler.getInstance(extensionContext);
    this.bottleneckDetector = BottleneckDetector.getInstance();
    this.cachingService = CachingService.getInstance();
    this.asyncOptimizer = AsyncOptimizer.getInstance();
    this.logger = Logger.getInstance();
    this.setupEventListeners();
    this.initializeServices().catch((error) => {
      this.logger.error('Failed to initialize performance services:', error);
      vscode.window.showErrorMessage('Failed to initialize performance services');
    });
  }

  public static getInstance(
    context?: vscode.ExtensionContext,
    analyzerService?: PerformanceAnalyzerService,
  ): PerformanceManager {
    if (!PerformanceManager.instance) {
      if (!context) {
        throw new Error('Context required for PerformanceManager initialization');
      }
      PerformanceManager.instance = new PerformanceManager(context, analyzerService);
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
      vscode.window.showErrorMessage('Failed to initialize performance services');
      throw error;
    }
  }

  public async analyzeFile(document: vscode.TextDocument): Promise<PerformanceAnalysisResult> {
    const fileKey = document.uri.toString();
    if (this.analysisCache.has(fileKey)) {
      return this.analysisCache.get(fileKey)!;
    }
    const operationId = `file-analysis-${document.uri.fsPath}`;
    this.profiler.startOperation(operationId);
    try {
      const result = await this.analyzerService.analyzeDocument(document);
      const normalizedResult: PerformanceAnalysisResult = {
        ...result,
        skipped: !!result.skipped,
      };
      if (normalizedResult) {
        try {
          this.statusService.updateStatusBar(normalizedResult);
          this.diagnosticsService.updateDiagnostics(document, normalizedResult);
          this.bottleneckDetector.analyzeOperation(operationId, { result: normalizedResult });
          this.eventEmitter.emit('fileAnalysisComplete', normalizedResult);
          await this.updateFileMetrics(document.uri, normalizedResult);
          this.analysisCache.set(fileKey, normalizedResult);
        } catch (error) {
          this.logger.error(`File analysis failed for ${document.uri.fsPath}:`, error);
          const message = error instanceof Error ? error.message : 'Unknown error';
          vscode.window.showErrorMessage(`File analysis failed: ${message}`);
          this.eventEmitter.emit('fileAnalysisComplete', {
            filePath: '',
            issues: [],
            skipped: true,
          });
          return { filePath: '', issues: [], skipped: true };
        }
      }
      return normalizedResult;
    } catch (error) {
      this.logger.error(`File analysis failed for ${document.uri.fsPath}:`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`File analysis failed: ${message}`);
      this.eventEmitter.emit('fileAnalysisComplete', { filePath: '', issues: [], skipped: true });
      return { filePath: '', issues: [], skipped: true };
    } finally {
      this.profiler.endOperation(operationId);
    }
  }

  public async analyzeCurrentFile(): Promise<PerformanceAnalysisResult | null> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }
    return this.analyzeFile(editor.document);
  }

  public generatePerformanceReport(): void {
    const operationStats = this.profiler.getStats('all');
    const bottleneckAnalysis = this.bottleneckDetector.analyzeAll();
    const cacheStats = this.cachingService.getCacheStats();
    const asyncStats = this.asyncOptimizer.getStats();
    this.logger.info('Performance Report:');
    this.logger.info(`Operations analyzed: ${operationStats?.length || 0}`);
    this.logger.info(`Critical bottlenecks detected: ${bottleneckAnalysis.critical.length}`);
    this.logger.info(`Performance warnings detected: ${bottleneckAnalysis.warnings.length}`);
    this.logger.info(
      `Cache hits: ${cacheStats.hits}, misses: ${cacheStats.misses}, evictions: ${cacheStats.evictions}`,
    );
    this.logger.info(`Async operations optimized: ${asyncStats.optimizedCount}`);
    this.eventEmitter.emit('performanceReport', {
      operationStats,
      bottleneckAnalysis,
      cacheStats,
      asyncStats,
    });
  }

  private setupEventListeners(): void {
    this.fileMonitorService.onDocumentSaved((document: vscode.TextDocument) =>
      this.handleDocumentChange(document),
    );
    this.fileMonitorService.onActiveEditorChanged((editor?: vscode.TextEditor) => {
      if (editor) {
        this.analyzeFile(editor.document).catch((error) => {
          this.logger.error('Failed to analyze active editor:', error);
        });
      }
    });
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('copilot-ppa.performance')) {
        this.initializeServices().catch((error) => {
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

  private async updateFileMetrics(
    uri: vscode.Uri,
    result: PerformanceAnalysisResult,
  ): Promise<void> {
    try {
      const operationId = `file-analysis-${uri.fsPath}`;
      const stats = this.profiler.getStats(operationId);
      if (stats) {
        stats.metadata = {
          issues: result.issues.length,
          ...result.metrics,
        };
      }
      this.bottleneckDetector.analyzeOperation(`file-${uri.fsPath}`, {
        stats: this.profiler.getStats(operationId),
        issues: result.issues.length,
        metrics: result.metrics,
      });
      this.eventEmitter.emit('fileMetricsUpdated', { uri, metrics: result.metrics });
    } catch (error) {
      this.logger.error(`Failed to update metrics for ${uri.fsPath}:`, error);
      this.eventEmitter.emit('fileMetricsUpdated', { uri, metrics: undefined, error });
    }
  }

  public clearCaches(): void {
    this.analysisCache.clear();
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
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.statusService.dispose();
    this.diagnosticsService.dispose();
    this.fileMonitorService.dispose();
    this.cachingService.dispose();
    this.asyncOptimizer.dispose();
    this.eventEmitter.removeAllListeners();
  }
}

type PerformanceAnalysisResult = {
  filePath: string;
  issues: any[];
  skipped: boolean;
  metrics?: Record<string, number>;
};
