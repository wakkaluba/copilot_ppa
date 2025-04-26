import * as vscode from 'vscode';

export enum SecuritySeverity {
    Critical = 'critical',
    High = 'high',
    Medium = 'medium',
    Low = 'low',
    Info = 'info'
}

export interface SecurityIssue {
    id: string;
    name: string;
    description: string;
    severity: SecuritySeverity;
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;
    hasFix: boolean;
    recommendation: string;
    category: SecurityCategory;
    cwe?: string;
}

export enum SecurityCategory {
    Injection = 'injection',
    XSS = 'xss',
    PathTraversal = 'pathTraversal',
    Authentication = 'authentication',
    Authorization = 'authorization',
    Encryption = 'encryption',
    Configuration = 'configuration',
    Validation = 'validation',
    Other = 'other'
}

export interface SecurityAnalysisResult {
    issues: SecurityIssue[];
    timestamp: Date;
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
        total: number;
    };
    fixableCount: number;
}

export interface SecurityScanOptions {
    includeDependencies?: boolean;
    includeNodeModules?: boolean;
    severity?: SecuritySeverity;
    fastScan?: boolean;
    categories?: SecurityCategory[];
}

export interface SecurityReportOptions {
    includeRecommendations?: boolean;
    includeFix?: boolean;
    format?: 'json' | 'html' | 'markdown';
    outputPath?: string;
}

export interface SecurityViewOptions {
    showInEditor?: boolean;
    groupBySeverity?: boolean;
    groupByCategory?: boolean;
    sortByLocation?: boolean;
}

export interface SecurityProvider {
    id: string;
    name: string;
    description: string;
    scanFiles(options: SecurityScanOptions): Promise<SecurityAnalysisResult>;
    generateReport(result: SecurityAnalysisResult, options: SecurityReportOptions): Promise<string>;
    applyFix?(issue: SecurityIssue): Promise<boolean>;
}

export interface SecurityCodeActionProvider {
    provideFixes(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[];
    registerCodeActionProvider(): vscode.Disposable;
}

export interface SecurityDiagnosticProvider {
    provideDiagnostics(document: vscode.TextDocument): vscode.Diagnostic[];
    registerDiagnosticCollection(): vscode.DiagnosticCollection;
}

export interface SecurityHoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined;
    registerHoverProvider(): vscode.Disposable;
}