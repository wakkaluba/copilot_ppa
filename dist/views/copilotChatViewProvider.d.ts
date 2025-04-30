import * as vscode from 'vscode';
/**
 * Provides a custom view that integrates with Copilot Chat
 */
export declare class CopilotChatViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    static readonly viewType = "localLlmAgent.copilotChatView";
    private _view?;
    private copilotChatIntegration;
    private logger;
    constructor(_extensionUri: vscode.Uri);
    /**
     * Resolves the webview view
     */
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): Promise<void>;
    /**
     * Update integration status in the webview
     */
    private _updateStatus;
    /**
     * Handle sending a message to Copilot chat
     */
    private _handleSendMessage;
    /**
     * Generate HTML for the webview
     */
    private _getHtmlForWebview;
}
