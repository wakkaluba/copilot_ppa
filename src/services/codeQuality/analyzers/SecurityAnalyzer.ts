import * as vscode from 'vscode';
import { SecurityPatternService } from '../../../security/services/SecurityPatternService';
import { SecurityCategory, SecurityIssue, SecuritySeverity } from '../../../security/types';
import { AnalysisResult } from '../types';
import { ICodeAnalyzer } from './ICodeAnalyzer';

export class SecurityAnalyzer implements ICodeAnalyzer {
    private readonly patternService: SecurityPatternService;

    constructor() {
        this.patternService = new SecurityPatternService();
    }

    public async analyzeDocument(document: vscode.TextDocument): Promise<AnalysisResult> {
        const issues: SecurityIssue[] = [];
        const text = document.getText();
        const fileType = document.languageId;

        switch (fileType) {
            case 'javascript':
            case 'typescript':
                await this.scanJavaScriptContent(text, document, issues);
                break;
            case 'python':
                await this.scanPythonContent(text, document, issues);
                break;
            case 'java':
                await this.scanJavaContent(text, document, issues);
                break;
        }

        return {
            issues,
            diagnostics: this.createDiagnostics(issues)
        };
    }

    private async scanJavaScriptContent(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): Promise<void> {
        const patterns = this.patternService.getJavaScriptPatterns();
        this.findPatternMatches(text, document, patterns, issues);
    }

    private async scanPythonContent(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): Promise<void> {
        const patterns = this.patternService.getPythonPatterns();
        this.findPatternMatches(text, document, patterns, issues);
    }

    private async scanJavaContent(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): Promise<void> {
        const patterns = this.patternService.getJavaPatterns();
        this.findPatternMatches(text, document, patterns, issues);
    }

    private findPatternMatches(text: string, document: vscode.TextDocument, patterns: { id: string; regex: RegExp; severity: string; description: string; recommendation: string; }[], issues: SecurityIssue[]): void {
        for (const pattern of patterns) {
            const regex = pattern.regex;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: pattern.id,
                    name: `Security Issue ${pattern.id}`,
                    description: pattern.description,
                    severity: pattern.severity as SecuritySeverity,
                    filePath: document.uri.fsPath,
                    lineNumber: position.line,
                    columnNumber: position.character,
                    hasFix: false,
                    recommendation: pattern.recommendation,
                    category: SecurityCategory.Other
                });
            }
        }
    }

    private createDiagnostics(issues: SecurityIssue[]): vscode.Diagnostic[] {
        return issues.map(issue => {
            const range = new vscode.Range(
                issue.lineNumber || 0,
                issue.columnNumber || 0,
                issue.lineNumber || 0,
                (issue.columnNumber || 0) + 1
            );

            const diagnostic = new vscode.Diagnostic(
                range,
                `${issue.description}\n${issue.recommendation}`,
                this.mapSeverityToDiagnosticSeverity(issue.severity)
            );

            diagnostic.code = issue.id;
            diagnostic.source = 'security';
            return diagnostic;
        });
    }

    private mapSeverityToDiagnosticSeverity(severity: SecuritySeverity): vscode.DiagnosticSeverity {
        switch (severity) {
            case SecuritySeverity.Critical:
            case SecuritySeverity.High:
                return vscode.DiagnosticSeverity.Error;
            case SecuritySeverity.Medium:
                return vscode.DiagnosticSeverity.Warning;
            case SecuritySeverity.Low:
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Hint;
        }
    }

    public dispose(): void {
        // Nothing to dispose
    }
}
