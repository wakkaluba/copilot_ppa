import * as vscode from 'vscode';

export enum SecuritySeverity {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  Info = 'info',
}

export interface ISecurityIssue {
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
export type SecurityIssue = ISecurityIssue;

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

export interface ISecurityAnalysisResult {
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
export type SecurityAnalysisResult = ISecurityAnalysisResult;

export interface ISecurityScanOptions {
  includeDependencies?: boolean;
  includeNodeModules?: boolean;
  severity?: SecuritySeverity;
  fastScan?: boolean;
  categories?: SecurityCategory[];
}
export type SecurityScanOptions = ISecurityScanOptions;

export interface ISecurityReportOptions {
  includeRecommendations?: boolean;
  includeFix?: boolean;
  format?: 'json' | 'html' | 'markdown';
  outputPath?: string;
}
export type SecurityReportOptions = ISecurityReportOptions;

export interface ISecurityViewOptions {
  showInEditor?: boolean;
  groupBySeverity?: boolean;
  groupByCategory?: boolean;
  sortByLocation?: boolean;
}
export type SecurityViewOptions = ISecurityViewOptions;

export interface ISecurityProvider {
  id: string;
  name: string;
  description: string;
  scanFiles(options: SecurityScanOptions): Promise<SecurityAnalysisResult>;
  generateReport(result: SecurityAnalysisResult, options: SecurityReportOptions): Promise<string>;
  applyFix?(issue: SecurityIssue): Promise<boolean>;
}
export type SecurityProvider = ISecurityProvider;

export interface ISecurityCodeActionProvider {
  provideFixes(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[];
  registerCodeActionProvider(): vscode.Disposable;
}
export type SecurityCodeActionProvider = ISecurityCodeActionProvider;

export interface ISecurityDiagnosticProvider {
  provideDiagnostics(document: vscode.TextDocument): vscode.Diagnostic[];
  registerDiagnosticCollection(): vscode.DiagnosticCollection;
}
export type SecurityDiagnosticProvider = ISecurityDiagnosticProvider;

export interface ISecurityHoverProvider {
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined;
  registerHoverProvider(): vscode.Disposable;
}
export type SecurityHoverProvider = ISecurityHoverProvider;

export interface ISecurityPattern {
  id: string;
  regex: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}
export type SecurityPattern = ISecurityPattern;

export interface ICodeScanResult {
  issues: SecurityIssue[];
  scannedFiles: number;
}
export type CodeScanResult = ICodeScanResult;
