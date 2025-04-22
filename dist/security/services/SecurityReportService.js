"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityReportService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Service responsible for displaying security analysis reports and results
 */
class SecurityReportService {
    context;
    disposables = [];
    currentPanel;
    constructor(context) {
        this.context = context;
    }
    async showCodeIssues(result) {
        this.createOrShowPanel('Security Issues', 'security-issues');
        await this.updatePanelContent(this.getCodeIssuesContent(result));
    }
    async showDependencyReport(result) {
        this.createOrShowPanel('Dependency Report', 'dependency-report');
        await this.updatePanelContent(this.getDependencyReportContent(result));
    }
    async showRecommendations(result) {
        this.createOrShowPanel('Security Recommendations', 'security-recommendations');
        await this.updatePanelContent(this.getRecommendationsContent(result));
    }
    async showFilteredIssues(result, issueType) {
        this.createOrShowPanel(`Security Issues - ${issueType}`, 'filtered-issues');
        await this.updatePanelContent(this.getFilteredIssuesContent(result, issueType));
    }
    async showFullReport(codeResult, depResult, recResult) {
        this.createOrShowPanel('Security Analysis Report', 'full-report');
        await this.updatePanelContent(this.getFullReportContent(codeResult, depResult, recResult));
    }
    createOrShowPanel(title, viewType) {
        if (this.currentPanel) {
            this.currentPanel.reveal();
            this.currentPanel.title = title;
        }
        else {
            this.currentPanel = vscode.window.createWebviewPanel(viewType, title, vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true
            });
            this.currentPanel.onDidDispose(() => {
                this.currentPanel = undefined;
            }, null, this.disposables);
        }
    }
    async updatePanelContent(content) {
        if (this.currentPanel) {
            this.currentPanel.webview.html = content;
        }
    }
    getCodeIssuesContent(result) {
        return this.getHtmlTemplate('Code Security Issues', this.formatCodeIssues(result));
    }
    getDependencyReportContent(result) {
        return this.getHtmlTemplate('Dependency Vulnerabilities', this.formatDependencyReport(result));
    }
    getRecommendationsContent(result) {
        return this.getHtmlTemplate('Security Recommendations', this.formatRecommendations(result));
    }
    getFilteredIssuesContent(result, issueType) {
        return this.getHtmlTemplate(`Security Issues - ${issueType}`, this.formatFilteredIssues(result, issueType));
    }
    getFullReportContent(codeResult, depResult, recResult) {
        const sections = [
            { title: 'Code Security Issues', content: this.formatCodeIssues(codeResult) },
            { title: 'Dependency Vulnerabilities', content: this.formatDependencyReport(depResult) },
            { title: 'Security Recommendations', content: this.formatRecommendations(recResult) }
        ];
        return this.getHtmlTemplate('Full Security Report', this.formatSections(sections));
    }
    formatCodeIssues(result) {
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
    formatDependencyReport(result) {
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
    formatRecommendations(result) {
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
    formatFilteredIssues(result, issueType) {
        const filteredIssues = result.issues.filter(issue => issue.id === issueType);
        return this.formatCodeIssues({ ...result, issues: filteredIssues });
    }
    formatSections(sections) {
        return sections.map(section => `
            <section class="report-section">
                <h2>${section.title}</h2>
                ${section.content}
            </section>
        `).join('<hr>');
    }
    getHtmlTemplate(title, content) {
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
    dispose() {
        if (this.currentPanel) {
            this.currentPanel.dispose();
        }
        this.disposables.forEach(d => d.dispose());
    }
}
exports.SecurityReportService = SecurityReportService;
//# sourceMappingURL=SecurityReportService.js.map