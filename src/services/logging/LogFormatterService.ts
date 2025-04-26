import { LogEntry, LogLevel } from '../../types/logging';

/**
 * Service for formatting log entries for different outputs
 */
export class LogFormatterService {
    /**
     * Create a new log entry
     */
    public createEntry(
        level: LogLevel,
        message: string,
        context: Record<string, unknown> = {},
        source?: string
    ): LogEntry {
        // Return with correct typing to satisfy exactOptionalPropertyTypes
        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            message,
            context
        };
        
        // Only set source if it's provided
        if (source !== undefined) {
            entry.source = source;
        }
        
        return entry;
    }

    /**
     * Format an entry for display in VS Code output channel
     */
    public formatForDisplay(entry: LogEntry): string {
        const timestamp = new Date(entry.timestamp).toISOString();
        const level = this.formatLevel(entry.level);
        const source = entry.source ? `[${entry.source}] ` : '';
        let result = `[${timestamp}] [${level}] ${source}${entry.message}`;
        
        // Add context if any
        if (entry.context && Object.keys(entry.context).length > 0) {
            try {
                result += `\n${JSON.stringify(entry.context, null, 2)}`;
            } catch (e) {
                result += `\nContext: [Not serializable]`;
            }
        }
        
        return result;
    }

    /**
     * Format an entry for JSON serialization
     */
    public formatForJson(entry: LogEntry): string {
        return JSON.stringify(entry);
    }

    /**
     * Format log level with fixed width padding
     */
    private formatLevel(level: LogLevel): string {
        const levelMap: Record<LogLevel, string> = {
            [LogLevel.DEBUG]: 'DEBUG',
            [LogLevel.INFO]: 'INFO ',
            [LogLevel.WARN]: 'WARN ',
            [LogLevel.ERROR]: 'ERROR'
        };
        
        return levelMap[level] || 'UNKN ';
    }
}