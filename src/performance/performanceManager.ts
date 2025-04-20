import * as vscode from 'vscode';
import { BasePerformanceAnalyzer } from './analyzers/baseAnalyzer';
import { JavaScriptAnalyzer } from './analyzers/javascriptAnalyzer';
import {
    PerformanceAnalysisResult,
    WorkspacePerformanceResult,
    AnalyzerOptions,
    LanguageMetricThresholds
} from './types';

export class PerformanceManager implements vscode.Disposable {
    private analyzers: Map<string, BasePerformanceAnalyzer>;
    private disposables: vscode.Disposable[] = [];
    private analysisStatusBar: vscode.StatusBarItem;
    private fileChangeThrottle: Map<string, NodeJS.Timeout> = new Map();

    constructor(private readonly extensionContext: vscode.ExtensionContext) {
        this.analyzers = this.initializeAnalyzers();
        this.analysisStatusBar = this.createStatusBar();
        this.registerEventListeners();
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.analysisStatusBar.dispose();
    }

    public async analyzeWorkspace(): Promise<WorkspacePerformanceResult> {
        if (!vscode.workspace.workspaceFolders) {
            throw new Error('No workspace folders found');
        }

        const result: WorkspacePerformanceResult = {
            fileResults: [],
            summary: {
                filesAnalyzed: 0,
                totalIssues: 0,
                criticalIssues: 0,
                highIssues: 0,
                mediumIssues: 0,
                lowIssues: 0
            }
        };

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Analyzing workspace performance",
            cancellable: true
        }, async (progress, token) => {
            const files = await this.findAnalyzableFiles();
            const totalFiles = files.length;
            let processedFiles = 0;

            for (const file of files) {
                if (token.isCancellationRequested) {
                    break;
                }

                try {
                    const document = await vscode.workspace.openTextDocument(file);
                    const analysisResult = await this.analyzeFile(document);
                    if (analysisResult) {
                        result.fileResults.push(analysisResult);
                        this.updateSummary(result.summary, analysisResult);
                    }
                } catch (error) {
                    console.error(`Error analyzing file ${file.fsPath}:`, error);
                }

                processedFiles++;
                progress.report({
                    message: `Analyzed ${processedFiles} of ${totalFiles} files`,
                    increment: (100 / totalFiles)
                });
            }
        });

        return result;
    }

    public async analyzeFile(document: vscode.TextDocument): Promise<PerformanceAnalysisResult | null> {
        const analyzer = this.getAnalyzerForFile(document);
        if (!analyzer) {
            return null;
        }

        const content = document.getText();
        return (analyzer as JavaScriptAnalyzer).analyze(content, document.uri.fsPath);
    }

    public async analyzeCurrentFile(): Promise<PerformanceAnalysisResult | null> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }

        return this.analyzeFile(editor.document);
    }

    private initializeAnalyzers(): Map<string, BasePerformanceAnalyzer> {
        const analyzers = new Map<string, BasePerformanceAnalyzer>();
        const options: AnalyzerOptions = this.loadAnalyzerOptions();

        // JavaScript/TypeScript analyzer
        const jsAnalyzer = new JavaScriptAnalyzer(options);
        analyzers.set('javascript', jsAnalyzer);
        analyzers.set('typescript', jsAnalyzer);
        analyzers.set('javascriptreact', jsAnalyzer);
        analyzers.set('typescriptreact', jsAnalyzer);

        // Add other language analyzers here as they're implemented
        return analyzers;
    }

    private loadAnalyzerOptions(): AnalyzerOptions {
        const config = vscode.workspace.getConfiguration('copilot-ppa.performance');
        const thresholds: LanguageMetricThresholds = {
            javascript: {
                maxComplexity: config.get('javascript.maxComplexity', 10),
                maxLength: config.get('javascript.maxLength', 200),
                maxParameters: config.get('javascript.maxParameters', 4),
            },
            typescript: {
                maxComplexity: config.get('typescript.maxComplexity', 10),
                maxLength: config.get('typescript.maxLength', 200),
                maxParameters: config.get('typescript.maxParameters', 4),
            }
        };

        return { thresholds };
    }

    private async findAnalyzableFiles(): Promise<vscode.Uri[]> {
        const files: vscode.Uri[] = [];
        for (const folder of vscode.workspace.workspaceFolders || []) {
            const pattern = new vscode.RelativePattern(folder, '**/*.{js,ts,jsx,tsx}');
            const foundFiles = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
            files.push(...foundFiles);
        }
        return files;
    }

    private getAnalyzerForFile(document: vscode.TextDocument): BasePerformanceAnalyzer | null {
        const languageId = document.languageId;
        return this.analyzers.get(languageId) || null;
    }

    private createStatusBar(): vscode.StatusBarItem {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBar.text = "$(pulse) PPA";
        statusBar.tooltip = "Performance Analysis";
        statusBar.command = 'copilot-ppa.analyzeCurrentFile';
        statusBar.show();
        return statusBar;
    }

    private registerEventListeners(): void {
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument(this.onDocumentSaved.bind(this)),
            vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged.bind(this))
        );
    }

    private onDocumentSaved(document: vscode.TextDocument): void {
        const existingTimeout = this.fileChangeThrottle.get(document.uri.toString());
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(async () => {
            const result = await this.analyzeFile(document);
            if (result) {
                this.updateStatusBar(result);
            }
            this.fileChangeThrottle.delete(document.uri.toString());
        }, 1000);

        this.fileChangeThrottle.set(document.uri.toString(), timeout);
    }

    private onActiveEditorChanged(editor: vscode.TextEditor | undefined): void {
        if (editor) {
            this.analyzeFile(editor.document).then(result => {
                if (result) {
                    this.updateStatusBar(result);
                }
            });
        }
    }

    private updateStatusBar(result: PerformanceAnalysisResult): void {
        const totalIssues = result.issues.length;
        this.analysisStatusBar.text = `$(pulse) Issues: ${totalIssues}`;
        this.analysisStatusBar.tooltip = `Performance Issues Found: ${totalIssues}`;
    }

    private updateSummary(summary: WorkspacePerformanceResult['summary'], result: PerformanceAnalysisResult): void {
        summary.filesAnalyzed++;
        summary.totalIssues += result.issues.length;
        
        result.issues.forEach(issue => {
            switch (issue.severity) {
                case 'critical':
                    summary.criticalIssues++;
                    break;
                case 'high':
                    summary.highIssues++;
                    break;
                case 'medium':
                    summary.mediumIssues++;
                    break;
                case 'low':
                    summary.lowIssues++;
                    break;
            }
        });
    }

    private updateStatusBarVisibility(document: vscode.TextDocument): void {
        if (this.getAnalyzerForFile(document)) {
            this.analysisStatusBar.show();
        } else {
            this.analysisStatusBar.hide();
        }
    }

    private handleDocumentChange(document: vscode.TextDocument): void {
        // Clear existing throttle timeout
        const existing = this.fileChangeThrottle.get(document.uri.toString());
        if (existing) {
            clearTimeout(existing);
        }

        // Set new throttle timeout
        const timeout = setTimeout(() => {
            this.analyzeFile(document).then(result => {
                if (result) {
                    this.updateDiagnostics(document, result);
                }
            });
            this.fileChangeThrottle.delete(document.uri.toString());
        }, 1000);

        this.fileChangeThrottle.set(document.uri.toString(), timeout);
    }

    private handleDocumentSave(document: vscode.TextDocument): void {
        const analyzer = this.getAnalyzerForFile(document);
        if (!analyzer) {
            return;
        }

        this.analyzeFile(document).then(result => {
            if (result) {
                this.updateDiagnostics(document, result);
            }
        });
    }

    private updateDiagnostics(document: vscode.TextDocument, result: PerformanceAnalysisResult): void {
        const diagnostics = vscode.languages.createDiagnosticCollection('performance');
        const documentDiagnostics: vscode.Diagnostic[] = [];

        for (const issue of result.issues) {
            if (!issue.line) continue;

            const range = new vscode.Range(
                issue.line - 1,
                issue.column || 0,
                issue.line - 1,
                (issue.column || 0) + 1
            );

            const diagnostic = new vscode.Diagnostic(
                range,
                `${issue.title}: ${issue.description}`,
                this.getSeverity(issue.severity)
            );

            diagnostic.source = 'Performance Analysis';
            if (issue.code) {
                diagnostic.code = issue.code;
            }

            documentDiagnostics.push(diagnostic);
        }

        diagnostics.set(document.uri, documentDiagnostics);
    }

    private getSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'critical':
                return vscode.DiagnosticSeverity.Error;
            case 'high':
                return vscode.DiagnosticSeverity.Warning;
            case 'medium':
                return vscode.DiagnosticSeverity.Information;
            case 'low':
                return vscode.DiagnosticSeverity.Hint;
            default:
                return vscode.DiagnosticSeverity.Information;
        }
    }
}
