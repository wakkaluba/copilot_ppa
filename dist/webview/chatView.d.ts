import * as vscode from 'vscode';
import { ILLMChatManager } from '../models';
export declare class UnifiedChatViewProvider implements vscode.WebviewViewProvider {
    private readonly extensionUri;
    private readonly chatManager;
    static readonly viewType = "copilotPPA.chatView";
    private view?;
    private currentSession?;
    private readonly logger;
    private readonly themeService;
    private disposables;
    constructor(extensionUri: vscode.Uri, chatManager: ILLMChatManager);
    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void | Thenable<void>;
    private setupEventListeners;
    private initializeWebview;
    private registerMessageHandlers;
    private showContinuePrompt;
    private handleContinueIteration;
    private handleMessage;
    private clearChat;
    private copyToClipboard;
    private createSnippet;
    private updateMessages;
    private updateConnectionStatus;
    private updateTheme;
    private handleError;
    private getWebviewContent;
    private getResourceUri;
    dispose(): void;
}
