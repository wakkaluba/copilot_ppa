import * as vscode from 'vscode';
import { LogLevel, LogEntry, LogOptions, LogStorageConfig } from '../types/logging';
import { EventEmitter } from 'events';
import { FileLogManager } from '../services/logging/FileLogManager';
import { LogBufferManager } from '../services/logging/LogBufferManager';
import { LogFormatterService } from '../services/logging/LogFormatterService';

/**
 * Advanced logger service with enhanced features, error handling, and storage options
 */
export class AdvancedLogger extends EventEmitter {
    private static instance: AdvancedLogger;
    private readonly outputChannel: vscode.OutputChannel;
    private readonly fileManager: FileLogManager;
    private readonly bufferManager: LogBufferManager;
    private readonly formatter: LogFormatterService;
    private logLevel: LogLevel = LogLevel.INFO;

    private constructor() {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
        this.fileManager = new FileLogManager();
        this.bufferManager = new LogBufferManager();
        this.formatter = new LogFormatterService();
        this.setupEventListeners();
    }

    public static getInstance(): AdvancedLogger {
        if (!AdvancedLogger.instance) {
            AdvancedLogger.instance = new AdvancedLogger();
        }
        return AdvancedLogger.instance;
    }

    private setupEventListeners(): void {
        this.fileManager.on('error', (error: Error) => this.handleError(error));
        this.bufferManager.on('overflow', () => this.handleBufferOverflow());
    }

    public updateFromConfig(): void {
        try {
            const config = vscode.workspace.getConfiguration('copilot-ppa.logger');
            this.setLogLevel(config.get<string>('level', 'info'));
            
            if (config.get<boolean>('enableFileLogging', false)) {
                this.enableFileLogging(
                    config.get<string>('logFilePath', ''),
                    config.get<number>('maxFileSizeMB', 5),
                    config.get<number>('maxFiles', 3)
                );
            } else {
                this.disableFileLogging();
            }

            this.bufferManager.setMaxEntries(config.get<number>('maxInMemoryLogs', 10000));
        } catch (error) {
            this.handleError(new Error(`Failed to update config: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    public setLogLevel(level: LogLevel | string): void {
        try {
            this.logLevel = typeof level === 'string' ? 
                LogLevel[level.toUpperCase() as keyof typeof LogLevel] : level;
        } catch (error) {
            this.handleError(new Error(`Invalid log level: ${level}`));
            this.logLevel = LogLevel.INFO;
        }
    }

    public enableFileLogging(filePath: string = '', maxSizeMB: number = 5, maxFiles: number = 3): void {
        try {
            this.fileManager.initialize({ filePath, maxSizeMB, maxFiles });
        } catch (error) {
            this.handleError(new Error(`Failed to enable file logging: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    public disableFileLogging(): void {
        this.fileManager.disable();
    }

    public isFileLoggingEnabled(): boolean {
        return this.fileManager.isEnabled();
    }

    public getLogFilePath(): string | null {
        return this.fileManager.getCurrentPath();
    }

    public debug(message: string, context: Record<string, unknown> = {}, source?: string): void {
        if (this.logLevel <= LogLevel.DEBUG) {
            this.log(LogLevel.DEBUG, message, context, source);
        }
    }

    public info(message: string, context: Record<string, unknown> = {}, source?: string): void {
        if (this.logLevel <= LogLevel.INFO) {
            this.log(LogLevel.INFO, message, context, source);
        }
    }

    public warn(message: string, context: Record<string, unknown> = {}, source?: string): void {
        if (this.logLevel <= LogLevel.WARN) {
            this.log(LogLevel.WARN, message, context, source);
        }
    }

    public error(message: string, context: Record<string, unknown> = {}, source?: string): void {
        if (this.logLevel <= LogLevel.ERROR) {
            this.log(LogLevel.ERROR, message, context, source);
        }
    }

    private log(level: LogLevel, message: string, context: Record<string, unknown> = {}, source?: string): void {
        try {
            const entry = this.formatter.createEntry(level, message, context, source);
            this.processLogEntry(entry);
        } catch (error) {
            this.handleError(new Error(`Failed to create log entry: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    private processLogEntry(entry: LogEntry): void {
        try {
            // Add to buffer
            this.bufferManager.addEntry(entry);

            // Write to output channel
            this.outputChannel.appendLine(this.formatter.formatForDisplay(entry));

            // Write to file if enabled
            if (this.isFileLoggingEnabled()) {
                this.fileManager.writeEntry(entry);
            }

            // Emit event
            this.emit('logged', entry);
        } catch (error) {
            this.handleError(new Error(`Failed to process log entry: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    public getLogs(): LogEntry[] {
        return this.bufferManager.getEntries();
    }

    public clearLogs(): void {
        this.bufferManager.clear();
        this.outputChannel.clear();
    }

    public addLogListener(listener: (entry: LogEntry) => void): void {
        this.on('logged', listener);
    }

    public removeLogListener(listener: (entry: LogEntry) => void): void {
        this.off('logged', listener);
    }

    public showOutputChannel(): void {
        this.outputChannel.show();
    }

    public getEntryCount(level?: LogLevel): number {
        return this.bufferManager.getCount(level);
    }

    private handleError(error: Error): void {
        console.error(`[AdvancedLogger] ${error.message}`);
        this.emit('error', error);
    }

    private handleBufferOverflow(): void {
        this.warn('Log buffer overflow - oldest entries will be removed');
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.fileManager.dispose();
        this.removeAllListeners();
    }
}
