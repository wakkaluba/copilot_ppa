import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { LogEntry, LogLevel } from '../types/logging';

/**
 * Logger interface
 */
export interface Logger {
    debug(message: string, details?: unknown): void;
    info(message: string, details?: unknown): void;
    warn(message: string, details?: unknown): void;
    error(message: string, details?: unknown): void;
}

/**
 * Logger class for Copilot PPA extension
 */
export class LoggerImpl implements Logger {
    private static instance: LoggerImpl;
    private _outputChannel: vscode.OutputChannel;
    private _logLevel: LogLevel;
    private _logToFile: boolean;
    private _logFilePath: string;
    private _logEntries: LogEntry[] = [];
    private _maxInMemoryLogs: number;
    private _source: string = 'Logger'; // Added source property
    
    /**
     * Gets the singleton instance of the logger
     */
    public static getInstance(): LoggerImpl {
        if (!LoggerImpl.instance) {
            LoggerImpl.instance = new LoggerImpl();
        }
        return LoggerImpl.instance;
    }
    
    private constructor() {
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
     * Set the logging level
     * @param level The log level to set
     */
    public setLogLevel(level: LogLevel): void {
        this._logLevel = level;
    }

    /**
     * Log a debug message
     */
    public debug(message: string, details?: unknown): void {
        this.log(LogLevel.DEBUG, message, details as Error | undefined);
    }
    
    /**
     * Log an info message
     */
    public info(message: string, details?: unknown): void {
        this.log(LogLevel.INFO, message, details as Error | undefined);
    }
    
    /**
     * Log a warning message
     */
    public warn(message: string, details?: unknown): void {
        this.log(LogLevel.WARN, message, details as Error | undefined);
    }
    
    /**
     * Log an error message
     */
    public error(message: string, details?: unknown): void {
        this.log(LogLevel.ERROR, message, details as Error | undefined);
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
    private log(level: LogLevel, message: string, error?: Error): void {
        // Only log if level is greater than or equal to configured level
        if (level < this._logLevel) {
            return;
        }
        
        const timestamp = Date.now();
        const levelName = this.logLevelToString(level);
        
        // Format message for output
        const formattedTimestamp = new Date(timestamp).toISOString();
        let formattedMessage = `[${formattedTimestamp}] [${levelName}] ${message}`;
        let context: Record<string, unknown> | undefined;
        
        if (error) {
            let errorStr = '';
            
            // Properly format details based on type
            if (error instanceof Error) {
                errorStr = error.stack || error.toString();
                context = { error: error.message, stack: error.stack };
            } else if (typeof error === 'object') {
                try {
                    errorStr = JSON.stringify(error, null, 2);
                    context = error as Record<string, unknown>;
                } catch (e) {
                    errorStr = String(error);
                    context = { value: String(error) };
                }
            } else {
                errorStr = String(error);
                context = { value: errorStr };
            }
            
            formattedMessage += `\n${errorStr}`;
        }
        
        // Log to output channel
        this._outputChannel.appendLine(formattedMessage);
        
        // Create log entry using the standardized interface
        const logEntry: LogEntry = {
            timestamp: new Date(timestamp), // Use Date object as per the interface requirement
            level,
            message,
            context
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
    
    // Getter for source property
    get source(): string {
        return this._source;
    }

    /**
     * Get workspace folders
     * @returns Array of workspace folders
     */
    public getWorkspaceFolders(): readonly vscode.WorkspaceFolder[] | undefined {
        return vscode.workspace.workspaceFolders;
    }

    /**
     * Find files in the workspace matching a pattern
     * @param include glob pattern to match files
     * @param exclude glob pattern to exclude files
     * @param maxResults max number of results
     * @returns Array of found file URIs
     */
    public async findFiles(include: string, exclude?: string, maxResults?: number): Promise<vscode.Uri[]> {
        try {
            return await vscode.workspace.findFiles(include, exclude, maxResults);
        } catch (error) {
            this.error(`Error finding files with pattern ${include}:`, error);
            throw error;
        }
    }

    /**
     * Create a directory
     * @param uri The URI of the directory to create
     */
    public async createDirectory(uri: vscode.Uri): Promise<void> {
        try {
            await vscode.workspace.fs.createDirectory(uri);
        } catch (error) {
            this.error(`Error creating directory ${uri.fsPath}:`, error);
            throw error;
        }
    }

    /**
     * Get configuration value
     * @param section Configuration section
     * @param key Configuration key
     * @param defaultValue Default value if not found
     * @returns The configuration value or default value
     */
    public getConfiguration<T>(section: string, key: string, defaultValue?: T): T | undefined {
        const config = vscode.workspace.getConfiguration(section);
        if (defaultValue === undefined) {
            return config.get<T>(key);
        } else {
            return config.get<T>(key, defaultValue);
        }
    }

    /**
     * Update configuration value
     * @param section Configuration section
     * @param key Configuration key
     * @param value New value
     * @param target Configuration target (default: Workspace)
     */
    public async updateConfiguration(section: string, key: string, value: any, target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration(section);
            await config.update(key, value, target);
        } catch (error) {
            this.error(`Error updating configuration ${section}.${key}:`, error);
            throw error;
        }
    }
}

// Export the Logger interface as a namespace with a getInstance method
// This allows us to use Logger.getInstance() while maintaining the interface
export namespace Logger {
    export function getInstance(): Logger {
        return LoggerImpl.getInstance();
    }
}