import * as vscode from 'vscode';
import { SecurityAnalysisResult, SecurityScanResult, DependencyScanResult, SecurityIssue } from '../types';
/**
 * Provider for generating HTML content for security reports
 */
export declare class SecurityReportHtmlProvider implements vscode.Disposable {
    private readonly context;
    constructor(context: vscode.ExtensionContext);
    /**
     * Update code security issues report
     */
    updateCodeReport(panel: vscode.WebviewPanel, result: SecurityScanResult): Promise<void>;
    /**
     * Update dependency vulnerabilities report
     */
    updateDependencyReport(panel: vscode.WebviewPanel, result: DependencyScanResult): Promise<void>;
    /**
     * Update filtered issues report
     */
    updateFilteredReport(panel: vscode.WebviewPanel, issues: SecurityIssue[]): Promise<void>;
    /**
     * Update full security analysis report
     */
    updateFullReport(panel: vscode.WebviewPanel, result: SecurityAnalysisResult): Promise<void>;
    /**
     * Export report in different formats
     */
    exportReport(type: string, format: 'html' | 'pdf' | 'markdown'): Promise<string>;
    /**
     * Generate HTML for code security report
     */
    private generateCodeReportHtml;
    /**
     * Generate HTML for dependency vulnerability report
     */
    private generateDependencyReportHtml;
    /**
     * Generate HTML for filtered issues report
     */
    private generateFilteredReportHtml;
    /**
     * Generate HTML for full security analysis report
     */
    private generateFullReportHtml;
    /**
     * Generate HTML table for security issues
     */
    private generateIssuesTable;
    /**
     * Generate HTML table for vulnerabilities
     */
    private generateVulnerabilitiesTable;
    /**
     * Generate HTML table for recommendations
     */
    private generateRecommendationsTable;
    /**
     * Get CSS styles for reports
     */
    private getReportStyles;
    /**
     * Get JavaScript for reports
     */
    private getReportScripts;
    /**
     * Get severity badge HTML
     */
    private getSeverityBadge;
    /**
     * Get risk score CSS class
     */
    private getRiskClass;
    /**
     * Get highest severity from vulnerability info
     */
    private getHighestSeverity;
    /**
     * Escape HTML special characters
     */
    private escapeHtml;
    dispose(): void;
}
