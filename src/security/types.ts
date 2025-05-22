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
  issues: ISecurityIssue[];
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

export interface ISecurityScanOptions {
  includeDependencies?: boolean;
  includeNodeModules?: boolean;
  severity?: SecuritySeverity;
  fastScan?: boolean;
  categories?: SecurityCategory[];
}

export interface ISecurityReportOptions {
  includeRecommendations?: boolean;
  includeFix?: boolean;
  format?: 'json' | 'html' | 'markdown';
  outputPath?: string;
}

export interface ISecurityViewOptions {
  showInEditor?: boolean;
  groupBySeverity?: boolean;
  groupByCategory?: boolean;
  sortByLocation?: boolean;
}

export interface ISecurityProvider {
  id: string;
  name: string;
  description: string;
  scanFiles(options: ISecurityScanOptions): Promise<ISecurityAnalysisResult>;
  generateReport(result: ISecurityAnalysisResult, options: ISecurityReportOptions): Promise<string>;
  applyFix?(issue: ISecurityIssue): Promise<boolean>;
}

export interface ISecurityCodeActionProvider {
  provideFixes(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[];
}
