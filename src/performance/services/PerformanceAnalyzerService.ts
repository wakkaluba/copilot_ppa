import * as vscode from 'vscode';
import { PerformanceAnalysisResult, WorkspacePerformanceResult } from '../types';
import { AnalyzerFactory } from '../analyzers/analyzerFactory';
import { PerformanceConfigService } from '../services/PerformanceConfigService';

export class PerformanceAnalyzerService {
    private readonly analyzerFactory: AnalyzerFactory;

    constructor(private readonly configService: PerformanceConfigService) {
        this.analyzerFactory = AnalyzerFactory.getInstance();
    }

    public async analyzeFile(document: vscode.TextDocument): Promise<PerformanceAnalysisResult | null> {
        try {
            const analyzer = this.analyzerFactory.getAnalyzer(document.fileName, this.configService.getAnalyzerOptions());
            return analyzer.analyze(document.getText(), document.fileName);
        } catch (error) {
            console.error(`Analysis failed for ${document.fileName}:`, error);
            return null;
        }
    }

    public async analyzeWorkspace(
        files: vscode.Uri[],
        progress: vscode.Progress<{ message?: string; increment?: number }>,
        token: vscode.CancellationToken
    ): Promise<WorkspacePerformanceResult> {
        const results: PerformanceAnalysisResult[] = [];
        const increment = 100 / files.length;

        for (let i = 0; i < files.length && !token.isCancellationRequested; i++) {
            const file = files[i];
            if (!file) {continue;}
            
            try {
                const document = await vscode.workspace.openTextDocument(file.fsPath);
                const result = await this.analyzeFile(document);
                if (result) {
                    results.push(result);
                }
            } catch (error) {
                console.error(`Failed to analyze ${file.fsPath}:`, error);
            }

            progress.report({
                increment,
                message: `Analyzed ${i + 1} of ${files.length} files`
            });
        }

        return {
            fileResults: results,
            summary: this.generateSummary(results)
        };
    }

    private generateSummary(results: PerformanceAnalysisResult[]): WorkspacePerformanceResult['summary'] {
        return {
            filesAnalyzed: results.length,
            totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
            criticalIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0),
            highIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'high').length, 0),
            mediumIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'medium').length, 0),
            lowIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'low').length, 0)
        };
    }
}