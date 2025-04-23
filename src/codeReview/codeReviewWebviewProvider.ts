import * as vscode from 'vscode';
import { injectable, inject } from 'inversify';
import { ILogger } from '../logging/ILogger';
import { CodeReviewService } from './services/CodeReviewService';

@injectable()
export class CodeReviewWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeReviewPanel';
    private _view?: vscode.WebviewView;
    
    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext,
        @inject(CodeReviewService) private readonly service: CodeReviewService
    ) {}
    
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        try {
            this._view = webviewView;
            
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [this._extensionUri]
            };
            
            webviewView.webview.html = this.service.getWebviewHtml(webviewView.webview, this._extensionUri);
            this._setWebviewMessageListener(webviewView.webview);
        } catch (error) {
            this.logger.error('Error resolving webview:', error);
            throw error;
        }
    }
    
    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(async (message) => {
            try {
                const response = await this.service.handleWebviewMessage(message);
                if (response) {
                    this._view?.webview.postMessage(response);
                }
            } catch (error) {
                this.logger.error('Error handling webview message:', error);
                vscode.window.showErrorMessage(`Failed to handle message: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
}
