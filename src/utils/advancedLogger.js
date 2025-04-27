"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedLogger = void 0;
var vscode = require("vscode");
var logging_1 = require("../types/logging");
var events_1 = require("events");
var FileLogManager_1 = require("../services/logging/FileLogManager");
var LogBufferManager_1 = require("../services/logging/LogBufferManager");
var LogFormatterService_1 = require("../services/logging/LogFormatterService");
/**
 * Advanced logger service with enhanced features, error handling, and storage options
 */
var AdvancedLogger = /** @class */ (function (_super) {
    __extends(AdvancedLogger, _super);
    function AdvancedLogger() {
        var _this = _super.call(this) || this;
        _this.logLevel = logging_1.LogLevel.INFO;
        _this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
        _this.fileManager = new FileLogManager_1.FileLogManager();
        _this.bufferManager = new LogBufferManager_1.LogBufferManager();
        _this.formatter = new LogFormatterService_1.LogFormatterService();
        _this.setupEventListeners();
        return _this;
    }
    AdvancedLogger.getInstance = function () {
        if (!AdvancedLogger.instance) {
            AdvancedLogger.instance = new AdvancedLogger();
        }
        return AdvancedLogger.instance;
    };
    AdvancedLogger.prototype.setupEventListeners = function () {
        var _this = this;
        this.fileManager.on('error', function (error) { return _this.handleError(error); });
        this.bufferManager.on('overflow', function () { return _this.handleBufferOverflow(); });
    };
    AdvancedLogger.prototype.updateFromConfig = function () {
        try {
            var config = vscode.workspace.getConfiguration('copilot-ppa.logger');
            this.setLogLevel(config.get('level', 'info'));
            if (config.get('enableFileLogging', false)) {
                this.enableFileLogging(config.get('logFilePath', ''), config.get('maxFileSizeMB', 5), config.get('maxFiles', 3));
            }
            else {
                this.disableFileLogging();
            }
            this.bufferManager.setMaxEntries(config.get('maxInMemoryLogs', 10000));
        }
        catch (error) {
            this.handleError(new Error("Failed to update config: ".concat(error instanceof Error ? error.message : String(error))));
        }
    };
    AdvancedLogger.prototype.setLogLevel = function (level) {
        try {
            this.logLevel = typeof level === 'string' ?
                logging_1.LogLevel[level.toUpperCase()] : level;
        }
        catch (error) {
            this.handleError(new Error("Invalid log level: ".concat(level)));
            this.logLevel = logging_1.LogLevel.INFO;
        }
    };
    AdvancedLogger.prototype.enableFileLogging = function (filePath, maxSizeMB, maxFiles) {
        if (filePath === void 0) { filePath = ''; }
        if (maxSizeMB === void 0) { maxSizeMB = 5; }
        if (maxFiles === void 0) { maxFiles = 3; }
        try {
            this.fileManager.initialize({ filePath: filePath, maxSizeMB: maxSizeMB, maxFiles: maxFiles });
        }
        catch (error) {
            this.handleError(new Error("Failed to enable file logging: ".concat(error instanceof Error ? error.message : String(error))));
        }
    };
    AdvancedLogger.prototype.disableFileLogging = function () {
        this.fileManager.disable();
    };
    AdvancedLogger.prototype.isFileLoggingEnabled = function () {
        return this.fileManager.isEnabled();
    };
    AdvancedLogger.prototype.getLogFilePath = function () {
        return this.fileManager.getCurrentPath();
    };
    AdvancedLogger.prototype.debug = function (message, context, source) {
        if (context === void 0) { context = {}; }
        if (this.logLevel <= logging_1.LogLevel.DEBUG) {
            this.log(logging_1.LogLevel.DEBUG, message, context, source);
        }
    };
    AdvancedLogger.prototype.info = function (message, context, source) {
        if (context === void 0) { context = {}; }
        if (this.logLevel <= logging_1.LogLevel.INFO) {
            this.log(logging_1.LogLevel.INFO, message, context, source);
        }
    };
    AdvancedLogger.prototype.warn = function (message, context, source) {
        if (context === void 0) { context = {}; }
        if (this.logLevel <= logging_1.LogLevel.WARN) {
            this.log(logging_1.LogLevel.WARN, message, context, source);
        }
    };
    AdvancedLogger.prototype.error = function (message, context, source) {
        if (context === void 0) { context = {}; }
        if (this.logLevel <= logging_1.LogLevel.ERROR) {
            this.log(logging_1.LogLevel.ERROR, message, context, source);
        }
    };
    AdvancedLogger.prototype.log = function (level, message, context, source) {
        if (context === void 0) { context = {}; }
        try {
            var entry = this.formatter.createEntry(level, message, context, source);
            this.processLogEntry(entry);
        }
        catch (error) {
            this.handleError(new Error("Failed to create log entry: ".concat(error instanceof Error ? error.message : String(error))));
        }
    };
    AdvancedLogger.prototype.processLogEntry = function (entry) {
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
        }
        catch (error) {
            this.handleError(new Error("Failed to process log entry: ".concat(error instanceof Error ? error.message : String(error))));
        }
    };
    AdvancedLogger.prototype.getLogs = function () {
        return this.bufferManager.getEntries();
    };
    AdvancedLogger.prototype.clearLogs = function () {
        this.bufferManager.clear();
        this.outputChannel.clear();
    };
    AdvancedLogger.prototype.addLogListener = function (listener) {
        this.on('logged', listener);
    };
    AdvancedLogger.prototype.removeLogListener = function (listener) {
        this.off('logged', listener);
    };
    AdvancedLogger.prototype.showOutputChannel = function () {
        this.outputChannel.show();
    };
    AdvancedLogger.prototype.getEntryCount = function (level) {
        return this.bufferManager.getCount(level);
    };
    AdvancedLogger.prototype.handleError = function (error) {
        console.error("[AdvancedLogger] ".concat(error.message));
        this.emit('error', error);
    };
    AdvancedLogger.prototype.handleBufferOverflow = function () {
        this.warn('Log buffer overflow - oldest entries will be removed');
    };
    AdvancedLogger.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.fileManager.dispose();
        this.removeAllListeners();
    };
    return AdvancedLogger;
}(events_1.EventEmitter));
exports.AdvancedLogger = AdvancedLogger;
