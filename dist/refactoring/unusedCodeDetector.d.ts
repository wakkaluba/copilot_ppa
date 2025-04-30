import * as vscode from 'vscode';
export declare class UnusedCodeDetector implements vscode.Disposable {
    private readonly analyzer;
    private readonly logger;
    constructor(context: vscode.ExtensionContext);
    /**
     * Analyzes the current file or selection to detect unused code
     */
    detectUnusedCode(editor: vscode.TextEditor): Promise<vscode.Diagnostic[]>;
    /**
     * Remove all unused code from the current document
     */
    removeUnusedCode(editor: vscode.TextEditor): Promise<void>;
    dispose(): void;
}
