import * as vscode from 'vscode';
import { CodeReviewService } from './services/CodeReviewService';

/**
 * Webview provider for the code review UI
 */
export class CodeReviewWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeReviewPanel';
    
    private _view?: vscode.WebviewView;
    private service: CodeReviewService;
    
    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) {
        this.service = new CodeReviewService(_context);
    }
    
    /**
     * Resolves the webview view
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        
        webviewView.webview.html = this.service.getWebviewHtml(webviewView.webview, this._extensionUri);
        
        // Set up message handling
        this._setWebviewMessageListener(webviewView.webview);
    }
    
    /**
     * Sets up webview message listener
     */
    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(async (message) => {
            const response = await this.service.handleWebviewMessage(message);
            if (response) {
                this._view?.webview.postMessage(response);
            }
        });
    }
}
