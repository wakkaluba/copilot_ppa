import * as vscode from 'vscode';
export interface SecurityIssue {
    file: string;
    line: number;
    column: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}
export declare class SecurityScanner {
    private _context;
    private _diagnosticCollection;
    constructor(context: vscode.ExtensionContext);
    /**
     * Scans workspace dependencies for known vulnerabilities
     */
    scanDependencies(): Promise<SecurityIssue[]>;
    /**
     * Scans current file for potential security issues in code
     */
    scanFileForIssues(document: vscode.TextDocument): Promise<SecurityIssue[]>;
    /**
     * Provides proactive security recommendations
     */
    getSecurityRecommendations(document: vscode.TextDocument): string[];
    private checkJavaScriptSecurity;
    private checkPythonSecurity;
    private checkJavaSecurity;
    private findPatternInDocument;
    private updateDiagnostics;
    private mapSeverity;
    private mapSeverityToDiagnosticSeverity;
}
