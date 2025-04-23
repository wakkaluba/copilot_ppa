import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../logging/ILogger';
import { PerformanceMetricsService } from './services/PerformanceMetricsService';
import { PerformanceIssueService } from './services/PerformanceIssueService';
import { PerformanceReportService } from './services/PerformanceReportService';
import { PerformanceProgressService } from './services/PerformanceProgressService';
import { PerformanceConfig, PerformanceIssue, PerformanceReport } from './types';
import { EventEmitter } from 'events';

@injectable()
export class PerformanceAnalyzer extends EventEmitter {
    private static instance: PerformanceAnalyzer;
    private config: PerformanceConfig;
    
    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(PerformanceMetricsService) private readonly metricsService: PerformanceMetricsService,
        @inject(PerformanceIssueService) private readonly issueService: PerformanceIssueService,
        @inject(PerformanceReportService) private readonly reportService: PerformanceReportService,
        @inject(PerformanceProgressService) private readonly progressService: PerformanceProgressService
    ) {
        super();
        this.setupEventListeners();
        this.loadConfiguration();
    }

    public static getInstance(
        logger: ILogger,
        metricsService: PerformanceMetricsService,
        issueService: PerformanceIssueService,
        reportService: PerformanceReportService,
        progressService: PerformanceProgressService
    ): PerformanceAnalyzer {
        if (!PerformanceAnalyzer.instance) {
            PerformanceAnalyzer.instance = new PerformanceAnalyzer(
                logger,
                metricsService,
                issueService,
                reportService,
                progressService
            );
        }
        return PerformanceAnalyzer.instance;
    }

    private setupEventListeners(): void {
        this.metricsService.on('error', this.handleError.bind(this));
        this.issueService.on('error', this.handleError.bind(this));
        this.reportService.on('error', this.handleError.bind(this));
    }

    private loadConfiguration(): void {
        try {
            const config = vscode.workspace.getConfiguration('copilot-ppa.performance');
            this.config = {
                enableDeepAnalysis: config.get<boolean>('enableDeepAnalysis', false),
                analysisTimeout: config.get<number>('analysisTimeout', 30000),
                maxIssues: config.get<number>('maxIssues', 100),
                severityThreshold: config.get<string>('severityThreshold', 'medium'),
                excludePatterns: config.get<string[]>('excludePatterns', [])
            };
        } catch (error) {
            this.handleError(new Error(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    public async analyzeCurrentFile(): Promise<PerformanceIssue[]> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('No active editor found');
        }

        return this.analyzeFile(editor.document.uri);
    }

    public async analyzeFile(fileUri: vscode.Uri): Promise<PerformanceIssue[]> {
        try {
            return await this.progressService.withProgress(
                `Analyzing performance for ${fileUri.fsPath}`,
                async (progress) => {
                    const document = await vscode.workspace.openTextDocument(fileUri);
                    const metrics = await this.metricsService.analyzeFile(document, progress);
                    const issues = await this.issueService.detectIssues(document, metrics);
                    
                    if (issues.length > 0) {
                        await this.reportService.generateReport(fileUri, issues, metrics);
                    }

                    this.emit('analysisComplete', { fileUri, issues, metrics });
                    return issues;
                }
            );
        } catch (error) {
            this.handleError(new Error(`Error analyzing file ${fileUri.fsPath}: ${error instanceof Error ? error.message : String(error)}`));
            return [];
        }
    }

    public async analyzeWorkspace(): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            throw new Error('No workspace folder open');
        }

        try {
            await this.progressService.withProgress(
                'Analyzing workspace performance',
                async (progress) => {
                    const files = await vscode.workspace.findFiles(
                        '**/*.{js,ts,jsx,tsx}',
                        `{${this.config.excludePatterns.join(',')}}`
                    );

                    let processedFiles = 0;
                    const totalFiles = files.length;
                    const allIssues: PerformanceIssue[] = [];

                    for (const file of files) {
                        progress.report({
                            message: `Analyzed ${processedFiles} of ${totalFiles} files`,
                            increment: (100 / totalFiles)
                        });

                        const issues = await this.analyzeFile(file);
                        allIssues.push(...issues);
                        processedFiles++;
                    }

                    const report = await this.reportService.generateWorkspaceReport(allIssues);
                    this.emit('workspaceAnalysisComplete', report);
                }
            );
        } catch (error) {
            this.handleError(new Error(`Error analyzing workspace: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    private handleError(error: Error): void {
        this.logger.error('[PerformanceAnalyzer]', error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.metricsService.dispose();
        this.issueService.dispose();
        this.reportService.dispose();
        this.removeAllListeners();
    }
}
