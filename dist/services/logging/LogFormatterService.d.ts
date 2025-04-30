import { LogEntry, LogLevel } from '../../types/logging';
/**
 * Service for formatting log entries for different outputs
 */
export declare class LogFormatterService {
    /**
     * Create a new log entry
     */
    createEntry(level: LogLevel, message: string, context?: Record<string, unknown>, source?: string): LogEntry;
    /**
     * Format an entry for display in VS Code output channel
     */
    formatForDisplay(entry: LogEntry): string;
    /**
     * Format an entry for JSON serialization
     */
    formatForJson(entry: LogEntry): string;
    /**
     * Format log level with fixed width padding
     */
    private formatLevel;
}
