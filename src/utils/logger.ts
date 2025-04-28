import * as vscode from 'vscode';

export class Logger {
    private static instance: Logger;
    private outputChannel: vscode.OutputChannel;

    constructor(private readonly scope: string) {
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger('Global');
        }
        return Logger.instance;
    }

    public debug(message: string, data?: any): void {
        this.log('DEBUG', message, data);
    }

    public info(message: string, data?: any): void {
        this.log('INFO', message, data);
    }

    public warn(message: string, data?: any): void {
        this.log('WARN', message, data);
    }

    public error(message: string, data?: any): void {
        this.log('ERROR', message, data);
    }

    private log(level: string, message: string, data?: any): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] [${this.scope}] ${message}`;
        
        if (data) {
            this.outputChannel.appendLine(`${logMessage}\n${JSON.stringify(data, null, 2)}`);
        } else {
            this.outputChannel.appendLine(logMessage);
        }
    }

    public dispose(): void {
        this.outputChannel.dispose();
    }
}