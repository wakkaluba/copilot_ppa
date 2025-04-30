import * as vscode from 'vscode';
/**
 * Logging service for the extension
 * Provides consistent logging across the extension with multiple log levels
 */
export declare class LoggingService implements vscode.Disposable {
    private outputChannel;
    private extensionName;
    /**
     * Creates a new logging service
     * @param extensionName The name of the extension for the output channel
     */
    constructor(extensionName: string);
    /**
     * Log an informational message
     * @param message The message to log
     */
    log(message: string): void;
    /**
     * Log a debug message
     * @param message The message to log
     */
    debug(message: string): void;
    /**
     * Log a warning message
     * @param message The warning message
     */
    warn(message: string): void;
    /**
     * Log an error message with optional Error object
     * @param message The error message
     * @param error Optional Error object
     */
    error(message: string, error?: Error | unknown): void;
    /**
     * Internal method to format and log a message with the specified level
     * @param level The log level
     * @param message The message to log
     */
    private logWithLevel;
    /**
     * Show the output channel
     */
    show(): void;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
