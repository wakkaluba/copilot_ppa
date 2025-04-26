/**
 * Interface for logger implementations in the application
 */
export interface ILogger {
    /**
     * Log a debug message
     * @param message The message to log
     * @param details Optional details to include with the log
     */
    debug(message: string, details?: unknown): void;
    
    /**
     * Log an info message
     * @param message The message to log
     * @param details Optional details to include with the log
     */
    info(message: string, details?: unknown): void;
    
    /**
     * Log a warning message
     * @param message The message to log
     * @param details Optional details to include with the log
     */
    warn(message: string, details?: unknown): void;
    
    /**
     * Log an error message
     * @param message The message to log
     * @param details Optional details to include with the log
     */
    error(message: string, details?: unknown): void;
}