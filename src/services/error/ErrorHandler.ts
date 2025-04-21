import * as vscode from 'vscode';

export class ErrorHandler {
    private readonly outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
    }

    handle(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.outputChannel.appendLine(`${message}: ${errorMessage}`);
        this.outputChannel.appendLine(`Stack: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
    }

    dispose(): void {
        this.outputChannel.dispose();
    }
}