import * as vscode from 'vscode';
import { SecurityPatternService } from './SecurityPatternService';
import { SecurityIssue, CodeScanResult } from '../types';

export class SecurityAnalyzerService {
    constructor(private readonly patternService: SecurityPatternService) {}

    public async scanDocument(document: vscode.TextDocument): Promise<{ diagnostics: vscode.Diagnostic[], issues: SecurityIssue[] }> {
        const patterns = this.patternService.getPatterns();
        const issues: SecurityIssue[] = [];
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const languageId = document.languageId;

        for (const pattern of patterns) {
            if (!pattern.languages.includes(languageId)) {continue;}
            
            const regex = pattern.pattern;
            regex.lastIndex = 0;
            let match;

            while ((match = regex.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(
                    range,
                    `${pattern.name}: ${pattern.description}`,
                    pattern.severity
                );
                diagnostic.code = pattern.id;
                diagnostic.source = 'VSCode Local LLM Agent - Security Scanner';
                diagnostics.push(diagnostic);

                issues.push({
                    id: pattern.id,
                    name: pattern.name,
                    description: pattern.description,
                    file: document.uri.fsPath,
                    line: startPos.line + 1,
                    column: startPos.character + 1,
                    code: match[0],
                    severity: this.severityToString(pattern.severity),
                    fix: pattern.fix
                });
            }
        }

        return { diagnostics, issues };
    }

    public async scanWorkspace(progressCallback?: (message: string) => void): Promise<CodeScanResult> {
        const issues: SecurityIssue[] = [];
        let scannedFiles = 0;

        try {
            const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,cs,go,php}', '**/node_modules/**');

            for (const file of files) {
                if (progressCallback) {
                    progressCallback(`Scanning ${vscode.workspace.asRelativePath(file)}`);
                }

                const document = await vscode.workspace.openTextDocument(file);
                const result = await this.scanDocument(document);
                issues.push(...result.issues);
                scannedFiles++;
            }
        } catch (error) {
            console.error('Error scanning workspace:', error);
        }

        return { issues, scannedFiles };
    }

    private severityToString(severity: vscode.DiagnosticSeverity): string {
        switch (severity) {
            case vscode.DiagnosticSeverity.Error:
                return 'Error';
            case vscode.DiagnosticSeverity.Warning:
                return 'Warning';
            case vscode.DiagnosticSeverity.Information:
                return 'Information';
            case vscode.DiagnosticSeverity.Hint:
                return 'Hint';
            default:
                return 'Unknown';
        }
    }
}