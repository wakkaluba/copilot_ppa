import * as vscode from 'vscode';

/**
 * Log levels
 */
export enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3,
    Off = 4
}

/**
 * Logger class for consistent logging
 */
export class Logger {
    private static instance: Logger;
    private outputChannel: vscode.OutputChannel;
    private logLevel: LogLevel = LogLevel.Info;

    /**
     * Create a new Logger instance
     */
    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Set the log level
     */
    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    /**
     * Log a debug message
     */
    public debug(message: string, ...args: any[]): void {
        this.log(LogLevel.Debug, message, ...args);
    }

    /**
     * Log an info message
     */
    public info(message: string, ...args: any[]): void {
        this.log(LogLevel.Info, message, ...args);
    }

    /**
     * Log a warning message
     */
    public warn(message: string, ...args: any[]): void {
        this.log(LogLevel.Warn, message, ...args);
    }

    /**
     * Log an error message
     */
    public error(message: string, ...args: any[]): void {
        this.log(LogLevel.Error, message, ...args);
    }

    /**
     * Log a message with the specified level
     */
    public log(level: LogLevel, message: string, ...args: any[]): void {
        if (level < this.logLevel) {
            return;
        }

        const timestamp = new Date().toISOString();
        const levelStr = LogLevel[level].toUpperCase();
        let formattedMessage = `[${timestamp}] [${levelStr}] ${message}`;

        if (args.length > 0) {
            formattedMessage += ' ' + args
                .map(arg => {
                    if (arg === null) return 'null';
                    if (arg === undefined) return 'undefined';
                    
                    if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg);
                        } catch (e) {
                            return String(arg);
                        }
                    }
                    return String(arg);
                })
                .join(' ');
        }

        try {
            this.outputChannel.appendLine(formattedMessage);
        } catch (e) {
            console.error('Error writing to output channel:', e);
        }

        // Also log to console for development
        if (level === LogLevel.Error) {
            console.error(formattedMessage);
        } else if (level === LogLevel.Warn) {
            console.warn(formattedMessage);
        } else if (level === LogLevel.Info) {
            console.info(formattedMessage);
        } else {
            console.log(formattedMessage);
        }
    }

    /**
     * Show the output channel
     */
    public show(): void {
        this.outputChannel.show();
    }

    /**
     * Clear the log
     */
    public clear(): void {
        this.outputChannel.clear();
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.outputChannel.dispose();
    }
}