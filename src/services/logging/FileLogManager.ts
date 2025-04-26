import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { EventEmitter } from 'events';
import { LogEntry, LogStorageConfig } from '../../types/logging';

/**
 * Manages file-based logging operations
 */
export class FileLogManager extends EventEmitter {
    private enabled: boolean = false;
    private currentPath: string | null = null;
    private logStream: fs.WriteStream | null = null;
    private config: LogStorageConfig = {
        filePath: '',
        maxSizeMB: 5,
        maxFiles: 3
    };

    /**
     * Initialize the file manager with configuration
     */
    public initialize(config: LogStorageConfig): void {
        try {
            this.config = config;
            this.enabled = true;
            
            // Set default path if not provided
            if (!config.filePath) {
                const logsDir = path.join(os.homedir(), '.copilot-ppa', 'logs');
                
                // Ensure directory exists
                if (!fs.existsSync(logsDir)) {
                    fs.mkdirSync(logsDir, { recursive: true });
                }
                
                // Generate filename with timestamp
                const timestamp = new Date().toISOString().replace(/:/g, '-');
                this.currentPath = path.join(logsDir, `copilot-ppa-${timestamp}.log`);
            } else {
                this.currentPath = config.filePath;
                
                // Ensure the directory for the log file exists
                const logDir = path.dirname(this.currentPath);
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }
            }
            
            // Create or open log stream
            this.logStream = fs.createWriteStream(this.currentPath, { flags: 'a' });
            this.logStream.on('error', (error) => this.handleStreamError(error));
            
            // Handle rotation if needed
            this.checkRotation();
        } catch (error) {
            this.emitError(error);
            this.enabled = false;
            this.currentPath = null;
        }
    }

    /**
     * Disable file logging and clean up
     */
    public disable(): void {
        if (this.logStream) {
            this.logStream.end();
            this.logStream = null;
        }
        this.enabled = false;
        this.currentPath = null;
    }

    /**
     * Write a log entry to the current log file
     */
    public writeEntry(entry: LogEntry): void {
        if (!this.enabled || !this.logStream) {
            return;
        }
        
        try {
            // Format the entry for the file
            const formattedEntry = this.formatEntryForFile(entry);
            
            // Write to the file
            this.logStream.write(`${formattedEntry}\n`);
            
            // Check if we need to rotate the log file
            this.checkRotation();
        } catch (error) {
            this.emitError(error);
        }
    }

    /**
     * Check if the current log file needs rotation
     */
    private checkRotation(): void {
        if (!this.currentPath || !fs.existsSync(this.currentPath)) {
            return;
        }
        
        try {
            const stats = fs.statSync(this.currentPath);
            const fileSizeInMB = stats.size / (1024 * 1024);
            
            if (fileSizeInMB >= this.config.maxSizeMB) {
                this.rotateLogFiles();
            }
        } catch (error) {
            this.emitError(error);
        }
    }

    /**
     * Rotate log files
     */
    private rotateLogFiles(): void {
        if (!this.currentPath) {
            return;
        }
        
        try {
            // Close current stream
            if (this.logStream) {
                this.logStream.end();
                this.logStream = null;
            }
            
            // Shift existing log files
            for (let i = this.config.maxFiles - 1; i > 0; i--) {
                const oldPath = `${this.currentPath}.${i}`;
                const newPath = `${this.currentPath}.${i + 1}`;
                
                if (fs.existsSync(oldPath)) {
                    if (i === this.config.maxFiles - 1) {
                        // Delete oldest log file if at max
                        fs.unlinkSync(oldPath);
                    } else {
                        // Rename file for rotation
                        fs.renameSync(oldPath, newPath);
                    }
                }
            }
            
            // Rename current log file
            if (fs.existsSync(this.currentPath)) {
                fs.renameSync(this.currentPath, `${this.currentPath}.1`);
            }
            
            // Create new log file
            this.logStream = fs.createWriteStream(this.currentPath, { flags: 'a' });
            this.logStream.on('error', (error) => this.handleStreamError(error));
        } catch (error) {
            this.emitError(error);
        }
    }

    /**
     * Helper to ensure unknown errors are converted to Error objects
     */
    private emitError(error: unknown): void {
        if (error instanceof Error) {
            this.emit('error', error);
        } else {
            this.emit('error', new Error(String(error)));
        }
    }

    /**
     * Handle stream errors
     */
    private handleStreamError(error: Error): void {
        this.emit('error', error);
    }

    /**
     * Format a log entry for file output
     */
    private formatEntryForFile(entry: LogEntry): string {
        const timestamp = new Date(entry.timestamp).toISOString();
        const level = this.formatLevel(entry.level.toString());
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
     * Format level string to fixed width
     */
    private formatLevel(level: string): string {
        return level.padEnd(5, ' ');
    }

    /**
     * Check if file logging is enabled
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Get the current log file path
     */
    public getCurrentPath(): string | null {
        return this.currentPath;
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.disable();
        this.removeAllListeners();
    }
}