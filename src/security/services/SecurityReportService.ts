import * as vscode from 'vscode';
import { SecurityAnalysisResult, SecurityScanResult, DependencyScanResult, RecommendationsResult } from '../types';

/**
 * Service responsible for displaying security analysis reports and results
 */
export class SecurityReportService implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];
    private currentPanel: vscode.WebviewPanel | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async showCodeIssues(result: SecurityScanResult): Promise<void> {
        this.createOrShowPanel('Security Issues', 'security-issues');
        await this.updatePanelContent(this.getCodeIssuesContent(result));
    }

    public async showDependencyReport(result: DependencyScanResult): Promise<void> {
        this.createOrShowPanel('Dependency Report', 'dependency-report');
        await this.updatePanelContent(this.getDependencyReportContent(result));
    }

    public async showRecommendations(result: RecommendationsResult): Promise<void> {
        this.createOrShowPanel('Security Recommendations', 'security-recommendations');
        await this.updatePanelContent(this.getRecommendationsContent(result));
    }

    public async showFilteredIssues(result: SecurityScanResult, issueType: string): Promise<void> {
        this.createOrShowPanel(`Security Issues - ${issueType}`, 'filtered-issues');
        await this.updatePanelContent(this.getFilteredIssuesContent(result, issueType));
    }

    public async showFullReport(
        codeResult: SecurityScanResult,
        depResult: DependencyScanResult,
        recResult: RecommendationsResult
    ): Promise<void> {
        this.createOrShowPanel('Security Analysis Report', 'full-report');
        await this.updatePanelContent(this.getFullReportContent(codeResult, depResult, recResult));
    }

    private createOrShowPanel(title: string, viewType: string): void {
        if (this.currentPanel) {
            this.currentPanel.reveal();
            this.currentPanel.title = title;
        } else {
            this.currentPanel = vscode.window.createWebviewPanel(
                viewType,
                title,
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            this.currentPanel.onDidDispose(
                () => {
                    this.currentPanel = undefined;
                },
                null,
                this.disposables
            );
        }
    }

    private async updatePanelContent(content: string): Promise<void> {
        if (this.currentPanel) {
            this.currentPanel.webview.html = content;
        }
    }

    private getCodeIssuesContent(result: SecurityScanResult): string {
        return this.getHtmlTemplate('Code Security Issues', this.formatCodeIssues(result));
    }

    private getDependencyReportContent(result: DependencyScanResult): string {
        return this.getHtmlTemplate('Dependency Vulnerabilities', this.formatDependencyReport(result));
    }

    private getRecommendationsContent(result: RecommendationsResult): string {
        return this.getHtmlTemplate('Security Recommendations', this.formatRecommendations(result));
    }

    private getFilteredIssuesContent(result: SecurityScanResult, issueType: string): string {
        return this.getHtmlTemplate(
            `Security Issues - ${issueType}`,
            this.formatFilteredIssues(result, issueType)
        );
    }

    private getFullReportContent(
        codeResult: SecurityScanResult,
        depResult: DependencyScanResult,
        recResult: RecommendationsResult
    ): string {
        const sections = [
            { title: 'Code Security Issues', content: this.formatCodeIssues(codeResult) },
            { title: 'Dependency Vulnerabilities', content: this.formatDependencyReport(depResult) },
            { title: 'Security Recommendations', content: this.formatRecommendations(recResult) }
        ];

        return this.getHtmlTemplate('Full Security Report', this.formatSections(sections));
    }

    private formatCodeIssues(result: SecurityScanResult): string {
        // Format code issues into HTML
        return `<div class="issues-section">
            <h3>Found ${result.issues.length} issues in ${result.scannedFiles} files</h3>
            ${result.issues.map(issue => `
                <div class="issue ${issue.severity}">
                    <h4>${issue.name}</h4>
                    <p>${issue.description}</p>
                    <p>Location: ${issue.filePath}:${issue.line || 'N/A'}</p>
                    ${issue.codeSnippet ? `<pre><code>${issue.codeSnippet}</code></pre>` : ''}
                    ${issue.recommendation ? `<p>Recommendation: ${issue.recommendation}</p>` : ''}
                </div>
            `).join('')}
        </div>`;
    }

    private formatDependencyReport(result: DependencyScanResult): string {
        // Format dependency vulnerabilities into HTML
        return `<div class="dependency-section">
            <h3>Scanned ${result.totalDependencies} dependencies</h3>
            ${result.vulnerabilities.map(vuln => `
                <div class="vulnerability ${vuln.severity}">
                    <h4>${vuln.name}</h4>
                    <p>${vuln.description}</p>
                    <p>Affected versions: ${vuln.affectedVersions}</p>
                    <p>Fix version: ${vuln.fixedVersion || 'Not available'}</p>
                </div>
            `).join('')}
        </div>`;
    }

    private formatRecommendations(result: RecommendationsResult): string {
        // Format recommendations into HTML
        return `<div class="recommendations-section">
            <h3>Security Recommendations</h3>
            ${result.recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    ${rec.implementation ? `<p>Implementation: ${rec.implementation}</p>` : ''}
                </div>
            `).join('')}
        </div>`;
    }

    private formatFilteredIssues(result: SecurityScanResult, issueType: string): string {
        const filteredIssues = result.issues.filter(issue => issue.id === issueType);
        return this.formatCodeIssues({ ...result, issues: filteredIssues });
    }

    private formatSections(sections: { title: string; content: string }[]): string {
        return sections.map(section => `
            <section class="report-section">
                <h2>${section.title}</h2>
                ${section.content}
            </section>
        `).join('<hr>');
    }

    private getHtmlTemplate(title: string, content: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <style>
                    body { font-family: var(--vscode-font-family); }
                    .issue, .vulnerability, .recommendation {
                        margin: 1em 0;
                        padding: 1em;
                        border-radius: 4px;
                    }
                    .critical { background-color: var(--vscode-errorForeground); }
                    .high { background-color: var(--vscode-editorError-foreground); }
                    .medium { background-color: var(--vscode-editorWarning-foreground); }
                    .low { background-color: var(--vscode-editorInfo-foreground); }
                    pre code {
                        display: block;
                        padding: 1em;
                        background: var(--vscode-editor-background);
                    }
                    hr { margin: 2em 0; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                ${content}
            </body>
            </html>
        `;
    }

    public dispose(): void {
        if (this.currentPanel) {
            this.currentPanel.dispose();
        }
        this.disposables.forEach(d => d.dispose());
    }
}