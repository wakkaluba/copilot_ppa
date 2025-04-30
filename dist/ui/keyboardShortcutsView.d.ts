import * as vscode from 'vscode';
/**
 * WebviewViewProvider for displaying keyboard shortcuts in the sidebar
 */
export declare class KeyboardShortcutsViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    static readonly viewType = "copilotPPA.keyboardShortcutsView";
    private _view?;
    constructor(_extensionUri: vscode.Uri);
    /**
     * Set up the webview HTML and message handlers
     */
    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    /**
     * Load and display keybindings in the webview
     */
    private _loadKeybindings;
    /**
     * Handle editing a keybinding
     */
    private _editKeybinding;
    /**
     * Generate the webview HTML
     */
    private _getHtmlForWebview;
}
