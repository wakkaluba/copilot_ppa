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
exports.FileLogManager = void 0;
var fs = require("fs");
var path = require("path");
var os = require("os");
var events_1 = require("events");
/**
 * Manages file-based logging operations
 */
var FileLogManager = /** @class */ (function (_super) {
    __extends(FileLogManager, _super);
    function FileLogManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.enabled = false;
        _this.currentPath = null;
        _this.logStream = null;
        _this.config = {
            filePath: '',
            maxSizeMB: 5,
            maxFiles: 3
        };
        return _this;
    }
    /**
     * Initialize the file manager with configuration
     */
    FileLogManager.prototype.initialize = function (config) {
        var _this = this;
        try {
            this.config = config;
            this.enabled = true;
            // Set default path if not provided
            if (!config.filePath) {
                var logsDir = path.join(os.homedir(), '.copilot-ppa', 'logs');
                // Ensure directory exists
                if (!fs.existsSync(logsDir)) {
                    fs.mkdirSync(logsDir, { recursive: true });
                }
                // Generate filename with timestamp
                var timestamp = new Date().toISOString().replace(/:/g, '-');
                this.currentPath = path.join(logsDir, "copilot-ppa-".concat(timestamp, ".log"));
            }
            else {
                this.currentPath = config.filePath;
                // Ensure the directory for the log file exists
                var logDir = path.dirname(this.currentPath);
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }
            }
            // Create or open log stream
            this.logStream = fs.createWriteStream(this.currentPath, { flags: 'a' });
            this.logStream.on('error', function (error) { return _this.handleStreamError(error); });
            // Handle rotation if needed
            this.checkRotation();
        }
        catch (error) {
            this.emitError(error);
            this.enabled = false;
            this.currentPath = null;
        }
    };
    /**
     * Disable file logging and clean up
     */
    FileLogManager.prototype.disable = function () {
        if (this.logStream) {
            this.logStream.end();
            this.logStream = null;
        }
        this.enabled = false;
        this.currentPath = null;
    };
    /**
     * Write a log entry to the current log file
     */
    FileLogManager.prototype.writeEntry = function (entry) {
        if (!this.enabled || !this.logStream) {
            return;
        }
        try {
            // Format the entry for the file
            var formattedEntry = this.formatEntryForFile(entry);
            // Write to the file
            this.logStream.write("".concat(formattedEntry, "\n"));
            // Check if we need to rotate the log file
            this.checkRotation();
        }
        catch (error) {
            this.emitError(error);
        }
    };
    /**
     * Check if the current log file needs rotation
     */
    FileLogManager.prototype.checkRotation = function () {
        if (!this.currentPath || !fs.existsSync(this.currentPath)) {
            return;
        }
        try {
            var stats = fs.statSync(this.currentPath);
            var fileSizeInMB = stats.size / (1024 * 1024);
            if (fileSizeInMB >= this.config.maxSizeMB) {
                this.rotateLogFiles();
            }
        }
        catch (error) {
            this.emitError(error);
        }
    };
    /**
     * Rotate log files
     */
    FileLogManager.prototype.rotateLogFiles = function () {
        var _this = this;
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
            for (var i = this.config.maxFiles - 1; i > 0; i--) {
                var oldPath = "".concat(this.currentPath, ".").concat(i);
                var newPath = "".concat(this.currentPath, ".").concat(i + 1);
                if (fs.existsSync(oldPath)) {
                    if (i === this.config.maxFiles - 1) {
                        // Delete oldest log file if at max
                        fs.unlinkSync(oldPath);
                    }
                    else {
                        // Rename file for rotation
                        fs.renameSync(oldPath, newPath);
                    }
                }
            }
            // Rename current log file
            if (fs.existsSync(this.currentPath)) {
                fs.renameSync(this.currentPath, "".concat(this.currentPath, ".1"));
            }
            // Create new log file
            this.logStream = fs.createWriteStream(this.currentPath, { flags: 'a' });
            this.logStream.on('error', function (error) { return _this.handleStreamError(error); });
        }
        catch (error) {
            this.emitError(error);
        }
    };
    /**
     * Helper to ensure unknown errors are converted to Error objects
     */
    FileLogManager.prototype.emitError = function (error) {
        if (error instanceof Error) {
            this.emit('error', error);
        }
        else {
            this.emit('error', new Error(String(error)));
        }
    };
    /**
     * Handle stream errors
     */
    FileLogManager.prototype.handleStreamError = function (error) {
        this.emit('error', error);
    };
    /**
     * Format a log entry for file output
     */
    FileLogManager.prototype.formatEntryForFile = function (entry) {
        var timestamp = new Date(entry.timestamp).toISOString();
        var level = this.formatLevel(entry.level.toString());
        var source = entry.source ? "[".concat(entry.source, "] ") : '';
        var result = "[".concat(timestamp, "] [").concat(level, "] ").concat(source).concat(entry.message);
        // Add context if any
        if (entry.context && Object.keys(entry.context).length > 0) {
            try {
                result += "\n".concat(JSON.stringify(entry.context, null, 2));
            }
            catch (e) {
                result += "\nContext: [Not serializable]";
            }
        }
        return result;
    };
    /**
     * Format level string to fixed width
     */
    FileLogManager.prototype.formatLevel = function (level) {
        return level.padEnd(5, ' ');
    };
    /**
     * Check if file logging is enabled
     */
    FileLogManager.prototype.isEnabled = function () {
        return this.enabled;
    };
    /**
     * Get the current log file path
     */
    FileLogManager.prototype.getCurrentPath = function () {
        return this.currentPath;
    };
    /**
     * Dispose of resources
     */
    FileLogManager.prototype.dispose = function () {
        this.disable();
        this.removeAllListeners();
    };
    return FileLogManager;
}(events_1.EventEmitter));
exports.FileLogManager = FileLogManager;
