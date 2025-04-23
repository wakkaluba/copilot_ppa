import * as vscode from 'vscode';

export class SecurityDiagnosticService {
    private readonly diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('securityIssues');
        context.subscriptions.push(this.diagnosticCollection);
    }

    public report(uri: vscode.Uri, diagnostics: vscode.Diagnostic[]): void {
        this.diagnosticCollection.set(uri, diagnostics);
    }

    public clear(uri?: vscode.Uri): void {
        if (uri) {
            this.diagnosticCollection.delete(uri);
        } else {
            this.diagnosticCollection.clear();
        }
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
    }
}