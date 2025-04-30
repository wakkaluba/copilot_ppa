import * as vscode from 'vscode';
export declare class CodeOverviewWebview {
    private panel?;
    show(symbols: vscode.DocumentSymbol[], language: string): void;
    private registerWebviewMessageHandling;
    private jumpToLine;
    private getWebviewContent;
    private getSymbolsHtml;
    private getStyles;
    private getClientScript;
}
