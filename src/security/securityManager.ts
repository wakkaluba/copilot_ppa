import * as vscode from 'vscode';
import { SecurityAnalysisService } from './services/SecurityAnalysisService';
import { DependencyAnalysisService } from './services/DependencyAnalysisService';
import { RecommendationService } from './services/RecommendationService';
import { SecurityReportService } from './services/SecurityReportService';
import { SecurityCommandService } from './services/SecurityCommandService';

/**
 * Main security manager class that coordinates security features through specialized services
 */
export class SecurityManager {
    private readonly statusBarItem: vscode.StatusBarItem;
    private readonly disposables: vscode.Disposable[] = [];

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly analysisSvc: SecurityAnalysisService,
        private readonly dependencySvc: DependencyAnalysisService,
        private readonly recommendationSvc: RecommendationService,
        private readonly reportSvc: SecurityReportService,
        private readonly commandSvc: SecurityCommandService
    ) {
        // Initialize status bar
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.initializeStatusBar();
        this.registerCommands();
    }

    private initializeStatusBar(): void {
        this.statusBarItem.text = '$(shield) Security';
        this.statusBarItem.tooltip = 'Run security analysis';
        this.statusBarItem.command = 'vscode-local-llm-agent.security.runFullAnalysis';
        this.statusBarItem.show();
        this.disposables.push(this.statusBarItem);
    }

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
                'vscode-local-llm-agent.security.runFullAnalysis',
                () => this.runFullSecurityAnalysis()
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.checkDependencies',
                () => this.checkDependencies()
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.security.generateRecommendations',
                () => this.generateSecurityRecommendations()
            ),
            vscode.commands.registerCommand(
                'vscode-local-llm-agent.securityIssues.showAll',
                (issueId: string) => this.showSecurityIssuesByType(issueId)
            )
        );
    }

    private async scanActiveFile(): Promise<void> {
        try {
            const result = await this.analysisSvc.scanActiveFile();
            await this.reportSvc.showCodeIssues(result);
        } catch (error) {
            vscode.window.showErrorMessage(`Error scanning active file: ${error}`);
        }
    }

    private async scanWorkspace(): Promise<void> {
        try {
            const result = await this.analysisSvc.scanWorkspace();
            await this.reportSvc.showCodeIssues(result);
        } catch (error) {
            vscode.window.showErrorMessage(`Error scanning workspace: ${error}`);
        }
    }

    private async checkDependencies(): Promise<void> {
        try {
            const result = await this.dependencySvc.scanDependencies();
            await this.reportSvc.showDependencyReport(result);
        } catch (error) {
            vscode.window.showErrorMessage(`Error checking dependencies: ${error}`);
        }
    }

    private async generateSecurityRecommendations(): Promise<void> {
        try {
            const result = await this.recommendationSvc.generate();
            await this.reportSvc.showRecommendations(result);
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating recommendations: ${error}`);
        }
    }

    private async runFullSecurityAnalysis(): Promise<void> {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running full security analysis",
            cancellable: true
        }, async (progress) => {
            try {
                progress.report({ message: "Scanning code...", increment: 0 });
                const codeResult = await this.analysisSvc.scanWorkspace();

                progress.report({ message: "Checking dependencies...", increment: 33 });
                const depResult = await this.dependencySvc.scanDependencies();

                progress.report({ message: "Generating recommendations...", increment: 66 });
                const recResult = await this.recommendationSvc.generate();

                progress.report({ message: "Preparing report...", increment: 90 });
                await this.reportSvc.showFullReport(codeResult, depResult, recResult);
            } catch (error) {
                vscode.window.showErrorMessage(`Error during security analysis: ${error}`);
            }
        });
    }

    private async showSecurityIssuesByType(issueId: string): Promise<void> {
        try {
            const result = await this.analysisSvc.getIssuesByType(issueId);
            await this.reportSvc.showFilteredIssues(result, issueId);
        } catch (error) {
            vscode.window.showErrorMessage(`Error showing security issues: ${error}`);
        }
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.analysisSvc.dispose();
        this.dependencySvc.dispose();
        this.recommendationSvc.dispose();
        this.reportSvc.dispose();
        this.commandSvc.dispose();
    }
}
