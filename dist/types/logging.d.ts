/**
 * Log levels enum
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
/**
 * Log entry structure
 */
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, unknown>;
    additionalData?: any[];
}
