import * as vscode from 'vscode';
import { SecurityScanResult, DependencyScanResult, SecurityIssue, RecommendationResult } from '../types';
/**
 * Service for generating and displaying security reports
 */
export declare class SecurityReportService implements vscode.Disposable {
    private readonly context;
    private readonly reportProvider;
    private lastReport;
    constructor(context: vscode.ExtensionContext);
    /**
     * Show a report of code security issues
     */
    showCodeIssues(result: SecurityScanResult): Promise<void>;
    /**
     * Show a dependency vulnerability report
     */
    showDependencyReport(result: DependencyScanResult): Promise<void>;
    /**
     * Show a filtered list of security issues
     */
    showFilteredIssues(issues: SecurityIssue[], issueId: string): Promise<void>;
    /**
     * Show a complete security analysis report
     */
    showFullReport(codeResult: SecurityScanResult, dependencyResult: DependencyScanResult, recommendationsResult: RecommendationResult): Promise<void>;
    /**
     * Create a new webview panel for displaying reports
     */
    private createReportPanel;
    /**
     * Show a security issue in the editor
     */
    private showIssueInEditor;
    /**
     * Export the current report
     */
    private exportReport;
    dispose(): void;
}
