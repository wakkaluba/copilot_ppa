import * as vscode from 'vscode';
import { PerformanceAnalysisResult } from '../types';

export class PerformanceDiagnosticsService implements vscode.Disposable {
    private readonly diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('performance');
    }

    public updateDiagnostics(document: vscode.TextDocument, result: PerformanceAnalysisResult): void {
        const diagnostics: vscode.Diagnostic[] = result.issues.map(issue => {
            const range = new vscode.Range(
                issue.line - 1,
                0,
                issue.line - 1,
                document.lineAt(issue.line - 1).text.length
            );

            const diagnostic = new vscode.Diagnostic(
                range,
                `${issue.description}\n${issue.solution || ''}`,
                this.getSeverity(issue.severity)
            );

            diagnostic.source = 'Performance';
            diagnostic.code = issue.title;
            if (issue.solutionCode) {
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(
                        new vscode.Location(document.uri, range),
                        `Suggestion: ${issue.solutionCode}`
                    )
                ];
            }

            return diagnostic;
        });

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private getSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'critical':
                return vscode.DiagnosticSeverity.Error;
            case 'high':
                return vscode.DiagnosticSeverity.Warning;
            case 'medium':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Hint;
        }
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
    }
}