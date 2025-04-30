import { LogLevel, LogEntry } from '../types/logging';
import { EventEmitter } from 'events';
/**
 * Advanced logger service with enhanced features, error handling, and storage options
 */
export declare class AdvancedLogger extends EventEmitter {
    private static instance;
    private readonly outputChannel;
    private readonly fileManager;
    private readonly bufferManager;
    private readonly formatter;
    private logLevel;
    private constructor();
    static getInstance(): AdvancedLogger;
    private setupEventListeners;
    updateFromConfig(): void;
    setLogLevel(level: LogLevel | string): void;
    enableFileLogging(filePath?: string, maxSizeMB?: number, maxFiles?: number): void;
    disableFileLogging(): void;
    isFileLoggingEnabled(): boolean;
    getLogFilePath(): string | null;
    debug(message: string, context?: Record<string, unknown>, source?: string): void;
    info(message: string, context?: Record<string, unknown>, source?: string): void;
    warn(message: string, context?: Record<string, unknown>, source?: string): void;
    error(message: string, context?: Record<string, unknown>, source?: string): void;
    private log;
    private processLogEntry;
    getLogs(): LogEntry[];
    clearLogs(): void;
    addLogListener(listener: (entry: LogEntry) => void): void;
    removeLogListener(listener: (entry: LogEntry) => void): void;
    showOutputChannel(): void;
    getEntryCount(level?: LogLevel): number;
    private handleError;
    private handleBufferOverflow;
    dispose(): void;
}
