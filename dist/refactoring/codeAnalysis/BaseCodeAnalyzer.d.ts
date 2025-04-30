import * as vscode from 'vscode';
export declare abstract class BaseCodeAnalyzer implements vscode.Disposable {
    protected diagnosticCollection: vscode.DiagnosticCollection;
    constructor();
    dispose(): void;
    protected updateDiagnostics(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]): void;
    protected clearDiagnostics(document: vscode.TextDocument): void;
}
