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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
        this._logEntries = [];
        this._source = 'Logger'; // Added source property
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
    log(level, message, error) {
        // Only log if level is greater than or equal to configured level
        if (level < this._logLevel) {
            return;
        }
        const timestamp = Date.now();
        const levelName = this.logLevelToString(level);
        // Format message for output
        const formattedTimestamp = new Date(timestamp).toISOString();
        let formattedMessage = `[${formattedTimestamp}] [${levelName}] ${message}`;
        let context;
        if (error) {
            let errorStr = '';
            // Properly format details based on type
            if (error instanceof Error) {
                errorStr = error.stack || error.toString();
                context = { error: error.message, stack: error.stack };
            }
            else if (typeof error === 'object') {
                try {
                    errorStr = JSON.stringify(error, null, 2);
                    context = error;
                }
                catch (e) {
                    errorStr = String(error);
                    context = { value: String(error) };
                }
            }
            else {
                errorStr = String(error);
                context = { value: errorStr };
            }
            formattedMessage += `\n${errorStr}`;
        }
        // Log to output channel
        this._outputChannel.appendLine(formattedMessage);
        // Create log entry using the standardized interface
        const logEntry = {
            timestamp: new Date(timestamp),
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
    // Getter for source property
    get source() {
        return this._source;
    }
    /**
     * Get workspace folders
     * @returns Array of workspace folders
     */
    getWorkspaceFolders() {
        return vscode.workspace.workspaceFolders;
    }
    /**
     * Find files in the workspace matching a pattern
     * @param include glob pattern to match files
     * @param exclude glob pattern to exclude files
     * @param maxResults max number of results
     * @returns Array of found file URIs
     */
    async findFiles(include, exclude, maxResults) {
        try {
            return await vscode.workspace.findFiles(include, exclude, maxResults);
        }
        catch (error) {
            this.error(`Error finding files with pattern ${include}:`, error);
            throw error;
        }
    }
    /**
     * Create a directory
     * @param uri The URI of the directory to create
     */
    async createDirectory(uri) {
        try {
            await vscode.workspace.fs.createDirectory(uri);
        }
        catch (error) {
            this.error(`Error creating directory ${uri.fsPath}:`, error);
            throw error;
        }
    }
    /**
     * Get configuration value
     * @param section Configuration section
     * @param key Configuration key
     * @param defaultValue Default value if not found
     * @returns The configuration value or default value
     */
    getConfiguration(section, key, defaultValue) {
        const config = vscode.workspace.getConfiguration(section);
        if (defaultValue === undefined) {
            return config.get(key);
        }
        else {
            return config.get(key, defaultValue);
        }
    }
    /**
     * Update configuration value
     * @param section Configuration section
     * @param key Configuration key
     * @param value New value
     * @param target Configuration target (default: Workspace)
     */
    async updateConfiguration(section, key, value, target = vscode.ConfigurationTarget.Workspace) {
        try {
            const config = vscode.workspace.getConfiguration(section);
            await config.update(key, value, target);
        }
        catch (error) {
            this.error(`Error updating configuration ${section}.${key}:`, error);
            throw error;
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
})(Logger = exports.Logger || (exports.Logger = {}));
//# sourceMappingURL=logger.js.map