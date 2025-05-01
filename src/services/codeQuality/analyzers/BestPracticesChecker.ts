import * as vscode from 'vscode';
import { SecurityCategory, SecurityIssue, SecuritySeverity } from '../../../security/types';
import { Logger } from '../../../utils/logger';
import { AnalysisResult } from '../types';
import { ICodeAnalyzer } from './ICodeAnalyzer';

export class BestPracticesChecker implements ICodeAnalyzer {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public async analyzeDocument(document: vscode.TextDocument): Promise<AnalysisResult> {
        const issues: SecurityIssue[] = [];
        const text = document.getText();

        this.checkMethodLength(text, document, issues);
        this.checkComplexity(text, document, issues);
        this.checkNaming(text, document, issues);
        this.checkComments(text, document, issues);

        return {
            issues,
            diagnostics: this.createDiagnostics(issues)
        };
    }

    private checkMethodLength(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        const methodRegex = /(?:function\s+\w+|(?:public|private|protected)?\s*\w+\s*\(.*\))\s*{[^}]*}/gs;
        let match;

        while ((match = methodRegex.exec(text)) !== null) {
            const methodLines = match[0].split('\n').length;
            if (methodLines > 30) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: 'BP001',
                    name: 'Long Method',
                    description: `Method is ${methodLines} lines long`,
                    severity: SecuritySeverity.Medium,
                    filePath: document.uri.fsPath,
                    lineNumber: position.line,
                    columnNumber: position.character,
                    hasFix: false,
                    recommendation: 'Consider breaking down methods longer than 30 lines',
                    category: SecurityCategory.Other
                });
            }
        }
    }

    private checkComplexity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        const complexityIndicators = [
            /if\s*\(/g,
            /else\s*{/g,
            /for\s*\(/g,
            /while\s*\(/g,
            /switch\s*\(/g,
            /\?\s*[^:]+\s*:/g // Ternary operators
        ];

        let totalComplexity = 0;
        complexityIndicators.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                totalComplexity += matches.length;
            }
        });

        if (totalComplexity > 10) {
            issues.push({
                id: 'BP002',
                name: 'High Cyclomatic Complexity',
                description: `File has high cyclomatic complexity (${totalComplexity})`,
                severity: SecuritySeverity.Medium,
                filePath: document.uri.fsPath,
                lineNumber: 0,
                columnNumber: 0,
                hasFix: false,
                recommendation: 'Consider breaking down complex logic into smaller functions',
                category: SecurityCategory.Other
            });
        }
    }

    private checkNaming(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        // Check for non-descriptive variable names
        const shortNameRegex = /(?:let|const|var)\s+([a-z]{1,2})\s*=/g;
        let match;

        while ((match = shortNameRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            issues.push({
                id: 'BP003',
                name: 'Non-descriptive Variable Name',
                description: `Variable name "${match[1]}" is too short`,
                severity: SecuritySeverity.Low,
                filePath: document.uri.fsPath,
                lineNumber: position.line,
                columnNumber: position.character,
                hasFix: false,
                recommendation: 'Use descriptive variable names that indicate their purpose',
                category: SecurityCategory.Other
            });
        }
    }

    private checkComments(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        // Check for functions without JSDoc comments
        const functionWithoutJSDocRegex = /(?<!\/\*\*[\s\S]*?\*\/\s*)(?:export\s+)?(?:function|class|interface)\s+\w+/g;
        let match;

        while ((match = functionWithoutJSDocRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            issues.push({
                id: 'BP004',
                name: 'Missing Documentation',
                description: 'Function or class is missing JSDoc documentation',
                severity: SecuritySeverity.Low,
                filePath: document.uri.fsPath,
                lineNumber: position.line,
                columnNumber: position.character,
                hasFix: false,
                recommendation: 'Add JSDoc comments to improve code maintainability',
                category: SecurityCategory.Other
            });
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
            diagnostic.source = 'best-practices';
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
