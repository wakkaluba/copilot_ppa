import * as vscode from 'vscode';
import { ISecurityAnalysisService, SecurityScanResult, SecurityIssue } from '../types';
import { CodeSecurityScanner } from '../scanners/CodeSecurityScanner';
import { EventEmitter } from 'events';

export interface ISecurityAnalysisService extends vscode.Disposable {
    scanWorkspace(): Promise<SecurityScanResult>;
    scanFile(document: vscode.TextDocument): Promise<SecurityIssue[]>;
    getIssuesByType(issueId: string): Promise<SecurityIssue[]>;
}

/**
 * Service responsible for coordinating security analysis operations
 */
export class SecurityAnalysisService implements ISecurityAnalysisService {
    private readonly scanner: CodeSecurityScanner;
    private readonly disposables: vscode.Disposable[] = [];
    private readonly _onAnalysisComplete = new EventEmitter<SecurityScanResult>();
    private analysisTimeout: NodeJS.Timeout | undefined;
    private diagnosticCollection: vscode.DiagnosticCollection;
    private issueCache = new Map<string, SecurityIssue[]>();

    constructor(scanner: CodeSecurityScanner) {
        this.scanner = scanner;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('security');
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(() => this.onDocumentChanged())
        );
    }

    public readonly onAnalysisComplete = this._onAnalysisComplete.event;

    public async scanWorkspace(
        progressCallback?: (message: string) => void
    ): Promise<SecurityScanResult> {
        progressCallback?.("Analyzing workspace files...");
        const result = await this.scanner.scanWorkspace(progressCallback);
        this._onAnalysisComplete.emit(result);
        return result;
    }

    public async scanActiveFile(): Promise<SecurityScanResult> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { issues: [], scannedFiles: 0, timestamp: Date.now() };
        }
        const result = await this.scanner.scanFile(editor.document.uri);
        this._onAnalysisComplete.emit(result);
        return result;
    }

    public async getIssuesByType(issueId: string): Promise<SecurityIssue[]> {
        const result = await this.scanWorkspace();
        return result.issues.filter(issue => issue.id === issueId);
    }

    private async onDocumentChanged(): Promise<void> {
        if (this.analysisTimeout) {
            clearTimeout(this.analysisTimeout);
        }
        this.analysisTimeout = setTimeout(async () => {
            await this.scanActiveFile();
        }, 1000);
    }

    public async scanFile(document: vscode.TextDocument): Promise<SecurityIssue[]> {
        const issues: SecurityIssue[] = [];
        const text = document.getText();

        // Scan based on file type
        switch (document.languageId) {
            case 'javascript':
            case 'typescript':
                this.checkJavaScriptSecurity(text, document, issues);
                break;
            case 'python':
                this.checkPythonSecurity(text, document, issues);
                break;
            case 'java':
                this.checkJavaSecurity(text, document, issues);
                break;
        }

        // Update diagnostics
        this.updateDiagnostics(document, issues);
        this.issueCache.set(document.uri.toString(), issues);

        return issues;
    }

    private updateDiagnostics(document: vscode.TextDocument, issues: SecurityIssue[]): void {
        const diagnostics = issues.map(issue => new vscode.Diagnostic(
            new vscode.Range(
                new vscode.Position(issue.location.line, issue.location.column),
                new vscode.Position(issue.location.line, issue.location.column + 1)
            ),
            issue.description,
            vscode.DiagnosticSeverity.Warning
        ));
        
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private checkJavaScriptSecurity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        // Add JavaScript/TypeScript specific security checks
        this.checkForEvalUse(text, document, issues);
        this.checkForDangerousNodeModules(text, document, issues);
        this.checkForXSSVulnerabilities(text, document, issues);
    }

    private checkPythonSecurity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        // Add Python specific security checks
        this.checkForUnsafeDeserialization(text, document, issues);
        this.checkForShellInjection(text, document, issues);
        this.checkForSQLInjection(text, document, issues);
    }

    private checkJavaSecurity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        // Add Java specific security checks
        this.checkForUnsafeReflection(text, document, issues);
        this.checkForUnsafeDeserialization(text, document, issues);
        this.checkForSQLInjection(text, document, issues);
    }

    private checkForEvalUse(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        const evalRegex = /eval\s*\(/g;
        let match;
        while ((match = evalRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            issues.push({
                id: 'SEC001',
                name: 'Unsafe eval() usage',
                description: 'Using eval() can be dangerous as it executes arbitrary JavaScript code',
                severity: 'high',
                location: {
                    file: document.uri.fsPath,
                    line: position.line,
                    column: position.character
                },
                recommendation: 'Avoid using eval(). Consider safer alternatives like JSON.parse() for JSON data.'
            });
        }
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
        this.disposables.forEach(d => d.dispose());
        if (this.analysisTimeout) {
            clearTimeout(this.analysisTimeout);
        }
        this._onAnalysisComplete.removeAllListeners();
    }
}