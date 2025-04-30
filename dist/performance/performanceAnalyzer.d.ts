import * as vscode from 'vscode';
/**
 * @deprecated Use PerformanceManager from './performanceManager' instead.
 */
export declare class PerformanceAnalyzer {
    private manager;
    constructor(context: vscode.ExtensionContext);
    analyzeActiveFile(): Promise<PerformanceAnalysisResult>;
    analyzeWorkspace(): Promise<WorkspacePerformanceResult>;
    showFileAnalysisReport(result: PerformanceAnalysisResult): void;
    showWorkspaceAnalysisReport(result: WorkspacePerformanceResult): void;
}
/**
 * Interface for a performance issue found in code
 */
export interface PerformanceIssue {
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    line: number;
    code: string;
    solution?: string;
    solutionCode?: string;
}
/**
 * Interface for the result of a performance analysis
 */
export interface PerformanceAnalysisResult {
    filePath: string;
    fileHash: string;
    issues: PerformanceIssue[];
    metrics: {
        [key: string]: number;
    };
}
/**
 * Interface for the result of a workspace-wide performance analysis
 */
export interface WorkspacePerformanceResult {
    fileResults: PerformanceAnalysisResult[];
    summary: {
        filesAnalyzed: number;
        totalIssues: number;
        criticalIssues: number;
        highIssues: number;
        mediumIssues: number;
        lowIssues: number;
    };
}
