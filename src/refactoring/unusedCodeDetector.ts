import * as vscode from 'vscode';
import { UnusedCodeAnalyzer } from './codeAnalysis/UnusedCodeAnalyzer';
import { LoggerImpl } from '../utils/logger';

export class UnusedCodeDetector implements vscode.Disposable {
    private readonly analyzer: UnusedCodeAnalyzer;
    private readonly logger: LoggerImpl;

    constructor(context: vscode.ExtensionContext) {
        this.analyzer = new UnusedCodeAnalyzer();
        this.logger = new LoggerImpl();
        context.subscriptions.push(this);
    }

    /**
     * Analyzes the current file or selection to detect unused code
     */
    public async detectUnusedCode(editor: vscode.TextEditor): Promise<vscode.Diagnostic[]> {
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return [];
        }

        try {
            return await this.analyzer.analyze(editor.document, editor.selection);
        } catch (error) {
            this.logger.error('Error during unused code detection:', error);
            vscode.window.showErrorMessage(`Error analyzing file: ${error}`);
            return [];
        }
    }

    /**
     * Remove all unused code from the current document
     */
    public async removeUnusedCode(editor: vscode.TextEditor): Promise<void> {
        const diagnostics = await this.detectUnusedCode(editor);
        if (!diagnostics.length) {return;}

        const edit = new vscode.WorkspaceEdit();
        // Apply deletions in reverse order to avoid position shifting
        for (const diagnostic of [...diagnostics].reverse()) {
            edit.delete(editor.document.uri, diagnostic.range);
        }

        await vscode.workspace.applyEdit(edit);
    }

    public dispose(): void {
        this.analyzer.dispose();
    }
}
