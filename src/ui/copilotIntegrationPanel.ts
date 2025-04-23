import * as vscode from 'vscode';
import { CopilotWebviewContentService } from './services/CopilotWebviewContentService';
import { CopilotWebviewStateManager } from './services/CopilotWebviewStateManager';
import { CopilotConnectionManager } from './services/CopilotConnectionManager';
import { CopilotWebviewMessageHandler } from './services/CopilotWebviewMessageHandler';
import { Logger } from '../utils/logger';
import { ThemeService } from '../services/ui/themeManager';

export interface WebviewMessage {
    command: 'toggleLLMMode' | 'sendMessage' | 'reconnectCopilot';
    text?: string;
}

export interface WebviewState {
    isLocalLLMActive: boolean;
    isCopilotConnected: boolean;
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

/**
 * Panel that provides a webview interface for Copilot and LLM interactions
 */
export class CopilotIntegrationPanel implements vscode.Disposable {
    private static instance: CopilotIntegrationPanel;
    private panel?: vscode.WebviewPanel;
    private readonly contentService: CopilotWebviewContentService;
    private readonly stateManager: CopilotWebviewStateManager;
    private readonly connectionManager: CopilotConnectionManager;
    private readonly messageHandler: CopilotWebviewMessageHandler;
    private readonly disposables: vscode.Disposable[] = [];
    private readonly logger: Logger;

    private constructor(private readonly context: vscode.ExtensionContext) {
        this.logger = Logger.getInstance();
        this.contentService = new CopilotWebviewContentService(ThemeService.getInstance());
        this.stateManager = new CopilotWebviewStateManager();
        this.connectionManager = new CopilotConnectionManager();
        this.messageHandler = new CopilotWebviewMessageHandler(
            this.stateManager,
            this.connectionManager,
            this.logger
        );

        this.setupListeners();
    }

    static getInstance(context: vscode.ExtensionContext): CopilotIntegrationPanel {
        if (!CopilotIntegrationPanel.instance) {
            CopilotIntegrationPanel.instance = new CopilotIntegrationPanel(context);
        }
        return CopilotIntegrationPanel.instance;
    }

    private setupListeners(): void {
        this.disposables.push(
            vscode.window.onDidChangeActiveColorTheme(() => this.updateWebviewContent()),
            this.stateManager.onStateChanged(() => this.updateWebviewContent()),
            this.connectionManager.onConnectionChanged(() => this.updateWebviewContent())
        );
    }

    async show(): Promise<void> {
        try {
            if (this.panel) {
                this.panel.reveal();
                return;
            }

            this.panel = vscode.window.createWebviewPanel(
                'copilotIntegration',
                'AI Assistant',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
                }
            );

            await this.connectionManager.initialize();
            this.registerWebviewHandlers();
            this.updateWebviewContent();

            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this.dispose();
            });

        } catch (error) {
            this.logger.error('Error showing Copilot integration panel', error);
            throw this.connectionManager.wrapError('Failed to show integration panel', error);
        }
    }

    private registerWebviewHandlers(): void {
        if (!this.panel) return;

        this.panel.webview.onDidReceiveMessage(
            async (message: WebviewMessage) => {
                try {
                    const response = await this.messageHandler.handleMessage(message);
                    if (response && this.panel) {
                        this.panel.webview.postMessage(response);
                    }
                } catch (error) {
                    this.logger.error('Error handling webview message', error);
                    this.showErrorInWebview(error);
                }
            },
            undefined,
            this.disposables
        );
    }

    private updateWebviewContent(): void {
        if (!this.panel) return;

        try {
            const stylesUri = this.panel.webview.asWebviewUri(
                vscode.Uri.joinPath(this.context.extensionUri, 'media', 'copilot-integration.css')
            );

            this.panel.webview.html = this.contentService.generateWebviewContent(
                stylesUri,
                this.stateManager.getState(),
                this.connectionManager.isConnected(),
                this.panel.webview
            );
        } catch (error) {
            this.logger.error('Error updating webview content', error);
            this.showErrorInWebview(error);
        }
    }

    private showErrorInWebview(error: unknown): void {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'showError',
                text: `Error: ${this.connectionManager.getErrorMessage(error)}`
            });
        }
    }

    dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }

        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;

        this.stateManager.dispose();
        this.connectionManager.dispose();
        this.messageHandler.dispose();
        CopilotIntegrationPanel.instance = undefined;
    }
}
