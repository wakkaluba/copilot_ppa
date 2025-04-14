import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { workspace } from 'vscode';

/**
 * Class responsible for scanning project dependencies for known vulnerabilities
 */
export class DependencyScanner {
    private context: vscode.ExtensionContext;
    private vulnerabilityCache: Map<string, VulnerabilityInfo[]>;
    private statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.vulnerabilityCache = new Map();
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'vscode-local-llm-agent.showDependencyReport';
        context.subscriptions.push(this.statusBarItem);
    }

    /**
     * Scans the workspace for dependency files and checks for vulnerabilities
     */
    public async scanWorkspaceDependencies(): Promise<DependencyScanResult> {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders) {
            return { vulnerabilities: [], totalDependencies: 0, hasVulnerabilities: false };
        }

        let allVulnerabilities: Vulnerability[] = [];
        let totalDependencies = 0;

        for (const folder of workspaceFolders) {
            const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const { vulns, total } = await this.scanNodeDependencies(packageJsonPath);
                allVulnerabilities = [...allVulnerabilities, ...vulns];
                totalDependencies += total;
            }

            // Check for other dependency files (pom.xml, build.gradle, etc.)
            const pomXmlPath = path.join(folder.uri.fsPath, 'pom.xml');
            if (fs.existsSync(pomXmlPath)) {
                const { vulns, total } = await this.scanMavenDependencies(pomXmlPath);
                allVulnerabilities = [...allVulnerabilities, ...vulns];
                totalDependencies += total;
            }

            // Add more package manager support as needed
        }

        const hasVulnerabilities = allVulnerabilities.length > 0;

        // Update status bar
        this.updateStatusBar(hasVulnerabilities, allVulnerabilities.length);

        return {
            vulnerabilities: allVulnerabilities,
            totalDependencies,
            hasVulnerabilities
        };
    }

    /**
     * Scans Node.js dependencies from package.json
     */
    private async scanNodeDependencies(packageJsonPath: string): Promise<{ vulns: Vulnerability[], total: number }> {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const dependencies = { 
                ...(packageJson.dependencies || {}), 
                ...(packageJson.devDependencies || {}) 
            };
            
            const total = Object.keys(dependencies).length;
            const vulnerabilities: Vulnerability[] = [];

            for (const [pkg, version] of Object.entries(dependencies)) {
                const vulns = await this.checkDependencyVulnerabilities(pkg, String(version));
                
                if (vulns.length > 0) {
                    vulnerabilities.push({
                        name: pkg,
                        version: String(version),
                        vulnerabilityInfo: vulns,
                        packageManager: 'npm'
                    });
                }
            }

            return { vulns: vulnerabilities, total };
        } catch (error) {
            console.error('Error scanning Node dependencies:', error);
            return { vulns: [], total: 0 };
        }
    }

    /**
     * Scans Maven dependencies from pom.xml
     */
    private async scanMavenDependencies(pomXmlPath: string): Promise<{ vulns: Vulnerability[], total: number }> {
        // This is a placeholder for Maven dependency scanning
        // In a real implementation, this would parse the pom.xml file and check each dependency
        return { vulns: [], total: 0 };
    }

    /**
     * Checks a specific dependency for known vulnerabilities using a security API
     */
    private async checkDependencyVulnerabilities(pkg: string, version: string): Promise<VulnerabilityInfo[]> {
        const cacheKey = `${pkg}@${version}`;
        
        if (this.vulnerabilityCache.has(cacheKey)) {
            return this.vulnerabilityCache.get(cacheKey) || [];
        }

        try {
            // In a real implementation, this would call a vulnerability database API
            // For example: OSV (https://osv.dev/), Snyk, or GitHub Advisory Database
            const response = await axios.get(`https://api.osv.dev/v1/query`, {
                data: {
                    package: {
                        name: pkg,
                        ecosystem: "npm"
                    },
                    version
                }
            });

            const vulnerabilities: VulnerabilityInfo[] = response.data.vulns || [];
            this.vulnerabilityCache.set(cacheKey, vulnerabilities);
            return vulnerabilities;
        } catch (error) {
            console.error(`Error checking vulnerabilities for ${pkg}@${version}:`, error);
            return [];
        }
    }

    /**
     * Updates the status bar indicator with vulnerability information
     */
    private updateStatusBar(hasVulnerabilities: boolean, count: number): void {
        if (hasVulnerabilities) {
            this.statusBarItem.text = `$(shield) ${count} Vulnerabilities`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            this.statusBarItem.show();
        } else {
            this.statusBarItem.text = `$(shield) Dependencies Secure`;
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.show();
        }
    }

    /**
     * Shows a detailed vulnerability report
     */
    public async showVulnerabilityReport(): Promise<void> {
        const result = await this.scanWorkspaceDependencies();
        const panel = vscode.window.createWebviewPanel(
            'dependencyVulnerabilityReport',
            'Dependency Vulnerability Report',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = this.generateReportHtml(result);
    }

    /**
     * Generates HTML for the vulnerability report
     */
    private generateReportHtml(result: DependencyScanResult): string {
        let vulnerabilitiesHtml = '';
        
        if (result.vulnerabilities.length > 0) {
            vulnerabilitiesHtml = result.vulnerabilities.map(vuln => {
                const vulnDetails = vuln.vulnerabilityInfo.map(info => {
                    return `
                        <div class="vulnerability-detail">
                            <h4>${info.id || 'Unknown'}</h4>
                            <p><strong>Severity:</strong> ${info.severity || 'Unknown'}</p>
                            <p><strong>Description:</strong> ${info.description || 'No description available'}</p>
                            <p><strong>Fixed in:</strong> ${info.fixedIn?.join(', ') || 'No fix available'}</p>
                            <p><a href="${info.url || '#'}" target="_blank">More info</a></p>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="vulnerability">
                        <h3>${vuln.name}@${vuln.version} (${vuln.packageManager})</h3>
                        <p>${vuln.vulnerabilityInfo.length} vulnerabilities found</p>
                        <div class="vulnerability-details">
                            ${vulnDetails}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            vulnerabilitiesHtml = '<div class="success-message"><p>No vulnerabilities found in dependencies.</p></div>';
        }

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dependency Vulnerability Report</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                    }
                    h1, h2, h3, h4 {
                        color: var(--vscode-editor-foreground);
                    }
                    .summary {
                        margin-bottom: 20px;
                        padding: 10px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                    }
                    .vulnerability {
                        margin-bottom: 20px;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-left: 4px solid var(--vscode-errorForeground);
                        border-radius: 5px;
                    }
                    .vulnerability-detail {
                        margin: 10px 0;
                        padding: 10px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                        border-left: 3px solid var(--vscode-editorInfo-foreground);
                    }
                    .success-message {
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-left: 4px solid var(--vscode-terminal-ansiGreen);
                        border-radius: 5px;
                    }
                    a {
                        color: var(--vscode-textLink-foreground);
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h1>Dependency Vulnerability Report</h1>
                
                <div class="summary">
                    <h2>Summary</h2>
                    <p>Total dependencies scanned: ${result.totalDependencies}</p>
                    <p>Vulnerabilities found: ${result.vulnerabilities.length}</p>
                </div>
                
                <h2>Vulnerability Details</h2>
                ${vulnerabilitiesHtml}
            </body>
            </html>
        `;
    }
}

/**
 * Interface representing a vulnerability in a dependency
 */
export interface Vulnerability {
    name: string;
    version: string;
    vulnerabilityInfo: VulnerabilityInfo[];
    packageManager: 'npm' | 'maven' | 'gradle' | 'other';
}

/**
 * Interface for detailed information about a specific vulnerability
 */
export interface VulnerabilityInfo {
    id?: string;
    description?: string;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    url?: string;
    fixedIn?: string[];
}

/**
 * Interface for the overall result of a dependency scan
 */
export interface DependencyScanResult {
    vulnerabilities: Vulnerability[];
    totalDependencies: number;
    hasVulnerabilities: boolean;
}
