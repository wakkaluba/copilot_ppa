import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Log level enum
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

/**
 * Log entry interface
 */
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    details?: any;
}

/**
 * Logger class for Copilot PPA extension
 */
export class Logger {
    private _outputChannel: vscode.OutputChannel;
    private _logLevel: LogLevel;
    private _logToFile: boolean;
    private _logFilePath: string;
    private _logEntries: LogEntry[] = [];
    private _maxInMemoryLogs: number;
    
    constructor() {
        this._outputChannel = vscode.window.createOutputChannel('Copilot PPA');
        
        // Read configuration
        const config = vscode.workspace.getConfiguration('copilot-ppa.logger');
        
        // Set log level
        const levelString = config.get<string>('level', 'info');
        this._logLevel = this.stringToLogLevel(levelString);
        
        // File logging settings
        this._logToFile = config.get<boolean>('logToFile', false);
        let logFilePath = config.get<string>('logFilePath', '');
        
        if (this._logToFile && !logFilePath) {
            // Use default location if not specified
            const logsFolder = path.join(os.homedir(), '.copilot-ppa', 'logs');
            
            // Ensure logs directory exists
            if (!fs.existsSync(logsFolder)) {
                fs.mkdirSync(logsFolder, { recursive: true });
            }
            
            // Create log file name with timestamp
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            logFilePath = path.join(logsFolder, `copilot-ppa-${timestamp}.log`);
        }
        
        this._logFilePath = logFilePath;
        this._maxInMemoryLogs = config.get<number>('maxInMemoryLogs', 10000);
        
        // Log initialization
        this.info(`Logger initialized with level ${levelString}`);
        if (this._logToFile) {
            this.info(`Logging to file: ${this._logFilePath}`);
        }
    }
    
    /**
     * Log a debug message
     */
    public debug(message: string, details?: any): void {
        this.log(LogLevel.DEBUG, message, details);
    }
    
    /**
     * Log an info message
     */
    public info(message: string, details?: any): void {
        this.log(LogLevel.INFO, message, details);
    }
    
    /**
     * Log a warning message
     */
    public warn(message: string, details?: any): void {
        this.log(LogLevel.WARN, message, details);
    }
    
    /**
     * Log an error message
     */
    public error(message: string, details?: any): void {
        this.log(LogLevel.ERROR, message, details);
    }
    
    /**
     * Clear all logs
     */
    public clearLogs(): void {
        this._logEntries = [];
        this._outputChannel.clear();
        
        // Log the clearing action
        this.info('Logs cleared');
    }
    
    /**
     * Export logs to a file
     */
    public async exportLogs(filePath?: string): Promise<string> {
        try {
            // Use provided path or create a default one
            if (!filePath) {
                const timestamp = new Date().toISOString().replace(/:/g, '-');
                const downloadsFolder = path.join(os.homedir(), 'Downloads');
                filePath = path.join(downloadsFolder, `copilot-ppa-logs-${timestamp}.json`);
            }
            
            // Write logs to file
            const logData = JSON.stringify(this._logEntries, null, 2);
            fs.writeFileSync(filePath, logData);
            
            this.info(`Logs exported to ${filePath}`);
            return filePath;
        } catch (error) {
            this.error('Failed to export logs', error);
            throw error;
        }
    }
    
    /**
     * Get all log entries
     */
    public getLogEntries(): LogEntry[] {
        return [...this._logEntries];
    }
    
    /**
     * Show the output channel
     */
    public showOutputChannel(): void {
        this._outputChannel.show();
    }
    
    /**
     * Convert string to LogLevel enum
     */
    private stringToLogLevel(level: string): LogLevel {
        switch (level.toLowerCase()) {
            case 'debug':
                return LogLevel.DEBUG;
            case 'info':
                return LogLevel.INFO;
            case 'warn':
                return LogLevel.WARN;
            case 'error':
                return LogLevel.ERROR;
            default:
                return LogLevel.INFO;
        }
    }
    
    /**
     * Get log level name from enum
     */
    private logLevelToString(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG:
                return 'DEBUG';
            case LogLevel.INFO:
                return 'INFO';
            case LogLevel.WARN:
                return 'WARN';
            case LogLevel.ERROR:
                return 'ERROR';
            default:
                return 'UNKNOWN';
        }
    }
    
    /**
     * Internal log method
     */
    private log(level: LogLevel, message: string, details?: any): void {
        // Only log if level is greater than or equal to configured level
        if (level < this._logLevel) {
            return;
        }
        
        const timestamp = new Date().toISOString();
        const levelName = this.logLevelToString(level);
        
        // Format message for output
        let formattedMessage = `[${timestamp}] [${levelName}] ${message}`;
        if (details) {
            let detailsStr = '';
            
            // Properly format details based on type
            if (details instanceof Error) {
                detailsStr = details.stack || details.toString();
            } else if (typeof details === 'object') {
                try {
                    detailsStr = JSON.stringify(details, null, 2);
                } catch (e) {
                    detailsStr = String(details);
                }
            } else {
                detailsStr = String(details);
            }
            
            formattedMessage += `\n${detailsStr}`;
        }
        
        // Log to output channel
        this._outputChannel.appendLine(formattedMessage);
        
        // Create log entry
        const logEntry: LogEntry = {
            timestamp,
            level,
            message,
            details
        };
        
        // Add to in-memory logs
        this._logEntries.push(logEntry);
        
        // Cap the logs array to prevent memory issues
        if (this._logEntries.length > this._maxInMemoryLogs) {
            this._logEntries.shift();
        }
        
        // Log to file if enabled
        if (this._logToFile && this._logFilePath) {
            try {
                fs.appendFileSync(
                    this._logFilePath, 
                    `${formattedMessage}\n`
                );
            } catch (error) {
                // Log to output channel only to avoid recursion
                this._outputChannel.appendLine(`[ERROR] Failed to write to log file: ${error}`);
            }
        }
    }
}
