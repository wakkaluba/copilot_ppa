import * as vscode from 'vscode';
export declare class SidebarPanel {
    static readonly viewType = "localLLMAgent.sidebarPanel";
    private readonly _panel;
    private readonly _extensionUri;
    private _disposables;
    static createOrShow(extensionUri: vscode.Uri): void;
    static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri): void;
    private static currentPanel?;
    private constructor();
    private _handleSendPrompt;
    private _handleClearChat;
    dispose(): void;
    private _update;
    private _getHtmlForWebview;
}
