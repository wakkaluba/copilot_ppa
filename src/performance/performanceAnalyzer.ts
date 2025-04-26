import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PerformanceManager } from './performanceManager';

/**
 * @deprecated Use PerformanceManager from './performanceManager' instead.
 */
export class PerformanceAnalyzer {
    private manager: PerformanceManager;
    constructor(context: vscode.ExtensionContext) {
        this.manager = new PerformanceManager(context);
    }
    
    public analyzeActiveFile(): Promise<PerformanceAnalysisResult> {
        return this.manager.analyzeCurrentFile();
    }
    
    public analyzeWorkspace(): Promise<WorkspacePerformanceResult> {
        return this.manager.analyzeWorkspace();
    }
    
    public showFileAnalysisReport(result: PerformanceAnalysisResult): void {
        this.manager.showFileAnalysisReport(result);
    }
    
    public showWorkspaceAnalysisReport(result: WorkspacePerformanceResult): void {
        this.manager.showWorkspaceAnalysisReport(result);
    }
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
    metrics: { [key: string]: number };
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
