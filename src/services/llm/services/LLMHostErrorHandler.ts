import * as vscode from 'vscode';
import { HostProcessInfo } from '../interfaces/HostTypes';

export class LLMHostErrorHandler {
    constructor(private outputChannel: vscode.OutputChannel) {}

    public handleProcessError(error: Error, info: HostProcessInfo): void {
        this.logError('Process Error', error, info);
        this.showErrorNotification(`LLM Host Process Error: ${error.message}`);
    }

    public handleStartError(error: Error): void {
        this.logError('Start Error', error);
        this.showErrorNotification(`Failed to start LLM Host: ${error.message}`);
    }

    public handleStopError(error: Error): void {
        this.logError('Stop Error', error);
        this.showErrorNotification(`Failed to stop LLM Host: ${error.message}`);
    }

    public handleRestartError(error: Error): void {
        this.logError('Restart Error', error);
        this.showErrorNotification(`Failed to restart LLM Host: ${error.message}`);
    }

    public handleHealthWarning(message: string, metrics: any): void {
        this.outputChannel.appendLine(`[WARNING] Health: ${message}`);
        this.outputChannel.appendLine(`Metrics: ${JSON.stringify(metrics, null, 2)}`);
    }

    public handleHealthCritical(error: Error, metrics: any): void {
        this.logError('Critical Health Error', error, metrics);
        this.showErrorNotification(`LLM Host Health Critical: ${error.message}`);
    }

    private logError(type: string, error: Error, context?: any): void {
        this.outputChannel.appendLine(`[ERROR] ${type}:`);
        this.outputChannel.appendLine(error.stack || error.message);
        if (context) {
            this.outputChannel.appendLine(`Context: ${JSON.stringify(context, null, 2)}`);
        }
    }

    private showErrorNotification(message: string): void {
        vscode.window.showErrorMessage(message);
    }
}
