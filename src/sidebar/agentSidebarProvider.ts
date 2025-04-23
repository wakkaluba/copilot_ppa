import * as vscode from 'vscode';
import * as path from 'path';
import { LLMConnectionManager } from '../llm/llmConnectionManager';
import { IWebviewMessage, WebviewMessageHandler } from '../types/webview';

/**
 * Provides the agent sidebar webview implementation
 */
export class AgentSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'copilot-ppa.agentSidebar';
    private _view?: vscode.WebviewView;
    private readonly _messageHandlers: Map<string, WebviewMessageHandler>;
    private readonly _disposables: vscode.Disposable[] = [];

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _connectionManager: LLMConnectionManager
    ) {
        this._messageHandlers = new Map();
        this.registerMessageHandlers();
        this.listenToConnectionChanges();
    }

    /**
     * Resolves the webview view
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlContent(webviewView.webview);
        this.setupMessageListener(webviewView.webview);
        this.updateConnectionState();
    }

    /**
     * Sets up the message listener for webview communication
     */
    private setupMessageListener(webview: vscode.Webview): void {
        this._disposables.push(
            webview.onDidReceiveMessage(async (message: IWebviewMessage) => {
                const handler = this._messageHandlers.get(message.type);
                if (handler) {
                    try {
                        await handler(message.data);
                    } catch (error) {
                        console.error(`Error handling message ${message.type}:`, error);
                        this.showError(`Failed to handle ${message.type}: ${error instanceof Error ? error.message : String(error)}`);
                    }
                } else {
                    console.warn(`No handler registered for message type: ${message.type}`);
                }
            })
        );
    }

    /**
     * Registers all message handlers for webview communication
     */
    private registerMessageHandlers(): void {
        this._messageHandlers.set('connect', async () => {
            try {
                await this._connectionManager.connect();
                this.updateConnectionState();
            } catch (error) {
                this.showError(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`);
            }
        });

        this._messageHandlers.set('disconnect', async () => {
            try {
                await this._connectionManager.disconnect();
                this.updateConnectionState();
            } catch (error) {
                this.showError(`Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`);
            }
        });

        this._messageHandlers.set('refreshModels', async () => {
            try {
                const models = await this._connectionManager.getAvailableModels();
                await this._view?.webview.postMessage({ 
                    type: 'updateModels', 
                    data: models 
                });
            } catch (error) {
                this.showError(`Failed to refresh models: ${error instanceof Error ? error.message : String(error)}`);
            }
        });

        this._messageHandlers.set('setModel', async (modelId: string) => {
            try {
                await this._connectionManager.setModel(modelId);
                this.updateConnectionState();
            } catch (error) {
                this.showError(`Failed to set model: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }

    /**
     * Listens to connection state changes
     */
    private listenToConnectionChanges(): void {
        this._disposables.push(
            this._connectionManager.onConnectionStateChanged(() => {
                this.updateConnectionState();
            })
        );
    }

    /**
     * Updates the connection state in the webview
     */
    private async updateConnectionState(): Promise<void> {
        if (!this._view) return;

        const state = this._connectionManager.getConnectionState();
        const currentModel = this._connectionManager.getCurrentModel();
        
        await this._view.webview.postMessage({
            type: 'updateState',
            data: {
                connected: state.isConnected,
                model: currentModel,
                models: await this._connectionManager.getAvailableModels()
            }
        });
    }

    /**
     * Shows an error message in the webview
     */
    private async showError(message: string): Promise<void> {
        if (!this._view) return;
        
        await this._view.webview.postMessage({
            type: 'showError',
            data: message
        });
    }

    /**
     * Gets the HTML content for the webview
     */
    private _getHtmlContent(webview: vscode.Webview): string {
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'agent-sidebar.html');
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'agent-sidebar.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js'));
        const nonce = this.generateNonce();

        let htmlContent = require('fs').readFileSync(htmlPath.fsPath, 'utf8');
        return htmlContent
            .replace('${webview.cspSource}', webview.cspSource)
            .replace('${styleUri}', styleUri.toString())
            .replace('${scriptUri}', scriptUri.toString())
            .replace('${nonce}', nonce);
    }

    /**
     * Generates a nonce for Content Security Policy
     */
    private generateNonce(): string {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Cleans up resources
     */
    public dispose(): void {
        this._disposables.forEach(d => d.dispose());
        this._messageHandlers.clear();
        this._view = undefined;
    }
}
