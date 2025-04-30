import * as vscode from 'vscode';
import { LLMConnectionManager } from '../llm/LLMConnectionManager';
/**
 * Provides the agent sidebar webview implementation
 */
export declare class AgentSidebarProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    private readonly _connectionManager;
    static readonly viewType = "copilot-ppa.agentSidebar";
    private _view?;
    private readonly _messageHandlers;
    private readonly _disposables;
    constructor(_extensionUri: vscode.Uri, _connectionManager: LLMConnectionManager);
    /**
     * Resolves the webview view
     */
    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void | Thenable<void>;
    /**
     * Sets up the message listener for webview communication
     */
    private setupMessageListener;
    /**
     * Registers all message handlers for webview communication
     */
    private registerMessageHandlers;
    /**
     * Listens to connection state changes
     */
    private listenToConnectionChanges;
    /**
     * Updates the connection state in the webview
     */
    private updateConnectionState;
    /**
     * Shows an error message in the webview
     */
    private showError;
    /**
     * Gets the HTML content for the webview
     */
    private _getHtmlContent;
    /**
     * Generates a nonce for Content Security Policy
     */
    private generateNonce;
    /**
     * Cleans up resources
     */
    dispose(): void;
}
