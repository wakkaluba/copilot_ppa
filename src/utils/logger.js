"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LoggerImpl = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var os = require("os");
var logging_1 = require("../types/logging");
/**
 * Logger class for Copilot PPA extension
 */
var LoggerImpl = /** @class */ (function () {
    function LoggerImpl() {
        this._logEntries = [];
        this._source = 'Logger'; // Added source property
        this._outputChannel = vscode.window.createOutputChannel('Copilot PPA');
        // Read configuration
        var config = vscode.workspace.getConfiguration('copilot-ppa.logger');
        // Set log level
        var levelString = config.get('level', 'info');
        this._logLevel = this.stringToLogLevel(levelString);
        // File logging settings
        this._logToFile = config.get('logToFile', false);
        var logFilePath = config.get('logFilePath', '');
        if (this._logToFile && !logFilePath) {
            // Use default location if not specified
            var logsFolder = path.join(os.homedir(), '.copilot-ppa', 'logs');
            // Ensure logs directory exists
            if (!fs.existsSync(logsFolder)) {
                fs.mkdirSync(logsFolder, { recursive: true });
            }
            // Create log file name with timestamp
            var timestamp = new Date().toISOString().replace(/:/g, '-');
            logFilePath = path.join(logsFolder, "copilot-ppa-".concat(timestamp, ".log"));
        }
        this._logFilePath = logFilePath;
        this._maxInMemoryLogs = config.get('maxInMemoryLogs', 10000);
        // Log initialization
        this.info("Logger initialized with level ".concat(levelString));
        if (this._logToFile) {
            this.info("Logging to file: ".concat(this._logFilePath));
        }
    }
    /**
     * Gets the singleton instance of the logger
     */
    LoggerImpl.getInstance = function () {
        if (!LoggerImpl.instance) {
            LoggerImpl.instance = new LoggerImpl();
        }
        return LoggerImpl.instance;
    };
    /**
     * Set the logging level
     * @param level The log level to set
     */
    LoggerImpl.prototype.setLogLevel = function (level) {
        this._logLevel = level;
    };
    /**
     * Log a debug message
     */
    LoggerImpl.prototype.debug = function (message, details) {
        this.log(logging_1.LogLevel.DEBUG, message, details);
    };
    /**
     * Log an info message
     */
    LoggerImpl.prototype.info = function (message, details) {
        this.log(logging_1.LogLevel.INFO, message, details);
    };
    /**
     * Log a warning message
     */
    LoggerImpl.prototype.warn = function (message, details) {
        this.log(logging_1.LogLevel.WARN, message, details);
    };
    /**
     * Log an error message
     */
    LoggerImpl.prototype.error = function (message, details) {
        this.log(logging_1.LogLevel.ERROR, message, details);
    };
    /**
     * Clear all logs
     */
    LoggerImpl.prototype.clearLogs = function () {
        this._logEntries = [];
        this._outputChannel.clear();
        // Log the clearing action
        this.info('Logs cleared');
    };
    /**
     * Export logs to a file
     */
    LoggerImpl.prototype.exportLogs = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, downloadsFolder, logData;
            return __generator(this, function (_a) {
                try {
                    // Use provided path or create a default one
                    if (!filePath) {
                        timestamp = new Date().toISOString().replace(/:/g, '-');
                        downloadsFolder = path.join(os.homedir(), 'Downloads');
                        filePath = path.join(downloadsFolder, "copilot-ppa-logs-".concat(timestamp, ".json"));
                    }
                    logData = JSON.stringify(this._logEntries, null, 2);
                    fs.writeFileSync(filePath, logData);
                    this.info("Logs exported to ".concat(filePath));
                    return [2 /*return*/, filePath];
                }
                catch (error) {
                    this.error('Failed to export logs', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get all log entries
     */
    LoggerImpl.prototype.getLogEntries = function () {
        return __spreadArray([], this._logEntries, true);
    };
    /**
     * Show the output channel
     */
    LoggerImpl.prototype.showOutputChannel = function () {
        this._outputChannel.show();
    };
    /**
     * Convert string to LogLevel enum
     */
    LoggerImpl.prototype.stringToLogLevel = function (level) {
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
    };
    /**
     * Get log level name from enum
     */
    LoggerImpl.prototype.logLevelToString = function (level) {
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
    };
    /**
     * Internal log method
     */
    LoggerImpl.prototype.log = function (level, message, error) {
        // Only log if level is greater than or equal to configured level
        if (level < this._logLevel) {
            return;
        }
        var timestamp = Date.now();
        var levelName = this.logLevelToString(level);
        // Format message for output
        var formattedTimestamp = new Date(timestamp).toISOString();
        var formattedMessage = "[".concat(formattedTimestamp, "] [").concat(levelName, "] ").concat(message);
        var context;
        if (error) {
            var errorStr = '';
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
            formattedMessage += "\n".concat(errorStr);
        }
        // Log to output channel
        this._outputChannel.appendLine(formattedMessage);
        // Create log entry using the standardized interface
        var logEntry = {
            timestamp: new Date(timestamp), // Use Date object as per the interface requirement
            level: level,
            message: message,
            context: context
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
                fs.appendFileSync(this._logFilePath, "".concat(formattedMessage, "\n"));
            }
            catch (error) {
                // Log to output channel only to avoid recursion
                this._outputChannel.appendLine("[ERROR] Failed to write to log file: ".concat(error));
            }
        }
    };
    Object.defineProperty(LoggerImpl.prototype, "source", {
        // Getter for source property
        get: function () {
            return this._source;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get workspace folders
     * @returns Array of workspace folders
     */
    LoggerImpl.prototype.getWorkspaceFolders = function () {
        return vscode.workspace.workspaceFolders;
    };
    /**
     * Find files in the workspace matching a pattern
     * @param include glob pattern to match files
     * @param exclude glob pattern to exclude files
     * @param maxResults max number of results
     * @returns Array of found file URIs
     */
    LoggerImpl.prototype.findFiles = function (include, exclude, maxResults) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.workspace.findFiles(include, exclude, maxResults)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        this.error("Error finding files with pattern ".concat(include, ":"), error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a directory
     * @param uri The URI of the directory to create
     */
    LoggerImpl.prototype.createDirectory = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.workspace.fs.createDirectory(uri)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.error("Error creating directory ".concat(uri.fsPath, ":"), error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get configuration value
     * @param section Configuration section
     * @param key Configuration key
     * @param defaultValue Default value if not found
     * @returns The configuration value or default value
     */
    LoggerImpl.prototype.getConfiguration = function (section, key, defaultValue) {
        var config = vscode.workspace.getConfiguration(section);
        if (defaultValue === undefined) {
            return config.get(key);
        }
        else {
            return config.get(key, defaultValue);
        }
    };
    /**
     * Update configuration value
     * @param section Configuration section
     * @param key Configuration key
     * @param value New value
     * @param target Configuration target (default: Workspace)
     */
    LoggerImpl.prototype.updateConfiguration = function (section_1, key_1, value_1) {
        return __awaiter(this, arguments, void 0, function (section, key, value, target) {
            var config, error_3;
            if (target === void 0) { target = vscode.ConfigurationTarget.Workspace; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        config = vscode.workspace.getConfiguration(section);
                        return [4 /*yield*/, config.update(key, value, target)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.error("Error updating configuration ".concat(section, ".").concat(key, ":"), error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return LoggerImpl;
}());
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
