// filepath: d:\___coding\tools\copilot_ppa\src\codeTools\services\RefactoringOutputService.js
const vscode = require('vscode');

/**
 * Service to handle output for refactoring operations
 */
class RefactoringOutputService {
    /**
     * Create a new RefactoringOutputService
     */
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Code Refactoring');
    }

    /**
     * Start a new operation with a message
     * @param {string} message Operation message
     */
    startOperation(message) {
        this.outputChannel.clear();
        this.outputChannel.appendLine(`[${new Date().toLocaleString()}] ${message}`);
        this.outputChannel.show();
    }

    /**
     * Log an informational message
     * @param {string} message Information message
     * @param {string|string[]} [details] Optional details to display indented below the message
     */
    logInfo(message, details) {
        this.outputChannel.appendLine(`ℹ️ ${message}`);
        this.logDetails(details);
    }

    /**
     * Log a warning message
     * @param {string} message Warning message
     * @param {string|string[]} [details] Optional details to display indented below the message
     */
    logWarning(message, details) {
        this.outputChannel.appendLine(`⚠️ ${message}`);
        this.logDetails(details);
    }

    /**
     * Log a success message
     * @param {string} message Success message
     * @param {string|string[]} [details] Optional details to display indented below the message
     */
    logSuccess(message, details) {
        this.outputChannel.appendLine(`✅ ${message}`);
        this.logDetails(details);
    }

    /**
     * Log an error message
     * @param {string} message Error message
     * @param {any} [error] Error object or details
     */
    logError(message, error) {
        this.outputChannel.appendLine(`❌ ${message}`);
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
     * Directly append a line to the output channel
     * @param {string} line Line to append
     */
    appendLine(line) {
        this.outputChannel.appendLine(line);
    }

    /**
     * Log details indented under a message
     * @param {string|string[]} [details] String or array of strings to log as details
     * @private
     */
    logDetails(details) {
        if (!details) return;

        if (Array.isArray(details)) {
            details.forEach(detail => {
                this.outputChannel.appendLine(`   ${detail}`);
            });
        } else {
            this.outputChannel.appendLine(`   ${details}`);
        }
    }

    /**
     * Dispose the output channel
     */
    dispose() {
        this.outputChannel.dispose();
    }
}

module.exports = { RefactoringOutputService };
