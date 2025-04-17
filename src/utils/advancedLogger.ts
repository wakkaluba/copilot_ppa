import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Log levels
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
    timestamp: number;
    level: LogLevel;
    message: string;
    source?: string;
    context?: any;
}

/**
 * Advanced logger with memory and file support
 */
export class AdvancedLogger {
    private static instance: AdvancedLogger;
    private logLevel: LogLevel = LogLevel.INFO;
    private inMemoryLogs: LogEntry[] = [];
    private maxInMemoryLogs: number = 10000;
    private outputChannel: vscode.OutputChannel;
    
    // File logging
    private fileLoggingEnabled: boolean = false;
    private logFilePath: string | null = null;
    private maxLogSizeMB: number = 5;
    private maxLogFiles: number = 3;
    private logFileStream: fs.WriteStream | null = null;
    
    // Listeners
    private onLogListeners: ((entry: LogEntry) => void)[] = [];
    
    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
        
        // Initialize from configuration
        this.updateFromConfig();
    }
    
    /**
     * Get logger instance (singleton)
     */
    public static getInstance(): AdvancedLogger {
        if (!AdvancedLogger.instance) {
            AdvancedLogger.instance = new AdvancedLogger();
        }
        return AdvancedLogger.instance;
    }
    
    /**
     * Update settings from VS Code configuration
     */
    public updateFromConfig(): void {
        const config = vscode.workspace.getConfiguration('copilot-ppa.logger');
        
        // Set log level
        const configLevel = config.get<string>('level', 'info');
        switch (configLevel.toLowerCase()) {
            case 'debug':
                this.logLevel = LogLevel.DEBUG;
                break;
            case 'info':
                this.logLevel = LogLevel.INFO;
                break;
            case 'warn':
            case 'warning':
                this.logLevel = LogLevel.WARN;
                break;
            case 'error':
                this.logLevel = LogLevel.ERROR;
                break;
            default:
                this.logLevel = LogLevel.INFO;
        }
        
        // Configure file logging
        const fileLoggingEnabled = config.get<boolean>('logToFile', false);
        if (fileLoggingEnabled) {
            const logFilePath = config.get<string>('logFilePath', '');
            const maxLogSizeMB = config.get<number>('maxSize', 5);
            const maxLogFiles = config.get<number>('maxFiles', 3);
            
            this.enableFileLogging(logFilePath, maxLogSizeMB, maxLogFiles);
        } else {
            this.disableFileLogging();
        }
        
        // Set max in-memory logs
        this.maxInMemoryLogs = config.get<number>('maxInMemoryLogs', 10000);
    }
    
    /**
     * Set log level
     */
    public setLogLevel(level: LogLevel | string): void {
        if (typeof level === 'string') {
            switch (level.toLowerCase()) {
                case 'debug':
                    this.logLevel = LogLevel.DEBUG;
                    break;
                case 'info':
                    this.logLevel = LogLevel.INFO;
                    break;
                case 'warn':
                case 'warning':
                    this.logLevel = LogLevel.WARN;
                    break;
                case 'error':
                    this.logLevel = LogLevel.ERROR;
                    break;
                default:
                    this.logLevel = LogLevel.INFO;
            }
        } else {
            this.logLevel = level;
        }
    }
    
    /**
     * Enable file logging
     */
    public enableFileLogging(filePath: string = '', maxSizeMB: number = 5, maxFiles: number = 3): void {
        // Close existing stream if any
        this.disableFileLogging();
        
        this.fileLoggingEnabled = true;
        this.maxLogSizeMB = maxSizeMB;
        this.maxLogFiles = maxFiles;
        
        try {
            // If no path is provided, use default location
            if (!filePath) {
                const extensionContext = global.__extensionContext;
                if (extensionContext) {
                    const logDir = path.join(extensionContext.logUri.fsPath);
                    filePath = path.join(logDir, 'copilot-ppa.log');
                    
                    // Ensure directory exists
                    if (!fs.existsSync(logDir)) {
                        fs.mkdirSync(logDir, { recursive: true });
                    }
                } else {
                    // Fallback to temp directory
                    filePath = path.join(os.tmpdir(), 'copilot-ppa.log');
                }
            }
            
            this.logFilePath = filePath;
            
            // Create log directory if it doesn't exist
            const logDir = path.dirname(filePath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            
            // Open file stream for appending
            this.logFileStream = fs.createWriteStream(filePath, { flags: 'a' });
            
            // Check if rotation is needed
            this.checkRotation();
            
            this.info(`File logging enabled: ${filePath}`, {}, 'AdvancedLogger');
        } catch (error) {
            this.fileLoggingEnabled = false;
            this.logFilePath = null;
            this.logFileStream = null;
            
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.error(`Failed to enable file logging: ${errorMsg}`, {}, 'AdvancedLogger');
        }
    }
    
    /**
     * Disable file logging
     */
    public disableFileLogging(): void {
        if (this.logFileStream) {
            this.logFileStream.end();
            this.logFileStream = null;
        }
        
        this.fileLoggingEnabled = false;
    }
    
    /**
     * Check if file logging is enabled
     */
    public isFileLoggingEnabled(): boolean {
        return this.fileLoggingEnabled;
    }
    
    /**
     * Get log file path
     */
    public getLogFilePath(): string | null {
        return this.logFilePath;
    }
    
    /**
     * Check if log file rotation is needed
     */
    private checkRotation(): void {
        if (!this.fileLoggingEnabled || !this.logFilePath) return;
        
        try {
            const stats = fs.statSync(this.logFilePath);
            const fileSizeMB = stats.size / (1024 * 1024);
            
            if (fileSizeMB >= this.maxLogSizeMB) {
                this.rotateLogFiles();
            }
        } catch (error) {
            // File doesn't exist yet, no rotation needed
        }
    }
    
    /**
     * Rotate log files
     */
    private rotateLogFiles(): void {
        if (!this.fileLoggingEnabled || !this.logFilePath) return;
        
        try {
            // Close current stream
            if (this.logFileStream) {
                this.logFileStream.end();
                this.logFileStream = null;
            }
            
            // Rotate files
            for (let i = this.maxLogFiles - 1; i > 0; i--) {
                const oldPath = `${this.logFilePath}.${i - 1}`;
                const newPath = `${this.logFilePath}.${i}`;
                
                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, newPath);
                }
            }
            
            // Rename current log file
            if (fs.existsSync(this.logFilePath)) {
                fs.renameSync(this.logFilePath, `${this.logFilePath}.1`);
            }
            
            // Create new log file
            this.logFileStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
            
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.error(`Failed to rotate log files: ${errorMsg}`, {}, 'AdvancedLogger');
        }
    }
    
    /**
     * Log a debug message
     */
    public debug(message: string, context: any = {}, source?: string): void {
        this.log(LogLevel.DEBUG, message, context, source);
    }
    
    /**
     * Log an info message
     */
    public info(message: string, context: any = {}, source?: string): void {
        this.log(LogLevel.INFO, message, context, source);
    }
    
    /**
     * Log a warning message
     */
    public warn(message: string, context: any = {}, source?: string): void {
        this.log(LogLevel.WARN, message, context, source);
    }
    
    /**
     * Log an error message
     */
    public error(message: string, context: any = {}, source?: string): void {
        this.log(LogLevel.ERROR, message, context, source);
    }
    
    /**
     * Log a message
     */
    public log(level: LogLevel, message: string, context: any = {}, source?: string): void {
        // Skip if level is below current log level
        if (level < this.logLevel) return;
        
        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            message,
            source,
            context
        };
        
        // Add to in-memory logs
        this.inMemoryLogs.push(entry);
        
        // Trim in-memory logs if needed
        if (this.inMemoryLogs.length > this.maxInMemoryLogs) {
            this.inMemoryLogs = this.inMemoryLogs.slice(-this.maxInMemoryLogs);
        }
        
        // Log to VS Code output channel
        const levelPrefix = this.getLevelPrefix(level);
        const sourcePrefix = source ? `[${source}] ` : '';
        const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
        
        this.outputChannel.appendLine(`${levelPrefix} ${sourcePrefix}${message}${contextStr}`);
        
        // Log to file if enabled
        if (this.fileLoggingEnabled && this.logFileStream) {
            const timestamp = new Date().toISOString();
            const fileEntry = `${timestamp} ${levelPrefix} ${sourcePrefix}${message}${contextStr}\n`;
            
            this.logFileStream.write(fileEntry);
            
            // Check if rotation is needed
            this.checkRotation();
        }
        
        // Notify listeners
        this.onLogListeners.forEach(listener => {
            try {
                listener(entry);
            } catch (error) {
                // Ignore listener errors
            }
        });
    }
    
    /**
     * Get level prefix
     */
    private getLevelPrefix(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG:
                return '[DEBUG]';
            case LogLevel.INFO:
                return '[INFO ]';
            case LogLevel.WARN:
                return '[WARN ]';
            case LogLevel.ERROR:
                return '[ERROR]';
            default:
                return '[INFO ]';
        }
    }
    
    /**
     * Get all logs
     */
    public getLogs(): LogEntry[] {
        return [...this.inMemoryLogs];
    }
    
    /**
     * Clear all in-memory logs
     */
    public clearLogs(): void {
        this.inMemoryLogs = [];
    }
    
    /**
     * Add log listener
     */
    public addLogListener(listener: (entry: LogEntry) => void): void {
        this.onLogListeners.push(listener);
    }
    
    /**
     * Remove log listener
     */
    public removeLogListener(listener: (entry: LogEntry) => void): void {
        const index = this.onLogListeners.indexOf(listener);
        if (index !== -1) {
            this.onLogListeners.splice(index, 1);
        }
    }
    
    /**
     * Show the output channel
     */
    public showOutputChannel(): void {
        this.outputChannel.show();
    }
    
    /**
     * Get the count of log entries
     */
    public getEntryCount(level?: LogLevel): number {
        if (level === undefined) {
            return this.inMemoryLogs.length;
        }
        
        return this.inMemoryLogs.filter(entry => entry.level === level).length;
    }
}
