import * as vscode from 'vscode';
import { SecurityAnalysisResult, SecurityScanResult, DependencyScanResult, SecurityIssue } from '../types';

/**
 * Provider for generating HTML content for security reports
 */
export class SecurityReportHtmlProvider implements vscode.Disposable {
    constructor(private readonly context: vscode.ExtensionContext) {}

    /**
     * Update code security issues report
     */
    public async updateCodeReport(panel: vscode.WebviewPanel, result: SecurityScanResult): Promise<void> {
        panel.webview.html = this.generateCodeReportHtml(result);
    }

    /**
     * Update dependency vulnerabilities report
     */
    public async updateDependencyReport(panel: vscode.WebviewPanel, result: DependencyScanResult): Promise<void> {
        panel.webview.html = this.generateDependencyReportHtml(result);
    }

    /**
     * Update filtered issues report
     */
    public async updateFilteredReport(panel: vscode.WebviewPanel, issues: SecurityIssue[]): Promise<void> {
        panel.webview.html = this.generateFilteredReportHtml(issues);
    }

    /**
     * Update full security analysis report
     */
    public async updateFullReport(panel: vscode.WebviewPanel, result: SecurityAnalysisResult): Promise<void> {
        panel.webview.html = this.generateFullReportHtml(result);
    }

    /**
     * Export report in different formats
     */
    public async exportReport(type: string, format: 'html' | 'pdf' | 'markdown'): Promise<string> {
        // Implementation will vary based on format
        return '';
    }

    /**
     * Generate HTML for code security report
     */
    private generateCodeReportHtml(result: SecurityScanResult): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Code Security Issues</title>
                <style>
                    ${this.getReportStyles()}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Code Security Issues</h1>
                    <div class="summary">
                        <p>Scanned ${result.scannedFiles} files</p>
                        <p>Found ${result.issues.length} security issues</p>
                    </div>
                    ${this.generateIssuesTable(result.issues)}
                </div>
                <script>
                    ${this.getReportScripts()}
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Generate HTML for dependency vulnerability report
     */
    private generateDependencyReportHtml(result: DependencyScanResult): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dependency Vulnerabilities</title>
                <style>
                    ${this.getReportStyles()}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Dependency Vulnerabilities</h1>
                    <div class="summary">
                        <p>Scanned ${result.totalDependencies} dependencies</p>
                        <p>Found ${result.vulnerabilities.length} vulnerabilities</p>
                    </div>
                    ${this.generateVulnerabilitiesTable(result.vulnerabilities)}
                </div>
                <script>
                    ${this.getReportScripts()}
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Generate HTML for filtered issues report
     */
    private generateFilteredReportHtml(issues: SecurityIssue[]): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Security Issues</title>
                <style>
                    ${this.getReportStyles()}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Security Issues</h1>
                    <div class="summary">
                        <p>Found ${issues.length} matching issues</p>
                    </div>
                    ${this.generateIssuesTable(issues)}
                </div>
                <script>
                    ${this.getReportScripts()}
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Generate HTML for full security analysis report
     */
    private generateFullReportHtml(result: SecurityAnalysisResult): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Security Analysis Report</title>
                <style>
                    ${this.getReportStyles()}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Security Analysis Report</h1>
                    
                    <section class="overview">
                        <h2>Overview</h2>
                        <div class="risk-score">
                            <h3>Overall Risk Score</h3>
                            <div class="score ${this.getRiskClass(result.overallRiskScore)}">
                                ${result.overallRiskScore}
                            </div>
                        </div>
                    </section>

                    <section class="code-issues">
                        <h2>Code Security Issues</h2>
                        ${this.generateIssuesTable(result.codeResult.issues)}
                    </section>

                    <section class="vulnerabilities">
                        <h2>Dependency Vulnerabilities</h2>
                        ${this.generateVulnerabilitiesTable(result.dependencyResult.vulnerabilities)}
                    </section>

                    <section class="recommendations">
                        <h2>Security Recommendations</h2>
                        ${this.generateRecommendationsTable(result.recommendationsResult.recommendations)}
                    </section>
                </div>
                <script>
                    ${this.getReportScripts()}
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Generate HTML table for security issues
     */
    private generateIssuesTable(issues: SecurityIssue[]): string {
        if (issues.length === 0) {
            return '<p class="no-issues">No security issues found</p>';
        }

        return `
            <table class="issues-table">
                <thead>
                    <tr>
                        <th>Severity</th>
                        <th>Issue</th>
                        <th>Location</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${issues.map(issue => `
                        <tr class="severity-${issue.severity}">
                            <td>${this.getSeverityBadge(issue.severity)}</td>
                            <td>${issue.name}</td>
                            <td>
                                <a href="#" onclick="showIssue('${this.escapeHtml(JSON.stringify(issue))}')">
                                    ${issue.file}:${issue.line}
                                </a>
                            </td>
                            <td>
                                <div class="description">${issue.description}</div>
                                ${issue.recommendation ? `
                                    <div class="recommendation">
                                        Recommendation: ${issue.recommendation}
                                    </div>
                                ` : ''}
                            </td>
                            <td>
                                ${issue.hasFix ? `
                                    <button onclick="applyFix('${this.escapeHtml(JSON.stringify(issue))}')">
                                        Fix Issue
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Generate HTML table for vulnerabilities
     */
    private generateVulnerabilitiesTable(vulnerabilities: any[]): string {
        if (vulnerabilities.length === 0) {
            return '<p class="no-issues">No vulnerabilities found</p>';
        }

        return `
            <table class="vulnerabilities-table">
                <thead>
                    <tr>
                        <th>Package</th>
                        <th>Severity</th>
                        <th>Version</th>
                        <th>Details</th>
                        <th>Fix</th>
                    </tr>
                </thead>
                <tbody>
                    ${vulnerabilities.map(vuln => `
                        <tr>
                            <td>${vuln.name}</td>
                            <td>${this.getSeverityBadge(this.getHighestSeverity(vuln))}</td>
                            <td>${vuln.version}</td>
                            <td>
                                ${vuln.vulnerabilityInfo.map((info: any) => `
                                    <div class="vuln-info">
                                        <strong>${info.title}</strong>
                                        <p>${info.description}</p>
                                    </div>
                                `).join('')}
                            </td>
                            <td>
                                ${vuln.fixAvailable ? `
                                    Update to ${vuln.fixedVersion}
                                ` : 'No fix available'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Generate HTML table for recommendations
     */
    private generateRecommendationsTable(recommendations: any[]): string {
        if (recommendations.length === 0) {
            return '<p class="no-recommendations">No recommendations available</p>';
        }

        return `
            <table class="recommendations-table">
                <thead>
                    <tr>
                        <th>Priority</th>
                        <th>Recommendation</th>
                        <th>Impact</th>
                        <th>Effort</th>
                    </tr>
                </thead>
                <tbody>
                    ${recommendations.map(rec => `
                        <tr class="severity-${rec.severity}">
                            <td>${this.getSeverityBadge(rec.severity)}</td>
                            <td>
                                <div class="title">${rec.title}</div>
                                <div class="description">${rec.description}</div>
                            </td>
                            <td>${rec.impact}</td>
                            <td>${rec.effort}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Get CSS styles for reports
     */
    private getReportStyles(): string {
        return `
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                color: var(--vscode-editor-foreground);
                background-color: var(--vscode-editor-background);
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
            }

            h1, h2 {
                color: var(--vscode-editor-foreground);
                border-bottom: 1px solid var(--vscode-panel-border);
                padding-bottom: 10px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }

            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid var(--vscode-panel-border);
            }

            th {
                background-color: var(--vscode-editor-lineHighlightBackground);
            }

            .severity-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: bold;
            }

            .severity-critical { background-color: #ff0000; color: white; }
            .severity-high { background-color: #ff4444; color: white; }
            .severity-medium { background-color: #ffaa00; color: black; }
            .severity-low { background-color: #ffff00; color: black; }

            .description {
                margin-bottom: 8px;
            }

            .recommendation {
                font-style: italic;
                color: var(--vscode-textLink-foreground);
            }

            button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
            }

            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }

            .risk-score {
                text-align: center;
                margin: 20px 0;
            }

            .score {
                font-size: 48px;
                font-weight: bold;
                width: 100px;
                height: 100px;
                line-height: 100px;
                border-radius: 50%;
                margin: 0 auto;
            }
        `;
    }

    /**
     * Get JavaScript for reports
     */
    private getReportScripts(): string {
        return `
            const vscode = acquireVsCodeApi();

            function showIssue(issueJson) {
                const issue = JSON.parse(issueJson);
                vscode.postMessage({
                    command: 'showIssue',
                    issue: issue
                });
            }

            function applyFix(issueJson) {
                const issue = JSON.parse(issueJson);
                vscode.postMessage({
                    command: 'applyFix',
                    issue: issue
                });
            }

            function exportReport(format) {
                vscode.postMessage({
                    command: 'exportReport',
                    format: format
                });
            }
        `;
    }

    /**
     * Get severity badge HTML
     */
    private getSeverityBadge(severity: string): string {
        return `<span class="severity-badge severity-${severity}">${severity.toUpperCase()}</span>`;
    }

    /**
     * Get risk score CSS class
     */
    private getRiskClass(score: number): string {
        if (score >= 75) return 'severity-critical';
        if (score >= 50) return 'severity-high';
        if (score >= 25) return 'severity-medium';
        return 'severity-low';
    }

    /**
     * Get highest severity from vulnerability info
     */
    private getHighestSeverity(vulnerability: any): string {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return vulnerability.vulnerabilityInfo.reduce((highest: string, info: any) => {
            return severityOrder[info.severity as keyof typeof severityOrder] >
                   severityOrder[highest as keyof typeof severityOrder]
                   ? info.severity : highest;
        }, 'low');
    }

    /**
     * Escape HTML special characters
     */
    private escapeHtml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    public dispose(): void {
        // No cleanup needed
    }
}