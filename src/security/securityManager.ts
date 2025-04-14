import * as vscode from 'vscode';
import { CodeSecurityScanner } from './codeScanner';
import { DependencyScanner } from './dependencyScanner';
import { SecurityRecommendations } from './securityRecommendations';

/**
 * Main security manager class that coordinates all security features
 */
export class SecurityManager {
    private context: vscode.ExtensionContext;
    private codeScanner: CodeSecurityScanner;
    private dependencyScanner: DependencyScanner;
    private securityRecommendations: SecurityRecommendations;
    private statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.codeScanner = new CodeSecurityScanner(context);
        this.dependencyScanner = new DependencyScanner(context);
        this.securityRecommendations = new SecurityRecommendations(context, this.codeScanner);
        
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = '$(shield) Security';
        this.statusBarItem.tooltip = 'Run security analysis';
        this.statusBarItem.command = 'vscode-local-llm-agent.security.runFullAnalysis';
        this.statusBarItem.show();
        
        this.context.subscriptions.push(this.statusBarItem);
        
        this.registerCommands();
    }

    /**
     * Register all security-related commands
     */
    private registerCommands(): void {
        // Register security scan commands
        this.context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.security.scanActiveFile', () => {
                this.scanActiveFile();
            })
        );
        
        this.context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.security.scanWorkspace', () => {
                this.scanWorkspace();
            })
        );
        
        this.context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.security.runFullAnalysis', () => {
                this.runFullSecurityAnalysis();
            })
        );
        
        this.context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.security.checkDependencies', () => {
                this.checkDependencies();
            })
        );
        
        this.context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.security.generateRecommendations', () => {
                this.generateSecurityRecommendations();
            })
        );
        
        this.context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.securityIssues.showAll', (issueId: string) => {
                this.showSecurityIssuesByType(issueId);
            })
        );
        
        this.context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.securityRecommendations.installPackage', (packageName: string, flags?: string) => {
                this.installPackage(packageName, flags);
            })
        );
    }

    /**
     * Scan the active file for security issues
     */
    private async scanActiveFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active file to scan');
            return;
        }

        try {
            const result = await this.codeScanner.scanActiveFile();
            
            if (result.issues.length > 0) {
                vscode.window.showWarningMessage(`Found ${result.issues.length} security issues in this file`, 'Show Details')
                    .then(selection => {
                        if (selection === 'Show Details') {
                            this.codeScanner.showSecurityReport(result);
                        }
                    });
            } else {
                vscode.window.showInformationMessage('No security issues found in this file');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error scanning file: ${error}`);
        }
    }

    /**
     * Scan the entire workspace for security issues
     */
    private async scanWorkspace(): Promise<void> {
        try {
            const result = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Scanning workspace for security issues",
                cancellable: true
            }, async (progress, token) => {
                return await this.codeScanner.scanWorkspace(message => {
                    progress.report({ message });
                });
            });
            
            if (result.issues.length > 0) {
                vscode.window.showWarningMessage(
                    `Found ${result.issues.length} security issues in ${result.scannedFiles} files`, 
                    'Show Details'
                ).then(selection => {
                    if (selection === 'Show Details') {
                        this.codeScanner.showSecurityReport(result);
                    }
                });
            } else {
                vscode.window.showInformationMessage(`No security issues found in ${result.scannedFiles} scanned files`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error scanning workspace: ${error}`);
        }
    }

    /**
     * Check dependencies for vulnerabilities
     */
    private async checkDependencies(): Promise<void> {
        try {
            const result = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Scanning dependencies for vulnerabilities",
                cancellable: true
            }, async () => {
                return await this.dependencyScanner.scanWorkspaceDependencies();
            });
            
            if (result.hasVulnerabilities) {
                vscode.window.showWarningMessage(
                    `Found vulnerabilities in ${result.vulnerabilities.length} of ${result.totalDependencies} dependencies`, 
                    'Show Details'
                ).then(selection => {
                    if (selection === 'Show Details') {
                        this.dependencyScanner.showVulnerabilityReport();
                    }
                });
            } else {
                vscode.window.showInformationMessage(`No vulnerabilities found in ${result.totalDependencies} dependencies`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error checking dependencies: ${error}`);
        }
    }

    /**
     * Generate and show security recommendations
     */
    private async generateSecurityRecommendations(): Promise<void> {
        try {
            const result = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating security recommendations",
                cancellable: true
            }, async () => {
                return await this.securityRecommendations.generateRecommendations();
            });
            
            if (result.recommendations.length > 0) {
                await this.securityRecommendations.showRecommendations(result);
                
                vscode.window.showInformationMessage(
                    `Generated ${result.recommendations.length} security recommendations. Critical: ${result.analysisSummary.critical}, High: ${result.analysisSummary.high}, Medium: ${result.analysisSummary.medium}, Low: ${result.analysisSummary.low}`
                );
            } else {
                vscode.window.showInformationMessage('No security recommendations generated for this project');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating security recommendations: ${error}`);
        }
    }

    /**
     * Run a full security analysis of the workspace
     */
    private async runFullSecurityAnalysis(): Promise<void> {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running full security analysis",
            cancellable: true
        }, async (progress) => {
            // Step 1: Scan workspace for code security issues
            progress.report({ message: "Scanning code for security issues...", increment: 0 });
            const codeResult = await this.codeScanner.scanWorkspace(message => {
                progress.report({ message });
            });
            
            // Step 2: Check dependencies for vulnerabilities
            progress.report({ message: "Checking dependencies for vulnerabilities...", increment: 33 });
            const dependencyResult = await this.dependencyScanner.scanWorkspaceDependencies();
            
            // Step 3: Generate security recommendations
            progress.report({ message: "Generating security recommendations...", increment: 66 });
            const recommendationsResult = await this.securityRecommendations.generateRecommendations();
            
            // Show summary
            progress.report({ message: "Finalizing analysis...", increment: 90 });
            
            // Create and show report
            this.showSecurityAnalysisReport(codeResult, dependencyResult, recommendationsResult);
            
            return {};
        });
    }

    /**
     * Show a comprehensive security analysis report
     */
    private async showSecurityAnalysisReport(
        codeResult: any, 
        dependencyResult: any, 
        recommendationsResult: any
    ): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'securityAnalysisReport',
            'Security Analysis Report',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        
        // Generate HTML for the report
        panel.webview.html = this.generateSecurityReportHtml(codeResult, dependencyResult, recommendationsResult);
        
        // Handle message from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'showCodeIssues':
                        this.codeScanner.showSecurityReport(codeResult);
                        break;
                    case 'showDependencyVulnerabilities':
                        this.dependencyScanner.showVulnerabilityReport();
                        break;
                    case 'showRecommendations':
                        this.securityRecommendations.showRecommendations(recommendationsResult);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * Generate HTML for the security report
     */
    private generateSecurityReportHtml(
        codeResult: any, 
        dependencyResult: any, 
        recommendationsResult: any
    ): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Security Analysis Report</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                    }
                    h1, h2, h3 {
                        color: var(--vscode-editor-foreground);
                    }
                    .report-section {
                        margin-bottom: 30px;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                    }
                    .section-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                    }
                    .status-indicator {
                        padding: 5px 10px;
                        border-radius: 15px;
                        font-weight: bold;
                        text-align: center;
                        min-width: 100px;
                    }
                    .status-secure {
                        background-color: var(--vscode-terminal-ansiGreen);
                        color: var(--vscode-editor-background);
                    }
                    .status-warning {
                        background-color: var(--vscode-terminal-ansiYellow);
                        color: var(--vscode-editor-background);
                    }
                    .status-critical {
                        background-color: var(--vscode-terminal-ansiRed);
                        color: var(--vscode-editor-background);
                    }
                    .summary-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .summary-table th, .summary-table td {
                        padding: 8px;
                        border: 1px solid var(--vscode-editorWidget-border);
                        text-align: left;
                    }
                    .summary-table th {
                        background-color: var(--vscode-editorWidget-background);
                    }
                    .action-button {
                        padding: 6px 12px;
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                    }
                    .action-button:hover {
                        opacity: 0.9;
                    }
                    .risk-score {
                        font-size: 24px;
                        font-weight: bold;
                        text-align: center;
                        margin: 20px 0;
                        padding: 15px;
                        border-radius: 5px;
                    }
                    .risk-low {
                        background-color: rgba(22, 198, 12, 0.1);
                        color: var(--vscode-terminal-ansiGreen);
                    }
                    .risk-medium {
                        background-color: rgba(255, 251, 0, 0.1);
                        color: var(--vscode-terminal-ansiYellow);
                    }
                    .risk-high {
                        background-color: rgba(255, 0, 0, 0.1);
                        color: var(--vscode-terminal-ansiRed);
                    }
                    .recommendations-list {
                        list-style-type: none;
                        padding: 0;
                    }
                    .recommendations-list li {
                        margin-bottom: 10px;
                        padding: 10px;
                        background-color: var(--vscode-editorWidget-background);
                        border-radius: 3px;
                    }
                    .severity-indicator {
                        display: inline-block;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        margin-right: 5px;
                    }
                    .severity-critical {
                        background-color: var(--vscode-terminal-ansiRed);
                    }
                    .severity-high {
                        background-color: var(--vscode-terminal-ansiYellow);
                    }
                    .severity-medium {
                        background-color: var(--vscode-terminal-ansiBlue);
                    }
                    .severity-low {
                        background-color: var(--vscode-terminal-ansiGreen);
                    }
                </style>
            </head>
            <body>
                <h1>Security Analysis Report</h1>
                
                <div class="risk-score risk-${this.calculateOverallRiskLevel(codeResult, dependencyResult, recommendationsResult)}">
                    Overall Security Risk: ${this.calculateOverallRiskScore(codeResult, dependencyResult, recommendationsResult)}%
                </div>
                
                <div class="report-section">
                    <div class="section-header">
                        <h2>Code Security Issues</h2>
                        <div class="status-indicator ${codeResult.issues.length > 0 ? (codeResult.issues.length > 5 ? 'status-critical' : 'status-warning') : 'status-secure'}">
                            ${codeResult.issues.length > 0 ? codeResult.issues.length + ' Issues' : 'Secure'}
                        </div>
                    </div>
                    
                    <p>Scanned ${codeResult.scannedFiles} files for security vulnerabilities.</p>
                    
                    <table class="summary-table">
                        <tr>
                            <th>Issue Type</th>
                            <th>Count</th>
                            <th>Severity</th>
                        </tr>
                        ${this.generateIssuesSummaryRows(codeResult.issues)}
                    </table>
                    
                    <button class="action-button" id="showCodeIssues">View Detailed Report</button>
                </div>
                
                <div class="report-section">
                    <div class="section-header">
                        <h2>Dependency Vulnerabilities</h2>
                        <div class="status-indicator ${dependencyResult.hasVulnerabilities ? (dependencyResult.vulnerabilities.length > 3 ? 'status-critical' : 'status-warning') : 'status-secure'}">
                            ${dependencyResult.hasVulnerabilities ? dependencyResult.vulnerabilities.length + ' Vulnerabilities' : 'Secure'}
                        </div>
                    </div>
                    
                    <p>Analyzed ${dependencyResult.totalDependencies} dependencies for known security vulnerabilities.</p>
                    
                    ${dependencyResult.hasVulnerabilities ? `
                    <table class="summary-table">
                        <tr>
                            <th>Package</th>
                            <th>Vulnerabilities</th>
                            <th>Severity</th>
                        </tr>
                        ${this.generateDependencySummaryRows(dependencyResult.vulnerabilities)}
                    </table>
                    ` : '<p>All dependencies are currently free from known vulnerabilities.</p>'}
                    
                    <button class="action-button" id="showDependencyVulnerabilities">View Detailed Report</button>
                </div>
                
                <div class="report-section">
                    <div class="section-header">
                        <h2>Security Recommendations</h2>
                        <div class="status-indicator ${recommendationsResult.recommendations.length > 0 ? (recommendationsResult.analysisSummary.critical > 0 ? 'status-critical' : 'status-warning') : 'status-secure'}">
                            ${recommendationsResult.recommendations.length} Recommendations
                        </div>
                    </div>
                    
                    <p>Generated personalized security recommendations based on your project.</p>
                    
                    <div class="recommendations-summary">
                        <strong>Critical:</strong> ${recommendationsResult.analysisSummary.critical} | 
                        <strong>High:</strong> ${recommendationsResult.analysisSummary.high} | 
                        <strong>Medium:</strong> ${recommendationsResult.analysisSummary.medium} | 
                        <strong>Low:</strong> ${recommendationsResult.analysisSummary.low}
                    </div>
                    
                    <h3>Top Recommendations:</h3>
                    <ul class="recommendations-list">
                        ${this.generateTopRecommendations(recommendationsResult.recommendations)}
                    </ul>
                    
                    <button class="action-button" id="showRecommendations">View All Recommendations</button>
                </div>
                
                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        
                        document.getElementById('showCodeIssues').addEventListener('click', () => {
                            vscode.postMessage({ command: 'showCodeIssues' });
                        });
                        
                        document.getElementById('showDependencyVulnerabilities').addEventListener('click', () => {
                            vscode.postMessage({ command: 'showDependencyVulnerabilities' });
                        });
                        
                        document.getElementById('showRecommendations').addEventListener('click', () => {
                            vscode.postMessage({ command: 'showRecommendations' });
                        });
                    })();
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Generate summary rows for code security issues
     */
    private generateIssuesSummaryRows(issues: any[]): string {
        const issueTypes: { [key: string]: { count: number, severity: string } } = {};
        
        issues.forEach(issue => {
            if (!issueTypes[issue.name]) {
                issueTypes[issue.name] = { count: 0, severity: issue.severity };
            }
            issueTypes[issue.name].count++;
        });
        
        return Object.entries(issueTypes).map(([name, data]) => {
            return `
                <tr>
                    <td>${name}</td>
                    <td>${data.count}</td>
                    <td>${data.severity}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Generate summary rows for dependency vulnerabilities
     */
    private generateDependencySummaryRows(vulnerabilities: any[]): string {
        return vulnerabilities.map(vuln => {
            // Get the highest severity from the vulnerability info
            const highestSeverity = this.getHighestSeverity(vuln.vulnerabilityInfo);
            
            return `
                <tr>
                    <td>${vuln.name}@${vuln.version}</td>
                    <td>${vuln.vulnerabilityInfo.length}</td>
                    <td>${highestSeverity}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Get the highest severity from an array of vulnerability info objects
     */
    private getHighestSeverity(vulnerabilityInfo: any[]): string {
        const severityOrder = ['critical', 'high', 'medium', 'low'];
        
        // Default to low if no info available
        if (!vulnerabilityInfo || vulnerabilityInfo.length === 0) {
            return 'low';
        }
        
        let highestSeverity = 'low';
        
        for (const info of vulnerabilityInfo) {
            const severity = info.severity?.toLowerCase() || 'low';
            if (severityOrder.indexOf(severity) < severityOrder.indexOf(highestSeverity)) {
                highestSeverity = severity;
            }
        }
        
        return highestSeverity;
    }

    /**
     * Generate HTML for top recommendations
     */
    private generateTopRecommendations(recommendations: any[]): string {
        // Sort by severity (critical first)
        const sortedRecommendations = [...recommendations].sort((a, b) => {
            const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
        
        // Get top 5 or fewer
        const topRecommendations = sortedRecommendations.slice(0, 5);
        
        return topRecommendations.map(rec => {
            return `
                <li>
                    <span class="severity-indicator severity-${rec.severity}"></span>
                    <strong>${rec.title}</strong> - ${rec.description}
                </li>
            `;
        }).join('');
    }

    /**
     * Calculate the overall risk score (0-100%)
     */
    private calculateOverallRiskScore(codeResult: any, dependencyResult: any, recommendationsResult: any): number {
        // Weight factors (can be adjusted)
        const codeIssuesWeight = 0.4;
        const dependencyVulnerabilitiesWeight = 0.3;
        const recommendationsWeight = 0.3;
        
        // Calculate code issues score (lower is better)
        const codeFilesScanned = codeResult.scannedFiles || 1;
        const codeIssuesScore = Math.min(100, (codeResult.issues.length / codeFilesScanned) * 100);
        
        // Calculate dependency vulnerabilities score (lower is better)
        const totalDeps = dependencyResult.totalDependencies || 1;
        const dependencyScore = Math.min(100, (dependencyResult.vulnerabilities.length / totalDeps) * 200);
        
        // Calculate recommendations score based on severity (lower is better)
        const recSummary = recommendationsResult.analysisSummary;
        const recommendationsScore = Math.min(100, (
            (recSummary.critical * 10) + 
            (recSummary.high * 5) + 
            (recSummary.medium * 2) + 
            (recSummary.low * 0.5)
        ));
        
        // Calculate weighted risk score (higher values mean higher risk)
        const weightedRiskScore = (
            (codeIssuesScore * codeIssuesWeight) +
            (dependencyScore * dependencyVulnerabilitiesWeight) +
            (recommendationsScore * recommendationsWeight)
        );
        
        // Invert to make lower values mean lower risk (0-100%)
        return Math.round(Math.min(100, weightedRiskScore));
    }

    /**
     * Determine overall risk level (low, medium, high)
     */
    private calculateOverallRiskLevel(codeResult: any, dependencyResult: any, recommendationsResult: any): string {
        const score = this.calculateOverallRiskScore(codeResult, dependencyResult, recommendationsResult);
        
        if (score < 30) return 'low';
        if (score < 70) return 'medium';
        return 'high';
    }

    /**
     * Show security issues of a specific type
     */
    private async showSecurityIssuesByType(issueId: string): Promise<void> {
        try {
            const result = await this.codeScanner.scanWorkspace();
            const filteredIssues = result.issues.filter(issue => issue.id === issueId);
            
            if (filteredIssues.length > 0) {
                // Show only issues of this type
                this.codeScanner.showSecurityReport({
                    issues: filteredIssues,
                    scannedFiles: result.scannedFiles
                });
            } else {
                vscode.window.showInformationMessage(`No security issues of type ${issueId} found`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error filtering security issues: ${error}`);
        }
    }

    /**
     * Install a package via terminal
     */
    private async installPackage(packageName: string, flags = ''): Promise<void> {
        const terminal = vscode.window.createTerminal('Package Installation');
        terminal.show();
        
        const installCommand = `npm install ${packageName} ${flags}`;
        terminal.sendText(installCommand);
        
        vscode.window.showInformationMessage(`Installing ${packageName}...`);
    }
}
