import * as vscode from 'vscode';
/**
 * Provides a burger menu with quick access to command toggles
 */
export declare class QuickAccessMenu {
    private panel?;
    private readonly webviewService;
    private readonly toggleService;
    constructor(context: vscode.ExtensionContext);
    /**
     * Show the quick access menu
     */
    show(): void;
    /**
     * Update the panel content
     */
    private updatePanel;
    /**
     * Handle messages from the webview
     */
    private handleWebviewMessage;
}
