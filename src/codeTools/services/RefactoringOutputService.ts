import * as vscode from 'vscode';

/**
 * Service to handle output for refactoring operations
 */
export class RefactoringOutputService implements vscode.Disposable {
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
     * Log an informational message
     * @param message Information message
     * @param details Optional details to display indented below the message
     */
    public logInfo(message: string, details?: string | string[] | object): void {
        this.outputChannel.appendLine(`\u2139\ufe0f ${message}`);
        this.logDetails(details);
    }

    /**
     * Log a warning message
     * @param message Warning message
     * @param details Optional details to display indented below the message
     */
    public logWarning(message: string, details?: string | string[] | object): void {
        this.outputChannel.appendLine(`\u26a0\ufe0f ${message}`);
        this.logDetails(details);
    }

    /**
     * Log a success message
     * @param message Success message
     * @param details Optional details to display indented below the message
     */
    public logSuccess(message: string, details?: string | string[] | object): void {
        this.outputChannel.appendLine(`\u2705 ${message}`);
        this.logDetails(details);
    }

    /**
     * Log an error message
     * @param message Error message
     * @param error Error object or details
     */
    public logError(message: string, error?: any): void {
        this.outputChannel.appendLine(`\u274c ${message}`);
        if (error) {
            if (error instanceof Error) {
                this.outputChannel.appendLine(`   ${error.message}`);
                if (error.stack) {
                    this.outputChannel.appendLine(`   ${error.stack}`);
                }
            } else if (typeof error === 'string') {
                this.outputChannel.appendLine(`   ${error}`);
            } else if (typeof error.toString === 'function') {
                this.outputChannel.appendLine(`   ${error.toString()}`);
            } else {
                this.outputChannel.appendLine(`   ${JSON.stringify(error)}`);
            }
        }
    }

    /**
     * Log an operation progress message
     * @param message Operation message
     */
    public logOperation(message: string): void {
        this.outputChannel.appendLine(`[Operation] ${message}`);
    }

    /**
     * Directly append a line to the output channel
     * @param line Line to append
     */
    public appendLine(line: string): void {
        this.outputChannel.appendLine(line);
    }

    /**
     * Log details indented under a message
     * @param details String, array of strings, or object to log as details
     */
    private logDetails(details?: string | string[] | object): void {
        if (!details) return;

        if (Array.isArray(details)) {
            details.forEach(detail => {
                this.outputChannel.appendLine(`   ${detail}`);
            });
        } else if (typeof details === 'string') {
            this.outputChannel.appendLine(`   ${details}`);
        } else if (typeof details === 'object') {
            this.outputChannel.appendLine('  Details:');
            Object.entries(details).forEach(([key, value]) => {
                this.outputChannel.appendLine(`    ${key}: ${value}`);
            });
        }
    }

    public dispose(): void {
        this.outputChannel.dispose();
    }
}
