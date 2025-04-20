"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedLogger = exports.LogLevel = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Advanced logger with memory and file support
 */
class AdvancedLogger {
    static instance;
    logLevel = LogLevel.INFO;
    inMemoryLogs = [];
    maxInMemoryLogs = 10000;
    outputChannel;
    // File logging
    fileLoggingEnabled = false;
    logFilePath = null;
    maxLogSizeMB = 5;
    maxLogFiles = 3;
    logFileStream = null;
    // Listeners
    onLogListeners = [];
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
        // Initialize from configuration
        this.updateFromConfig();
    }
    /**
     * Get logger instance (singleton)
     */
    static getInstance() {
        if (!AdvancedLogger.instance) {
            AdvancedLogger.instance = new AdvancedLogger();
        }
        return AdvancedLogger.instance;
    }
    /**
     * Update settings from VS Code configuration
     */
    updateFromConfig() {
        const config = vscode.workspace.getConfiguration('copilot-ppa.logger');
        // Set log level
        const configLevel = config.get('level', 'info');
        switch (configLevel.toLowerCase()) {
            case 'debug':
                this.logLevel = LogLevel.DEBUG;
                break;
            case 'info':
                this.logLevel = LogLevel.INFO;
                break;
            case 'warn':
            case 'warning':
                this.logLevel = LogLevel.WARN;
                break;
            case 'error':
                this.logLevel = LogLevel.ERROR;
                break;
            default:
                this.logLevel = LogLevel.INFO;
        }
        // Configure file logging
        const fileLoggingEnabled = config.get('logToFile', false);
        if (fileLoggingEnabled) {
            const logFilePath = config.get('logFilePath', '');
            const maxLogSizeMB = config.get('maxSize', 5);
            const maxLogFiles = config.get('maxFiles', 3);
            this.enableFileLogging(logFilePath, maxLogSizeMB, maxLogFiles);
        }
        else {
            this.disableFileLogging();
        }
        // Set max in-memory logs
        this.maxInMemoryLogs = config.get('maxInMemoryLogs', 10000);
    }
    /**
     * Set log level
     */
    setLogLevel(level) {
        if (typeof level === 'string') {
            switch (level.toLowerCase()) {
                case 'debug':
                    this.logLevel = LogLevel.DEBUG;
                    break;
                case 'info':
                    this.logLevel = LogLevel.INFO;
                    break;
                case 'warn':
                case 'warning':
                    this.logLevel = LogLevel.WARN;
                    break;
                case 'error':
                    this.logLevel = LogLevel.ERROR;
                    break;
                default:
                    this.logLevel = LogLevel.INFO;
            }
        }
        else {
            this.logLevel = level;
        }
    }
    /**
     * Enable file logging
     */
    enableFileLogging(filePath = '', maxSizeMB = 5, maxFiles = 3) {
        // Close existing stream if any
        this.disableFileLogging();
        this.fileLoggingEnabled = true;
        this.maxLogSizeMB = maxSizeMB;
        this.maxLogFiles = maxFiles;
        try {
            // If no path is provided, use default location
            if (!filePath) {
                const extensionContext = global.__extensionContext;
                if (extensionContext) {
                    const logDir = path.join(extensionContext.logUri.fsPath);
                    filePath = path.join(logDir, 'copilot-ppa.log');
                    // Ensure directory exists
                    if (!fs.existsSync(logDir)) {
                        fs.mkdirSync(logDir, { recursive: true });
                    }
                }
                else {
                    // Fallback to temp directory
                    filePath = path.join(os.tmpdir(), 'copilot-ppa.log');
                }
            }
            this.logFilePath = filePath;
            // Create log directory if it doesn't exist
            const logDir = path.dirname(filePath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            // Open file stream for appending
            this.logFileStream = fs.createWriteStream(filePath, { flags: 'a' });
            // Check if rotation is needed
            this.checkRotation();
            this.info(`File logging enabled: ${filePath}`, {}, 'AdvancedLogger');
        }
        catch (error) {
            this.fileLoggingEnabled = false;
            this.logFilePath = null;
            this.logFileStream = null;
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.error(`Failed to enable file logging: ${errorMsg}`, {}, 'AdvancedLogger');
        }
    }
    /**
     * Disable file logging
     */
    disableFileLogging() {
        if (this.logFileStream) {
            this.logFileStream.end();
            this.logFileStream = null;
        }
        this.fileLoggingEnabled = false;
    }
    /**
     * Check if file logging is enabled
     */
    isFileLoggingEnabled() {
        return this.fileLoggingEnabled;
    }
    /**
     * Get log file path
     */
    getLogFilePath() {
        return this.logFilePath;
    }
    /**
     * Check if log file rotation is needed
     */
    checkRotation() {
        if (!this.fileLoggingEnabled || !this.logFilePath)
            return;
        try {
            const stats = fs.statSync(this.logFilePath);
            const fileSizeMB = stats.size / (1024 * 1024);
            if (fileSizeMB >= this.maxLogSizeMB) {
                this.rotateLogFiles();
            }
        }
        catch (error) {
            // File doesn't exist yet, no rotation needed
        }
    }
    /**
     * Rotate log files
     */
    rotateLogFiles() {
        if (!this.fileLoggingEnabled || !this.logFilePath)
            return;
        try {
            // Close current stream
            if (this.logFileStream) {
                this.logFileStream.end();
                this.logFileStream = null;
            }
            // Rotate files
            for (let i = this.maxLogFiles - 1; i > 0; i--) {
                const oldPath = `${this.logFilePath}.${i - 1}`;
                const newPath = `${this.logFilePath}.${i}`;
                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, newPath);
                }
            }
            // Rename current log file
            if (fs.existsSync(this.logFilePath)) {
                fs.renameSync(this.logFilePath, `${this.logFilePath}.1`);
            }
            // Create new log file
            this.logFileStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.error(`Failed to rotate log files: ${errorMsg}`, {}, 'AdvancedLogger');
        }
    }
    /**
     * Log a debug message
     */
    debug(message, context = {}, source) {
        this.log(LogLevel.DEBUG, message, context, source);
    }
    /**
     * Log an info message
     */
    info(message, context = {}, source) {
        this.log(LogLevel.INFO, message, context, source);
    }
    /**
     * Log a warning message
     */
    warn(message, context = {}, source) {
        this.log(LogLevel.WARN, message, context, source);
    }
    /**
     * Log an error message
     */
    error(message, context = {}, source) {
        this.log(LogLevel.ERROR, message, context, source);
    }
    /**
     * Log a message
     */
    log(level, message, context = {}, source) {
        // Skip if level is below current log level
        if (level < this.logLevel)
            return;
        const entry = {
            timestamp: Date.now(),
            level,
            message,
            source,
            context
        };
        // Add to in-memory logs
        this.inMemoryLogs.push(entry);
        // Trim in-memory logs if needed
        if (this.inMemoryLogs.length > this.maxInMemoryLogs) {
            this.inMemoryLogs = this.inMemoryLogs.slice(-this.maxInMemoryLogs);
        }
        // Log to VS Code output channel
        const levelPrefix = this.getLevelPrefix(level);
        const sourcePrefix = source ? `[${source}] ` : '';
        const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
        this.outputChannel.appendLine(`${levelPrefix} ${sourcePrefix}${message}${contextStr}`);
        // Log to file if enabled
        if (this.fileLoggingEnabled && this.logFileStream) {
            const timestamp = new Date().toISOString();
            const fileEntry = `${timestamp} ${levelPrefix} ${sourcePrefix}${message}${contextStr}\n`;
            this.logFileStream.write(fileEntry);
            // Check if rotation is needed
            this.checkRotation();
        }
        // Notify listeners
        this.onLogListeners.forEach(listener => {
            try {
                listener(entry);
            }
            catch (error) {
                // Ignore listener errors
            }
        });
    }
    /**
     * Get level prefix
     */
    getLevelPrefix(level) {
        switch (level) {
            case LogLevel.DEBUG:
                return '[DEBUG]';
            case LogLevel.INFO:
                return '[INFO ]';
            case LogLevel.WARN:
                return '[WARN ]';
            case LogLevel.ERROR:
                return '[ERROR]';
            default:
                return '[INFO ]';
        }
    }
    /**
     * Get all logs
     */
    getLogs() {
        return [...this.inMemoryLogs];
    }
    /**
     * Clear all in-memory logs
     */
    clearLogs() {
        this.inMemoryLogs = [];
    }
    /**
     * Add log listener
     */
    addLogListener(listener) {
        this.onLogListeners.push(listener);
    }
    /**
     * Remove log listener
     */
    removeLogListener(listener) {
        const index = this.onLogListeners.indexOf(listener);
        if (index !== -1) {
            this.onLogListeners.splice(index, 1);
        }
    }
    /**
     * Show the output channel
     */
    showOutputChannel() {
        this.outputChannel.show();
    }
    /**
     * Get the count of log entries
     */
    getEntryCount(level) {
        if (level === undefined) {
            return this.inMemoryLogs.length;
        }
        return this.inMemoryLogs.filter(entry => entry.level === level).length;
    }
}
exports.AdvancedLogger = AdvancedLogger;
//# sourceMappingURL=advancedLogger.js.map