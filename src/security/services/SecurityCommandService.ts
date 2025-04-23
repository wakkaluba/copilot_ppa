import * as vscode from 'vscode';
import { SecurityAnalysisService } from './SecurityAnalysisService';
import { DependencyAnalysisService } from './DependencyAnalysisService';
import { RecommendationService } from './RecommendationService';
import { SecurityReportService } from './SecurityReportService';

/**
 * Service for registering and handling security-related commands
 */
export class SecurityCommandService implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];

    constructor(
        private readonly analysisSvc: SecurityAnalysisService,
        private readonly dependencySvc: DependencyAnalysisService,
        private readonly recommendationSvc: RecommendationService,
        private readonly reportSvc: SecurityReportService
    ) {
        this.registerCommands();
    }

    /**
     * Register all security-related commands
     */
    private registerCommands(): void {
        this.disposables.push(
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.scanActiveFile',
                () => this.scanActiveFile()
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.scanWorkspace',
                () => this.scanWorkspace()
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.checkDependencies',
                () => this.checkDependencies()
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.generateRecommendations',
                () => this.generateRecommendations()
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.runFullAnalysis',
                () => this.runFullAnalysis()
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.showSecurityIssues',
                (issueId: string) => this.showSecurityIssues(issueId)
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.fixAll',
                () => this.fixAllIssues()
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.applyFix',
                (issue: any) => this.applyFix(issue)
            )
        );
    }

    /**
     * Scan the active file for security issues
     */
    private async scanActiveFile(): Promise<void> {
        try {
            const result = await this.analysisSvc.scanActiveFile();
            await this.reportSvc.showCodeIssues(result);
        } catch (error) {
            vscode.window.showErrorMessage(`Error scanning file: ${error}`);
        }
    }

    /**
     * Scan the entire workspace for security issues
     */
    private async scanWorkspace(): Promise<void> {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Scanning workspace for security issues",
            cancellable: true
        }, async (progress) => {
            try {
                const result = await this.analysisSvc.scanWorkspace(
                    message => progress.report({ message })
                );
                await this.reportSvc.showCodeIssues(result);
            } catch (error) {
                vscode.window.showErrorMessage(`Error scanning workspace: ${error}`);
            }
        });
    }

    /**
     * Check dependencies for vulnerabilities
     */
    private async checkDependencies(): Promise<void> {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Checking dependencies for vulnerabilities",
            cancellable: true
        }, async (progress) => {
            try {
                const result = await this.dependencySvc.scanDependencies(
                    message => progress.report({ message })
                );
                await this.reportSvc.showDependencyReport(result);
            } catch (error) {
                vscode.window.showErrorMessage(`Error checking dependencies: ${error}`);
            }
        });
    }

    /**
     * Generate security recommendations
     */
    private async generateRecommendations(): Promise<void> {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating security recommendations",
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: "Analyzing current security state..." });
                const result = await this.recommendationSvc.generate();
                await this.reportSvc.showFullReport(
                    { issues: [], scannedFiles: 0, timestamp: Date.now() },
                    { vulnerabilities: [], totalDependencies: 0, hasVulnerabilities: false, timestamp: Date.now() },
                    result
                );
            } catch (error) {
                vscode.window.showErrorMessage(`Error generating recommendations: ${error}`);
            }
        });
    }

    /**
     * Run a full security analysis
     */
    private async runFullAnalysis(): Promise<void> {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running full security analysis",
            cancellable: true
        }, async (progress) => {
            try {
                // Step 1: Code analysis
                progress.report({ message: "Scanning code for security issues...", increment: 0 });
                const codeResult = await this.analysisSvc.scanWorkspace(
                    message => progress.report({ message })
                );

                // Step 2: Dependency analysis
                progress.report({ message: "Checking dependencies for vulnerabilities...", increment: 33 });
                const dependencyResult = await this.dependencySvc.scanDependencies(
                    message => progress.report({ message })
                );

                // Step 3: Generate recommendations
                progress.report({ message: "Generating security recommendations...", increment: 66 });
                const recommendationsResult = await this.recommendationSvc.generate();

                // Show full report
                progress.report({ message: "Preparing report...", increment: 90 });
                await this.reportSvc.showFullReport(
                    codeResult,
                    dependencyResult,
                    recommendationsResult
                );
            } catch (error) {
                vscode.window.showErrorMessage(`Error during security analysis: ${error}`);
            }
        });
    }

    /**
     * Show security issues of a specific type
     */
    private async showSecurityIssues(issueId: string): Promise<void> {
        try {
            const issues = await this.analysisSvc.getIssuesByType(issueId);
            await this.reportSvc.showFilteredIssues(issues, issueId);
        } catch (error) {
            vscode.window.showErrorMessage(`Error showing security issues: ${error}`);
        }
    }

    /**
     * Fix all security issues that have automated fixes
     */
    private async fixAllIssues(): Promise<void> {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Fixing security issues",
            cancellable: true
        }, async (progress) => {
            try {
                const result = await this.analysisSvc.scanWorkspace();
                const fixableIssues = result.issues.filter(issue => issue.hasFix);
                
                if (fixableIssues.length === 0) {
                    vscode.window.showInformationMessage('No automated fixes available');
                    return;
                }

                const total = fixableIssues.length;
                for (let i = 0; i < total; i++) {
                    const issue = fixableIssues[i];
                    progress.report({
                        message: `Fixing ${issue.name} (${i + 1}/${total})`,
                        increment: (100 / total)
                    });
                    await this.applyFix(issue);
                }

                vscode.window.showInformationMessage(`Fixed ${total} security issues`);
            } catch (error) {
                vscode.window.showErrorMessage(`Error fixing issues: ${error}`);
            }
        });
    }

    /**
     * Apply a security fix to a specific issue
     */
    private async applyFix(issue: any): Promise<void> {
        try {
            await vscode.commands.executeCommand('vscode-local-llm-agent.security.fix', issue);
            vscode.window.showInformationMessage(`Fixed ${issue.name} issue`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error applying fix: ${error}`);
        }
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}