import * as vscode from 'vscode';
export declare class SecurityDiagnosticService {
    private readonly diagnosticCollection;
    constructor(context: vscode.ExtensionContext);
    report(uri: vscode.Uri, diagnostics: vscode.Diagnostic[]): void;
    clear(uri?: vscode.Uri): void;
    dispose(): void;
}
