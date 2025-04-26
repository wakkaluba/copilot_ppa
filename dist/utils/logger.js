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
exports.Logger = exports.LoggerImpl = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const logging_1 = require("../types/logging");
/**
 * Logger class for Copilot PPA extension
 */
class LoggerImpl {
    static instance;
    _outputChannel;
    _logLevel;
    _logToFile;
    _logFilePath;
    _logEntries = [];
    _maxInMemoryLogs;
    /**
     * Gets the singleton instance of the logger
     */
    static getInstance() {
        if (!LoggerImpl.instance) {
            LoggerImpl.instance = new LoggerImpl();
        }
        return LoggerImpl.instance;
    }
    constructor() {
        this._outputChannel = vscode.window.createOutputChannel('Copilot PPA');
        // Read configuration
        const config = vscode.workspace.getConfiguration('copilot-ppa.logger');
        // Set log level
        const levelString = config.get('level', 'info');
        this._logLevel = this.stringToLogLevel(levelString);
        // File logging settings
        this._logToFile = config.get('logToFile', false);
        let logFilePath = config.get('logFilePath', '');
        if (this._logToFile && !logFilePath) {
            // Use default location if not specified
            const logsFolder = path.join(os.homedir(), '.copilot-ppa', 'logs');
            // Ensure logs directory exists
            if (!fs.existsSync(logsFolder)) {
                fs.mkdirSync(logsFolder, { recursive: true });
            }
            // Create log file name with timestamp
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            logFilePath = path.join(logsFolder, `copilot-ppa-${timestamp}.log`);
        }
        this._logFilePath = logFilePath;
        this._maxInMemoryLogs = config.get('maxInMemoryLogs', 10000);
        // Log initialization
        this.info(`Logger initialized with level ${levelString}`);
        if (this._logToFile) {
            this.info(`Logging to file: ${this._logFilePath}`);
        }
    }
    /**
     * Set the logging level
     * @param level The log level to set
     */
    setLogLevel(level) {
        this._logLevel = level;
    }
    /**
     * Log a debug message
     */
    debug(message, details) {
        this.log(logging_1.LogLevel.DEBUG, message, details);
    }
    /**
     * Log an info message
     */
    info(message, details) {
        this.log(logging_1.LogLevel.INFO, message, details);
    }
    /**
     * Log a warning message
     */
    warn(message, details) {
        this.log(logging_1.LogLevel.WARN, message, details);
    }
    /**
     * Log an error message
     */
    error(message, details) {
        this.log(logging_1.LogLevel.ERROR, message, details);
    }
    /**
     * Clear all logs
     */
    clearLogs() {
        this._logEntries = [];
        this._outputChannel.clear();
        // Log the clearing action
        this.info('Logs cleared');
    }
    /**
     * Export logs to a file
     */
    async exportLogs(filePath) {
        try {
            // Use provided path or create a default one
            if (!filePath) {
                const timestamp = new Date().toISOString().replace(/:/g, '-');
                const downloadsFolder = path.join(os.homedir(), 'Downloads');
                filePath = path.join(downloadsFolder, `copilot-ppa-logs-${timestamp}.json`);
            }
            // Write logs to file
            const logData = JSON.stringify(this._logEntries, null, 2);
            fs.writeFileSync(filePath, logData);
            this.info(`Logs exported to ${filePath}`);
            return filePath;
        }
        catch (error) {
            this.error('Failed to export logs', error);
            throw error;
        }
    }
    /**
     * Get all log entries
     */
    getLogEntries() {
        return [...this._logEntries];
    }
    /**
     * Show the output channel
     */
    showOutputChannel() {
        this._outputChannel.show();
    }
    /**
     * Convert string to LogLevel enum
     */
    stringToLogLevel(level) {
        switch (level.toLowerCase()) {
            case 'debug':
                return logging_1.LogLevel.DEBUG;
            case 'info':
                return logging_1.LogLevel.INFO;
            case 'warn':
                return logging_1.LogLevel.WARN;
            case 'error':
                return logging_1.LogLevel.ERROR;
            default:
                return logging_1.LogLevel.INFO;
        }
    }
    /**
     * Get log level name from enum
     */
    logLevelToString(level) {
        switch (level) {
            case logging_1.LogLevel.DEBUG:
                return 'DEBUG';
            case logging_1.LogLevel.INFO:
                return 'INFO';
            case logging_1.LogLevel.WARN:
                return 'WARN';
            case logging_1.LogLevel.ERROR:
                return 'ERROR';
            default:
                return 'UNKNOWN';
        }
    }
    /**
     * Internal log method
     */
    log(level, message, details) {
        // Only log if level is greater than or equal to configured level
        if (level < this._logLevel) {
            return;
        }
        const timestamp = Date.now(); // Use numeric timestamp as per the standard interface
        const levelName = this.logLevelToString(level);
        // Format message for output
        const formattedTimestamp = new Date(timestamp).toISOString();
        let formattedMessage = `[${formattedTimestamp}] [${levelName}] ${message}`;
        let context;
        if (details) {
            let detailsStr = '';
            // Properly format details based on type
            if (details instanceof Error) {
                detailsStr = details.stack || details.toString();
                context = { error: details.message, stack: details.stack };
            }
            else if (typeof details === 'object') {
                try {
                    detailsStr = JSON.stringify(details, null, 2);
                    context = details;
                }
                catch (e) {
                    detailsStr = String(details);
                    context = { value: String(details) };
                }
            }
            else {
                detailsStr = String(details);
                context = { value: detailsStr };
            }
            formattedMessage += `\n${detailsStr}`;
        }
        // Log to output channel
        this._outputChannel.appendLine(formattedMessage);
        // Create log entry using the standardized interface
        const logEntry = {
            timestamp,
            level,
            message,
            context
        };
        // Add to in-memory logs
        this._logEntries.push(logEntry);
        // Cap the logs array to prevent memory issues
        if (this._logEntries.length > this._maxInMemoryLogs) {
            this._logEntries.shift();
        }
        // Log to file if enabled
        if (this._logToFile && this._logFilePath) {
            try {
                fs.appendFileSync(this._logFilePath, `${formattedMessage}\n`);
            }
            catch (error) {
                // Log to output channel only to avoid recursion
                this._outputChannel.appendLine(`[ERROR] Failed to write to log file: ${error}`);
            }
        }
    }
}
exports.LoggerImpl = LoggerImpl;
// Export the Logger interface as a namespace with a getInstance method
// This allows us to use Logger.getInstance() while maintaining the interface
var Logger;
(function (Logger) {
    function getInstance() {
        return LoggerImpl.getInstance();
    }
    Logger.getInstance = getInstance;
})(Logger || (exports.Logger = Logger = {}));
//# sourceMappingURL=logger.js.map