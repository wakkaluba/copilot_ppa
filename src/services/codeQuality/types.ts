import * as vscode from 'vscode';
import { SecurityIssue } from '../../security/types';

export interface QualityIssue {
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'suggestion';
  type: string;
}

export interface CodeMetrics {
  complexity: number;
  maintainability: number;
  performance: number;
}

export interface QualitySnapshot {
  timestamp: Date;
  issues: QualityIssue[];
  metrics: CodeMetrics;
  score: number;
}

export interface CodeQualityConfig {
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

export interface AnalysisResult {
  issues: SecurityIssue[];
  diagnostics: vscode.Diagnostic[];
}

export interface AnalysisMetrics {
  complexity: number;
  maintainability: number;
  security: number;
  performance: number;
  timestamp: number;
}

export interface AnalysisHistory {
  metrics: AnalysisMetrics[];
  maxEntries: number;
}
