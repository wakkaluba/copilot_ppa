import * as vscode from 'vscode';
import { ILogger } from '../logging/ILogger';
import { CodeReviewService } from './services/CodeReviewService';
export declare class CodeReviewWebviewProvider implements vscode.WebviewViewProvider {
    private readonly logger;
    private readonly _extensionUri;
    private readonly _context;
    private readonly service;
    static readonly viewType = "codeReviewPanel";
    private _view?;
    constructor(logger: ILogger, _extensionUri: vscode.Uri, _context: vscode.ExtensionContext, service: CodeReviewService);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    private _setWebviewMessageListener;
}
