/**
 * Interface for logging
 */
export interface ILogger {
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
}
/**
 * Log level enumeration
 */
export declare enum LogLevel {
    Debug = 0,
    Info = 1,
    Warning = 2,
    Error = 3,
    None = 4
}
