import { ISecurityIssue } from '../../security/types';

export interface IQualityIssue {
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'suggestion';
  type: string;
}

export interface ICodeMetrics {
  complexity: number;
  maintainability: number;
  performance: number;
}

export interface IQualitySnapshot {
  timestamp: Date;
  issues: IQualityIssue[];
  metrics: ICodeMetrics;
  score: number;
}

export interface ICodeQualityConfig {
  severityLevels: {
    [type: string]: 'error' | 'warning' | 'info' | 'suggestion';
  };
  ignorePatterns: string[];
  excludeTypes: string[];
  enableSecurity: boolean;
  enablePerformance: boolean;
  enableMaintainability: boolean;
  maxHistoryEntries: number;
  severityThresholds: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface IAnalysisResult {
  issues: ISecurityIssue[];
  diagnostics: import('vscode').Diagnostic[];
}

export interface IAnalysisMetrics {
  complexity: number;
  maintainability: number;
  security: number;
  performance: number;
  timestamp: number;
}

export interface IAnalysisHistory {
  metrics: IAnalysisMetrics[];
  maxEntries: number;
}

export interface ICodeAnalysis {
  filePath: string;
  issues: IQualityIssue[];
  metrics: ICodeMetrics;
}

export interface IOptimizationResult {
  filePath: string;
  optimized: boolean;
  freedMemory?: number;
  details?: string;
  issues?: IQualityIssue[];
}

export interface ISuggestion {
  file: string;
  line: number;
  suggestion: string;
  reason?: string;
  type?: string;
}

export interface IBestPracticeIssue extends IQualityIssue {
  // Optionally extend with more fields if needed
}

export type { BestPracticeIssue } from './BestPracticesService';
