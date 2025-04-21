import * as vscode from 'vscode';

export class Logger {
    private outputChannel: vscode.OutputChannel;

    constructor(private readonly scope: string) {
        this.outputChannel = vscode.window.createOutputChannel(`Copilot PPA - ${scope}`);
    }

    info(message: string, ...args: any[]): void {
        this.log('INFO', message, ...args);
    }

    error(message: string, ...args: any[]): void {
        this.log('ERROR', message, ...args);
        const error = args[0];
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`${message}: ${error.message}`);
        }
    }

    private log(level: string, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level}] ${message}`;
        
        if (args.length > 0) {
            logMessage += '\n' + args
                .map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)
                .join('\n');
        }

        this.outputChannel.appendLine(logMessage);
    }

    dispose(): void {
        this.outputChannel.dispose();
    }
}