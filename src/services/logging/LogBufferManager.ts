import { EventEmitter } from 'events';
import { LogEntry, LogLevel } from '../../types/logging';

/**
 * Manages in-memory log entries and provides efficient storage and retrieval
 */
export class LogBufferManager extends EventEmitter {
    private entries: LogEntry[] = [];
    private maxEntries: number = 10000;

    /**
     * Add a log entry to the buffer
     */
    public addEntry(entry: LogEntry): void {
        this.entries.push(entry);
        
        // If we've reached capacity, remove oldest entries
        if (this.entries.length > this.maxEntries) {
            this.entries.shift();
            this.emit('overflow');
        }
    }

    /**
     * Get all log entries
     */
    public getEntries(): LogEntry[] {
        return [...this.entries]; // Return a copy to avoid direct modification
    }

    /**
     * Get entries filtered by log level
     */
    public getEntriesByLevel(level: LogLevel): LogEntry[] {
        return this.entries.filter(entry => entry.level === level);
    }

    /**
     * Get count of entries, optionally filtered by level
     */
    public getCount(level?: LogLevel): number {
        if (level === undefined) {
            return this.entries.length;
        }
        return this.entries.filter(entry => entry.level === level).length;
    }

    /**
     * Clear all entries
     */
    public clear(): void {
        this.entries = [];
    }

    /**
     * Set maximum number of entries to keep in memory
     */
    public setMaxEntries(max: number): void {
        if (max <= 0) {
            throw new Error('Max entries must be greater than 0');
        }
        
        this.maxEntries = max;
        
        // If current entries exceed new max, trim the buffer
        if (this.entries.length > this.maxEntries) {
            const diff = this.entries.length - this.maxEntries;
            this.entries.splice(0, diff);
            this.emit('overflow');
        }
    }

    /**
     * Get the current max entries setting
     */
    public getMaxEntries(): number {
        return this.maxEntries;
    }

    /**
     * Search entries by text
     */
    public search(text: string): LogEntry[] {
        const lowerText = text.toLowerCase();
        return this.entries.filter(entry => 
            entry.message.toLowerCase().includes(lowerText) ||
            (entry.source && entry.source.toLowerCase().includes(lowerText))
        );
    }
}