import * as vscode from 'vscode';

/**
 * Service to handle output for refactoring operations
 */
export class RefactoringOutputService {
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Code Refactoring');
    }

    /**
     * Start a new operation with a message
     * @param message Operation message
     */
    public startOperation(message: string): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine(`[${new Date().toLocaleString()}] ${message}`);
        this.outputChannel.show();
    }

    /**
     * Log a success message
     * @param message Success message
     */
    public logSuccess(message: string): void {
        this.outputChannel.appendLine(`✅ ${message}`);
    }

    /**
     * Log an error message
     * @param message Error message
     * @param error Error object
     */
    public logError(message: string, error?: any): void {
        this.outputChannel.appendLine(`❌ ${message}`);
        if (error) {
            if (error instanceof Error) {
                this.outputChannel.appendLine(`   ${error.message}`);
                if (error.stack) {
                    this.outputChannel.appendLine(`   ${error.stack}`);
                }
            } else {
                this.outputChannel.appendLine(`   ${String(error)}`);
            }
        }
    }
}
