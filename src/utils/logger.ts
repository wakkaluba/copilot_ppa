import * as vscode from 'vscode';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export class Logger {
    private static instance: Logger;
    private outputChannel: vscode.OutputChannel;
    private currentLogLevel: LogLevel = LogLevel.INFO;

    private constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public static getInstance(outputChannel?: vscode.OutputChannel): Logger {
        if (!Logger.instance && outputChannel) {
            Logger.instance = new Logger(outputChannel);
        }
        
        if (!Logger.instance) {
            throw new Error("Logger not initialized. Provide outputChannel when getting instance for the first time.");
        }
        
        return Logger.instance;
    }

    public setLogLevel(level: LogLevel): void {
        this.currentLogLevel = level;
    }

    public debug(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    public info(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, context);
    }

    public warn(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, context);
    }

    public error(message: string, error?: Error, context?: Record<string, unknown>): void {
        const errorContext = error ? { 
            ...context, 
            error: error.message,
            stack: error.stack 
        } : context;
        
        this.log(LogLevel.ERROR, message, errorContext);
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        if (level < this.currentLogLevel) {
            return;
        }
        
        const timestamp = new Date().toISOString();
        const levelName = LogLevel[level];
        
        let logMessage = `[${timestamp}] [${levelName}] ${message}`;
        
        if (context) {
            try {
                logMessage += `\nContext: ${JSON.stringify(context)}`;
            } catch (e) {
                logMessage += '\nContext: [Cannot stringify context]';
            }
        }
        
        this.outputChannel.appendLine(logMessage);
        
        // Also log errors to console during development
        if (level === LogLevel.ERROR) {
            console.error(message, context);
        }
    }
}