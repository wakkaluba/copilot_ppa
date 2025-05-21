import * as vscode from 'vscode';

export enum SecuritySeverity {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  Info = 'info',
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
export type SecurityIssue = SecurityIssue;

export enum SecurityCategory {
  Injection = 'injection',
  XSS = 'xss',
  PathTraversal = 'pathTraversal',
  Authentication = 'authentication',
  Authorization = 'authorization',
  Encryption = 'encryption',
  Configuration = 'configuration',
  Validation = 'validation',
  Other = 'other',
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
export type SecurityAnalysisResult = SecurityAnalysisResult;

export interface SecurityScanOptions {
  includeDependencies?: boolean;
  includeNodeModules?: boolean;
  severity?: SecuritySeverity;
  fastScan?: boolean;
  categories?: SecurityCategory[];
}
export type SecurityScanOptions = SecurityScanOptions;

export interface SecurityReportOptions {
  includeRecommendations?: boolean;
  includeFix?: boolean;
  format?: 'json' | 'html' | 'markdown';
  outputPath?: string;
}
export type SecurityReportOptions = SecurityReportOptions;

export interface SecurityViewOptions {
  showInEditor?: boolean;
  groupBySeverity?: boolean;
  groupByCategory?: boolean;
  sortByLocation?: boolean;
}
export type SecurityViewOptions = SecurityViewOptions;

export interface SecurityProvider {
  id: string;
  name: string;
  description: string;
  scanFiles(options: SecurityScanOptions): Promise<SecurityAnalysisResult>;
  generateReport(result: SecurityAnalysisResult, options: SecurityReportOptions): Promise<string>;
  applyFix?(issue: SecurityIssue): Promise<boolean>;
}
export type SecurityProvider = SecurityProvider;

export interface SecurityCodeActionProvider {
  provideFixes(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[];
  registerCodeActionProvider(): vscode.Disposable;
}
export type SecurityCodeActionProvider = SecurityCodeActionProvider;

export interface SecurityDiagnosticProvider {
  provideDiagnostics(document: vscode.TextDocument): vscode.Diagnostic[];
  registerDiagnosticCollection(): vscode.DiagnosticCollection;
}
export type SecurityDiagnosticProvider = SecurityDiagnosticProvider;

export interface SecurityHoverProvider {
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined;
  registerHoverProvider(): vscode.Disposable;
}
export type SecurityHoverProvider = SecurityHoverProvider;

export interface SecurityPattern {
  id: string;
  regex: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}
export type SecurityPattern = SecurityPattern;

export interface CodeScanResult {
  issues: SecurityIssue[];
  scannedFiles: number;
}
export type CodeScanResult = CodeScanResult;
