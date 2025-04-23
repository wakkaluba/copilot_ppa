import * as vscode from 'vscode';

export abstract class BaseCodeAnalyzer implements vscode.Disposable {
    protected diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('unusedCode');
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
    }

    protected updateDiagnostics(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]): void {
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    protected clearDiagnostics(document: vscode.TextDocument): void {
        this.diagnosticCollection.delete(document.uri);
    }
}