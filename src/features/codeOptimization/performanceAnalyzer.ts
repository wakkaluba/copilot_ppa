import * as vscode from 'vscode';
import { PerformanceAnalysisService } from '../../services/performance/PerformanceAnalysisService';
import { LLMService } from '../../services/llm/llmService';
import { PerformanceIssue } from '../../types/performance';
import { PerformanceDiagnosticsService } from './services/PerformanceDiagnosticsService';
import { PerformanceProgressService } from './services/PerformanceProgressService';
import { PerformanceResultsService } from './services/PerformanceResultsService';

export class PerformanceAnalyzer {
    private readonly analysisService: PerformanceAnalysisService;
    private readonly diagnosticsService: PerformanceDiagnosticsService;
    private readonly progressService: PerformanceProgressService;
    private readonly resultsService: PerformanceResultsService;
    
    constructor(context: vscode.ExtensionContext, llmService: LLMService) {
        this.analysisService = new PerformanceAnalysisService(llmService);
        this.diagnosticsService = new PerformanceDiagnosticsService();
        this.progressService = new PerformanceProgressService();
        this.resultsService = new PerformanceResultsService();
        
        this.registerCommands(context);
    }

    private registerCommands(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.analyzePerformance',
                this.analyzeCurrentFile.bind(this)
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.analyzeWorkspacePerformance',
                this.analyzeWorkspace.bind(this)
            ),
            this.diagnosticsService.getDiagnosticCollection()
        );
    }

    public async analyzeCurrentFile(): Promise<PerformanceIssue[]> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return [];
        }
        
        return this.analyzeFile(editor.document.uri);
    }

    public async analyzeFile(fileUri: vscode.Uri): Promise<PerformanceIssue[]> {
        const document = await vscode.workspace.openTextDocument(fileUri);
        this.diagnosticsService.clearDiagnostics(fileUri);

        try {
            return await this.progressService.withProgress(
                `Analyzing performance for ${document.fileName}`,
                async (progress, token) => {
                    const results = await this.analysisService.analyzeFile(document, progress, token);
                    if (results.length > 0) {
                        this.diagnosticsService.addDiagnostics(fileUri, results, document);
                        this.resultsService.displayResults(results);
                    }
                    return results;
                }
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing file: ${error}`);
            return [];
        }
    }

    public async analyzeWorkspace(): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }

        await this.progressService.withProgress(
            'Analyzing workspace performance',
            async (progress, token) => {
                await this.analysisService.analyzeWorkspace(progress, token);
            }
        );
    }
}
