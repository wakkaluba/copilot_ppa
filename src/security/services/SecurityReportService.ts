import * as vscode from 'vscode';
import { SecurityScanResult, DependencyScanResult, SecurityIssue, RecommendationResult } from '../types';
import { SecurityReportHtmlProvider } from '../providers/SecurityReportHtmlProvider';

/**
 * Service for generating and displaying security reports
 */
export class SecurityReportService implements vscode.Disposable {
    private readonly reportProvider: SecurityReportHtmlProvider;
    private lastReport: { uri: vscode.Uri; type: string } | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.reportProvider = new SecurityReportHtmlProvider(context);
    }

    /**
     * Show a report of code security issues
     */
    public async showCodeIssues(result: SecurityScanResult): Promise<void> {
        const panel = this.createReportPanel('Code Security Issues');
        await this.reportProvider.updateCodeReport(panel, result);
        this.lastReport = { uri: panel.webview.html, type: 'code' };
    }

    /**
     * Show a dependency vulnerability report
     */
    public async showDependencyReport(result: DependencyScanResult): Promise<void> {
        const panel = this.createReportPanel('Dependency Vulnerabilities');
        await this.reportProvider.updateDependencyReport(panel, result);
        this.lastReport = { uri: panel.webview.html, type: 'dependencies' };
    }

    /**
     * Show a filtered list of security issues
     */
    public async showFilteredIssues(issues: SecurityIssue[], issueId: string): Promise<void> {
        const panel = this.createReportPanel(`Security Issues - ${issueId}`);
        await this.reportProvider.updateFilteredReport(panel, issues);
        this.lastReport = { uri: panel.webview.html, type: 'filtered' };
    }

    /**
     * Show a complete security analysis report
     */
    public async showFullReport(
        codeResult: SecurityScanResult,
        dependencyResult: DependencyScanResult,
        recommendationsResult: RecommendationResult
    ): Promise<void> {
        const panel = this.createReportPanel('Security Analysis Report');
        await this.reportProvider.updateFullReport(panel, {
            codeResult,
            dependencyResult,
            recommendationsResult,
            timestamp: Date.now()
        });
        this.lastReport = { uri: panel.webview.html, type: 'full' };
    }

    /**
     * Create a new webview panel for displaying reports
     */
    private createReportPanel(title: string): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            'securityReport',
            title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableFindWidget: true
            }
        );

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async message => {
            switch (message.command) {
                case 'showIssue':
                    await this.showIssueInEditor(message.issue);
                    break;
                case 'applyFix':
                    await vscode.commands.executeCommand(
                        'vscode-local-llm-agent.security.applyFix',
                        message.issue
                    );
                    break;
                case 'exportReport':
                    await this.exportReport(message.format);
                    break;
            }
        });

        return panel;
    }

    /**
     * Show a security issue in the editor
     */
    private async showIssueInEditor(issue: SecurityIssue): Promise<void> {
        const document = await vscode.workspace.openTextDocument(issue.file);
        const editor = await vscode.window.showTextDocument(document);

        // Highlight the relevant line
        const range = document.lineAt(issue.line).range;
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }

    /**
     * Export the current report
     */
    private async exportReport(format: 'html' | 'pdf' | 'markdown'): Promise<void> {
        if (!this.lastReport) return;

        const filters = {
            'HTML Files': ['html'],
            'PDF Files': ['pdf'],
            'Markdown Files': ['md']
        }[`${format.toUpperCase()} Files`];

        const uri = await vscode.window.showSaveDialog({
            filters: { [format]: filters }
        });

        if (uri) {
            try {
                await vscode.workspace.fs.writeFile(
                    uri,
                    Buffer.from(await this.reportProvider.exportReport(this.lastReport.type, format))
                );
                vscode.window.showInformationMessage(`Report exported successfully to ${uri.fsPath}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to export report: ${error}`);
            }
        }
    }

    public dispose(): void {
        this.reportProvider.dispose();
    }
}