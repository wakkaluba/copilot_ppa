import * as vscode from 'vscode';
export interface ILanguageAnalyzer extends vscode.Disposable {
    findUnusedCode(document: vscode.TextDocument, selection?: vscode.Selection): Promise<vscode.Diagnostic[]>;
}
