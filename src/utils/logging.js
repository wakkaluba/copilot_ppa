"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingService = void 0;
var vscode = require("vscode");
/**
 * Logging service for the extension
 * Provides consistent logging across the extension with multiple log levels
 */
var LoggingService = /** @class */ (function () {
    /**
     * Creates a new logging service
     * @param extensionName The name of the extension for the output channel
     */
    function LoggingService(extensionName) {
        this.extensionName = extensionName;
        this.outputChannel = vscode.window.createOutputChannel("".concat(extensionName));
    }
    /**
     * Log an informational message
     * @param message The message to log
     */
    LoggingService.prototype.log = function (message) {
        this.logWithLevel('INFO', message);
    };
    /**
     * Log a debug message
     * @param message The message to log
     */
    LoggingService.prototype.debug = function (message) {
        var config = vscode.workspace.getConfiguration('copilot-ppa');
        if (config.get('debugLogging', false)) {
            this.logWithLevel('DEBUG', message);
        }
    };
    /**
     * Log a warning message
     * @param message The warning message
     */
    LoggingService.prototype.warn = function (message) {
        this.logWithLevel('WARN', message);
    };
    /**
     * Log an error message with optional Error object
     * @param message The error message
     * @param error Optional Error object
     */
    LoggingService.prototype.error = function (message, error) {
        this.logWithLevel('ERROR', message);
        if (error) {
            if (error instanceof Error) {
                this.outputChannel.appendLine("  Error Details: ".concat(error.message));
                if (error.stack) {
                    this.outputChannel.appendLine("  Stack Trace: ".concat(error.stack));
                }
            }
            else {
                this.outputChannel.appendLine("  Error Details: ".concat(String(error)));
            }
        }
    };
    /**
     * Internal method to format and log a message with the specified level
     * @param level The log level
     * @param message The message to log
     */
    LoggingService.prototype.logWithLevel = function (level, message) {
        var timestamp = new Date().toISOString();
        this.outputChannel.appendLine("[".concat(timestamp, "] [").concat(level, "] ").concat(message));
    };
    /**
     * Show the output channel
     */
    LoggingService.prototype.show = function () {
        this.outputChannel.show();
    };
    /**
     * Dispose of resources
     */
    LoggingService.prototype.dispose = function () {
        this.outputChannel.dispose();
    };
    return LoggingService;
}());
exports.LoggingService = LoggingService;
