import * as vscode from 'vscode';
import { CodeSecurityScanner } from './codeScanner';
import { DependencyScanner } from './dependencyScanner';
import { SecurityRecommendations } from './securityRecommendations';
import { SecurityAnalysisService } from './services/SecurityAnalysisService';
import { DependencyAnalysisService } from './services/DependencyAnalysisService';
import { RecommendationService } from './services/RecommendationService';
import { SecurityReportService } from './services/SecurityReportService';

/**
 * Main security manager class that coordinates all security features
 */
export class SecurityManager {
    private context: vscode.ExtensionContext;
    private codeScanner: CodeSecurityScanner;
    private dependencyScanner: DependencyScanner;
    private securityRecommendations: SecurityRecommendations;
    private statusBarItem: vscode.StatusBarItem;
    private analysisSvc: SecurityAnalysisService;
    private dependencySvc: DependencyAnalysisService;
    private recommendationSvc: RecommendationService;
    private reportSvc: SecurityReportService;

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
        
        this.analysisSvc = new SecurityAnalysisService(context);
        this.dependencySvc = new DependencyAnalysisService(context);
        this.recommendationSvc = new RecommendationService(context);
        this.reportSvc = new SecurityReportService(context);
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
        const result = await this.analysisSvc.scanActiveFile();
        await this.reportSvc.showCodeIssues(result);
    }

    /**
     * Scan the entire workspace for security issues
     */
    private async scanWorkspace(): Promise<void> {
        const result = await this.analysisSvc.scanWorkspace();
        await this.reportSvc.showCodeIssues(result);
    }

    /**
     * Check dependencies for vulnerabilities
     */
    private async checkDependencies(): Promise<void> {
        const result = await this.dependencySvc.scanDependencies();
        await this.reportSvc.showDependencyReport(result);
    }

    /**
     * Generate and show security recommendations
     */
    private async generateSecurityRecommendations(): Promise<void> {
        const result = await this.recommendationSvc.generate();
        await this.reportSvc.showRecommendations(result);
    }

    /**
     * Run a full security analysis of the workspace
     */
    private async runFullSecurityAnalysis(): Promise<void> {
        const codeResult = await this.analysisSvc.scanWorkspace();
        const depResult = await this.dependencySvc.scanDependencies();
        const recResult = await this.recommendationSvc.generate();
        await this.reportSvc.showFullReport(codeResult, depResult, recResult);
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
