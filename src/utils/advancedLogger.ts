import * as vscode from 'vscode';
import { LoggingService } from '../services/logging/LoggingService';
import { LogLevel, LogEntry } from '../types/logging';

export class AdvancedLogger {
    private static instance: AdvancedLogger;
    private service: LoggingService;
    
    private constructor() {
        this.service = new LoggingService();
    }

    public static getInstance(): AdvancedLogger {
        if (!AdvancedLogger.instance) {
            AdvancedLogger.instance = new AdvancedLogger();
        }
        return AdvancedLogger.instance;
    }

    public updateFromConfig(): void {
        this.service.updateFromConfig();
    }

    public setLogLevel(level: LogLevel | string): void {
        this.service.setLogLevel(level);
    }

    public enableFileLogging(filePath: string = '', maxSizeMB: number = 5, maxFiles: number = 3): void {
        this.service.enableFileLogging(filePath, maxSizeMB, maxFiles);
    }

    public disableFileLogging(): void {
        this.service.disableFileLogging();
    }

    public isFileLoggingEnabled(): boolean {
        return this.service.isFileLoggingEnabled();
    }

    public getLogFilePath(): string | null {
        return this.service.getLogFilePath();
    }

    public debug(message: string, context: any = {}, source?: string): void {
        this.service.debug(message, context, source);
    }

    public info(message: string, context: any = {}, source?: string): void {
        this.service.info(message, context, source);
    }

    public warn(message: string, context: any = {}, source?: string): void {
        this.service.warn(message, context, source);
    }

    public error(message: string, context: any = {}, source?: string): void {
        this.service.error(message, context, source);
    }

    public log(level: LogLevel, message: string, context: any = {}, source?: string): void {
        this.service.log(level, message, context, source);
    }

    public getLogs(): LogEntry[] {
        return this.service.getLogs();
    }

    public clearLogs(): void {
        this.service.clearLogs();
    }

    public addLogListener(listener: (entry: LogEntry) => void): void {
        this.service.addLogListener(listener);
    }

    public removeLogListener(listener: (entry: LogEntry) => void): void {
        this.service.removeLogListener(listener);
    }

    public showOutputChannel(): void {
        this.service.showOutputChannel();
    }

    public getEntryCount(level?: LogLevel): number {
        return this.service.getEntryCount(level);
    }
}
