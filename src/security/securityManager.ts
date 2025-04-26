import * as vscode from 'vscode';
import { SecurityWebviewService } from '../services/security/SecurityWebviewService';
import { SecurityScanService } from '../services/security/SecurityScanService';
import { Logger } from '../utils/logger';
import { SecurityScanResult } from '../types/security';

export class SecurityManager implements vscode.Disposable {
    private static instance: SecurityManager;
    private panel?: vscode.WebviewPanel;
    private readonly logger: Logger;
    private readonly webviewService: SecurityWebviewService;
    private readonly scanService: SecurityScanService;
    private readonly statusBarItem: vscode.StatusBarItem;
    private readonly disposables: vscode.Disposable[] = [];
    private lastResult?: SecurityScanResult;

    private constructor(private readonly context: vscode.ExtensionContext) {
        this.logger = Logger.getInstance();
        this.webviewService = new SecurityWebviewService();
        this.scanService = new SecurityScanService(context);

        // Initialize status bar
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = '$(shield) Security';
        this.statusBarItem.tooltip = 'Run security analysis';
        this.statusBarItem.command = 'copilot-ppa.security.showPanel';
        this.statusBarItem.show();
        this.disposables.push(this.statusBarItem);

        this.registerCommands();
    }

    public static getInstance(context: vscode.ExtensionContext): SecurityManager {
        if (!SecurityManager.instance) {
            SecurityManager.instance = new SecurityManager(context);
        }
        return SecurityManager.instance;
    }

    private registerCommands(): void {
        this.disposables.push(
            vscode.commands.registerCommand('copilot-ppa.security.showPanel', () => {
                this.show();
            }),
            vscode.commands.registerCommand('copilot-ppa.security.runScan', async () => {
                await this.runScan();
            }),
            vscode.commands.registerCommand('copilot-ppa.security.showIssueDetails', (issueId: string) => {
                this.showIssueDetails(issueId);
            })
        );
    }

    public async show(): Promise<void> {
        try {
            if (this.panel) {
                this.panel.reveal();
                return;
            }

            this.panel = vscode.window.createWebviewPanel(
                'securityPanel',
                'Security Analysis',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.joinPath(this.context.extensionUri, 'media')
                    ]
                }
            );

            if (this.panel) {
                this.panel.webview.html = this.webviewService.generateWebviewContent(
                    this.panel.webview,
                    this.lastResult
                );

                this.registerWebviewMessageHandlers();

                this.panel.onDidDispose(() => {
                    this.panel = undefined;
                }, null, this.disposables);

                if (!this.lastResult) {
                    await this.runScan();
                }
            }

        } catch (error) {
            this.logger.error('Error showing security panel', error);
            throw error;
        }
    }

    private registerWebviewMessageHandlers(): void {
        if (!this.panel) {return;}

        this.panel.webview.onDidReceiveMessage(async (message) => {
            try {
                let issueId;
                
                switch (message.command) {
                    case 'refresh':
                        await this.runScan();
                        break;
                    case 'showDetails':
                        issueId = message.issueId;
                        await this.showIssueDetails(issueId);
                        break;
                    default:
                        this.logger.warn(`Unknown command received: ${message.command}`);
                }
            } catch (error) {
                this.logger.error('Error handling security panel message', error);
                this.showErrorMessage('Failed to process command');
            }
        }, undefined, this.disposables);
    }

    private async runScan(): Promise<void> {
        if (!this.panel) {return;}

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Running security analysis...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });
                this.lastResult = await this.scanService.runFullScan();
                progress.report({ increment: 100 });

                this.updateWebviewContent();
            });
        } catch (error) {
            this.logger.error('Error running security scan', error);
            this.showErrorMessage('Failed to complete security scan');
        }
    }

    private updateWebviewContent(): void {
        if (!this.panel) {return;}

        try {
            this.panel.webview.html = this.webviewService.generateWebviewContent(
                this.panel.webview,
                this.lastResult
            );
        } catch (error) {
            this.logger.error('Error updating security panel content', error);
            this.showErrorMessage('Failed to update panel content');
        }
    }

    private async showIssueDetails(issueId: string): Promise<void> {
        if (!this.panel || !this.lastResult) {
            return;
        }

        try {
            const issue = this.lastResult.issues.find(issue => issue.id === issueId);
            if (!issue) {
                this.logger.warn(`Issue with ID ${issueId} not found`);
                this.showErrorMessage(`Issue with ID ${issueId} not found`);
                return;
            }

            // Get detailed information about the issue
            const detailedInfo = await this.scanService.getIssueDetails(issueId);

            // Send the detailed information to the webview
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'showIssueDetails',
                    issue: detailedInfo
                });
            }
        } catch (error) {
            this.logger.error(`Error showing issue details for ${issueId}`, error);
            this.showErrorMessage('Failed to retrieve issue details');
        }
    }

    private showErrorMessage(message: string): void {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'showError',
                message
            });
        }
    }

    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }

        this.scanService.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
