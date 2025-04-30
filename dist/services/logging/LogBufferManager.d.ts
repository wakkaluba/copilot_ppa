import { EventEmitter } from 'events';
import { LogEntry, LogLevel } from '../../types/logging';
/**
 * Manages in-memory log entries and provides efficient storage and retrieval
 */
export declare class LogBufferManager extends EventEmitter {
    private entries;
    private maxEntries;
    /**
     * Add a log entry to the buffer
     */
    addEntry(entry: LogEntry): void;
    /**
     * Get all log entries
     */
    getEntries(): LogEntry[];
    /**
     * Get entries filtered by log level
     */
    getEntriesByLevel(level: LogLevel): LogEntry[];
    /**
     * Get count of entries, optionally filtered by level
     */
    getCount(level?: LogLevel): number;
    /**
     * Clear all entries
     */
    clear(): void;
    /**
     * Set maximum number of entries to keep in memory
     */
    setMaxEntries(max: number): void;
    /**
     * Get the current max entries setting
     */
    getMaxEntries(): number;
    /**
     * Search entries by text
     */
    search(text: string): LogEntry[];
}
