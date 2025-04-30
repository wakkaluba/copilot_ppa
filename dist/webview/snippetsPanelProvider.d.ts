import * as vscode from 'vscode';
export declare class SnippetsPanelProvider {
    private readonly context;
    static readonly viewType = "copilotPPA.snippetsPanel";
    private panel?;
    private snippetManager;
    private disposables;
    constructor(context: vscode.ExtensionContext);
    dispose(): void;
    open(): void;
    private updateWebviewContent;
    private handleCreateSnippet;
    private handleUpdateSnippet;
    private handleDeleteSnippet;
    private handleCopySnippet;
    private handleOpenSource;
    private getWebviewContent;
    private renderSnippetCard;
    private escapeHtml;
}
