import * as vscode from 'vscode';
import { RepositoryWebviewService } from './services/RepositoryWebviewService';
import { ThemeService } from '../services/ui/themeManager';
import { Logger } from '../utils/logger';

export class RepositoryPanel implements vscode.Disposable {
    private static instance: RepositoryPanel;
    private panel?: vscode.WebviewPanel;
    private readonly webviewService: RepositoryWebviewService;
    private readonly disposables: vscode.Disposable[] = [];
    private readonly logger: Logger;

    private constructor(private readonly context: vscode.ExtensionContext) {
        this.logger = Logger.getInstance();
        this.webviewService = new RepositoryWebviewService(ThemeService.getInstance());
    }

    public static getInstance(context: vscode.ExtensionContext): RepositoryPanel {
        if (!RepositoryPanel.instance) {
            RepositoryPanel.instance = new RepositoryPanel(context);
        }
        return RepositoryPanel.instance;
    }

    public async show(): Promise<void> {
        try {
            if (this.panel) {
                this.panel.reveal();
                return;
            }

            this.panel = vscode.window.createWebviewPanel(
                'repositoryPanel',
                'Repository',
                vscode.ViewColumn.Three,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
                }
            );

            this.updateWebviewContent();
            this.registerMessageHandlers();

            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this.dispose();
            }, null, this.disposables);

        } catch (error) {
            this.logger.error('Error showing repository panel', error);
            throw error;
        }
    }

    private updateWebviewContent(): void {
        if (!this.panel) {return;}

        try {
            this.panel.webview.html = this.webviewService.generateWebviewContent(this.panel.webview);
        } catch (error) {
            this.logger.error('Error updating repository panel content', error);
            this.showErrorInWebview('Failed to update panel content');
        }
    }

    private registerMessageHandlers(): void {
        if (!this.panel) {return;}

        this.panel.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.command) {
                    case 'refreshRepository':
                        await this.refreshRepository();
                        break;
                    case 'showBranches':
                        await this.showBranches();
                        break;
                    case 'showCommits':
                        await this.showCommits();
                        break;
                    default:
                        this.logger.warn(`Unknown command received: ${message.command}`);
                }
            } catch (error) {
                this.logger.error('Error handling repository panel message', error);
                this.showErrorInWebview('Failed to process command');
            }
        }, undefined, this.disposables);
    }

    private async refreshRepository(): Promise<void> {
        // Implementation details
    }

    private async showBranches(): Promise<void> {
        // Implementation details
    }

    private async showCommits(): Promise<void> {
        // Implementation details
    }

    private showErrorInWebview(message: string): void {
        if (this.panel) {
            this.panel.webview.postMessage({
                type: 'showError',
                message
            });
        }
    }

    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }

        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        RepositoryPanel.instance = undefined;
    }
}
