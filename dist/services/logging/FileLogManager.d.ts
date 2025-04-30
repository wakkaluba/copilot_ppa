import { EventEmitter } from 'events';
import { LogEntry, LogStorageConfig } from '../../types/logging';
/**
 * Manages file-based logging operations
 */
export declare class FileLogManager extends EventEmitter {
    private enabled;
    private currentPath;
    private logStream;
    private config;
    /**
     * Initialize the file manager with configuration
     */
    initialize(config: LogStorageConfig): void;
    /**
     * Disable file logging and clean up
     */
    disable(): void;
    /**
     * Write a log entry to the current log file
     */
    writeEntry(entry: LogEntry): void;
    /**
     * Check if the current log file needs rotation
     */
    private checkRotation;
    /**
     * Rotate log files
     */
    private rotateLogFiles;
    /**
     * Helper to ensure unknown errors are converted to Error objects
     */
    private emitError;
    /**
     * Handle stream errors
     */
    private handleStreamError;
    /**
     * Format a log entry for file output
     */
    private formatEntryForFile;
    /**
     * Format level string to fixed width
     */
    private formatLevel;
    /**
     * Check if file logging is enabled
     */
    isEnabled(): boolean;
    /**
     * Get the current log file path
     */
    getCurrentPath(): string | null;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
