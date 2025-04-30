import * as vscode from 'vscode';
import { CodeExampleService } from '../services/codeExamples/codeExampleService';
export declare class CodeExampleViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    private readonly codeExampleService;
    static readonly viewType = "codeExamples.view";
    private _view?;
    private readonly webviewService;
    private readonly analysisService;
    private readonly htmlService;
    constructor(_extensionUri: vscode.Uri, codeExampleService: CodeExampleService);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    private setupWebview;
    private handleWebviewMessage;
    searchCodeExamples(query: string, language?: string): Promise<void>;
}
