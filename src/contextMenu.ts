import * as vscode from 'vscode';

export class ContextMenuManager {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.explainCode', this.explainCodeHandler),
            vscode.commands.registerCommand('copilot-ppa.improveCode', this.improveCodeHandler),
            vscode.commands.registerCommand('copilot-ppa.generateTests', this.generateTestsHandler)
        );
    }

    private async explainCodeHandler(uri: vscode.Uri) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const selection = editor.selection;
        const text = editor.document.getText(selection);
        // TODO: Send to LLM for explanation
    }

    private async improveCodeHandler(uri: vscode.Uri) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const selection = editor.selection;
        const text = editor.document.getText(selection);
        // TODO: Send to LLM for improvement suggestions
    }

    private async generateTestsHandler(uri: vscode.Uri) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const selection = editor.selection;
        const text = editor.document.getText(selection);
        // TODO: Send to LLM for test generation
    }
}
