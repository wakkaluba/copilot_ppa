import * as vscode from 'vscode';
import { WorkspacePerformanceResult, PerformanceAnalysisResult } from './types';
import { PerformanceAnalyzerService } from '../performance/services/PerformanceAnalyzerService';
import { PerformanceStatusService } from '../performance/services/PerformanceStatusService';
import { PerformanceDiagnosticsService } from '../performance/services/PerformanceDiagnosticsService';
import { PerformanceFileMonitorService } from '../performance/services/PerformanceFileMonitorService';
import { PerformanceConfigService } from '../performance/services/PerformanceConfigService';
import { PerformanceProfiler } from './performanceProfiler';
import { BottleneckDetector } from './bottleneckDetector';
import { EventEmitter } from 'events';

export class PerformanceManager implements vscode.Disposable {
    private static instance: PerformanceManager;
    private readonly analyzerService: PerformanceAnalyzerService;
    private readonly statusService: PerformanceStatusService;
    private readonly diagnosticsService: PerformanceDiagnosticsService;
    private readonly fileMonitorService: PerformanceFileMonitorService;
    private readonly configService: PerformanceConfigService;
    private readonly profiler: PerformanceProfiler;
    private readonly bottleneckDetector: BottleneckDetector;
    private readonly eventEmitter: EventEmitter;

    private constructor(extensionContext: vscode.ExtensionContext) {
        this.eventEmitter = new EventEmitter();
        this.configService = new PerformanceConfigService();
        this.analyzerService = new PerformanceAnalyzerService(this.configService);
        this.statusService = new PerformanceStatusService();
        this.diagnosticsService = new PerformanceDiagnosticsService();
        this.fileMonitorService = new PerformanceFileMonitorService();
        this.profiler = PerformanceProfiler.getInstance(extensionContext);
        this.bottleneckDetector = BottleneckDetector.getInstance();
        
        this.setupEventListeners();
        this.initializeServices();
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
        } catch (error) {
            console.error('Failed to initialize performance services:', error);
        }
    }

    public dispose(): void {
        this.statusService.dispose();
        this.diagnosticsService.dispose();
        this.fileMonitorService.dispose();
        this.eventEmitter.removeAllListeners();
    }

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
                this.eventEmitter.emit('workspaceAnalysisComplete', result);
                return result;
            });
        } catch (error) {
            console.error('Workspace analysis failed:', error);
            throw error;
        } finally {
            this.profiler.endOperation(operationId);
        }
    }

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
            }
            return result;
        } catch (error) {
            console.error(`File analysis failed for ${document.uri.fsPath}:`, error);
            return null;
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

        console.info('Performance Report:');
        console.info(`Operations analyzed: ${operationStats?.length || 0}`);
        console.info(`Critical bottlenecks detected: ${bottleneckAnalysis.critical.length}`);
        console.info(`Performance warnings detected: ${bottleneckAnalysis.warnings.length}`);

        this.eventEmitter.emit('performanceReport', { operationStats, bottleneckAnalysis });
    }

    private setupEventListeners(): void {
        this.fileMonitorService.onDocumentSaved((document: vscode.TextDocument) => this.handleDocumentChange(document));
        this.fileMonitorService.onActiveEditorChanged((editor: vscode.TextEditor | undefined) => {
            if (editor) {
                this.analyzeFile(editor.document);
            }
        });

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('performance')) {
                this.initializeServices();
            }
        });
    }

    private handleDocumentChange(document: vscode.TextDocument): void {
        this.fileMonitorService.throttleDocumentChange(document, async () => {
            const result = await this.analyzeFile(document);
            if (result) {
                this.statusService.updateStatusBar(result);
                this.diagnosticsService.updateDiagnostics(document, result);
            }
        });
    }

    public getProfiler(): PerformanceProfiler {
        return this.profiler;
    }

    public getBottleneckDetector(): BottleneckDetector {
        return this.bottleneckDetector;
    }

    public on(event: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    public off(event: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.off(event, listener);
    }
}
