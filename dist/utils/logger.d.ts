/**
 * Log levels
 */
export declare enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3,
    Off = 4
}
/**
 * Logger class for consistent logging
 */
export declare class Logger {
    private static instance;
    private outputChannel;
    private logLevel;
    /**
     * Create a new Logger instance
     */
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(): Logger;
    /**
     * Set the log level
     */
    setLogLevel(level: LogLevel): void;
    /**
     * Log a debug message
     */
    debug(message: string, ...args: any[]): void;
    /**
     * Log an info message
     */
    info(message: string, ...args: any[]): void;
    /**
     * Log a warning message
     */
    warn(message: string, ...args: any[]): void;
    /**
     * Log an error message
     */
    error(message: string, ...args: any[]): void;
    /**
     * Log a message with the specified level
     */
    log(level: LogLevel, message: string, ...args: any[]): void;
    /**
     * Show the output channel
     */
    show(): void;
    /**
     * Clear the log
     */
    clear(): void;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
