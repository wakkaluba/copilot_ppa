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
exports.Logger = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Logger utility for consistent logging across the extension
 */
class Logger {
    constructor(channelName = 'Copilot PPA') {
        this.logHistory = [];
        this.maxHistorySize = 100;
        this.outputChannel = vscode.window.createOutputChannel(channelName);
    }
    /**
     * Log an informational message
     * @param message Message to log
     * @param context Optional context data
     */
    info(message, context) {
        this.log('info', message, context);
    }
    /**
     * Log a warning message
     * @param message Message to log
     * @param context Optional context data
     */
    warn(message, context) {
        this.log('warn', message, context);
    }
    /**
     * Log an error message
     * @param message Message to log
     * @param context Optional context data
     */
    error(message, context) {
        this.log('error', message, context);
    }
    /**
     * Log a debug message
     * @param message Message to log
     * @param context Optional context data
     */
    debug(message, context) {
        this.log('debug', message, context);
    }
    /**
     * Internal log method
     * @param level Log level
     * @param message Message to log
     * @param context Optional context data
     */
    log(level, message, context) {
        const entry = {
            level,
            message,
            timestamp: Date.now(),
            context
        };
        // Add to history
        this.logHistory.push(entry);
        // Trim history if needed
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory = this.logHistory.slice(-this.maxHistorySize);
        }
        // Format and write to output channel
        const formattedMessage = this.formatLogEntry(entry);
        this.outputChannel.appendLine(formattedMessage);
        // Show in console for development
        if (level === 'error') {
            console.error(formattedMessage);
        }
        else if (level === 'warn') {
            console.warn(formattedMessage);
        }
        else {
            console.log(formattedMessage);
        }
    }
    /**
     * Format a log entry for display
     * @param entry Log entry to format
     * @returns Formatted log string
     */
    formatLogEntry(entry) {
        const timestamp = new Date(entry.timestamp).toISOString();
        const level = entry.level.toUpperCase().padEnd(5);
        let message = `[${timestamp}] ${level} ${entry.message}`;
        if (entry.context) {
            try {
                message += ` ${JSON.stringify(entry.context)}`;
            }
            catch (error) {
                message += ' [Context serialization failed]';
            }
        }
        return message;
    }
    /**
     * Show the output channel
     * @param preserveFocus Whether to preserve focus on the current editor
     */
    show(preserveFocus = false) {
        this.outputChannel.show(preserveFocus);
    }
    /**
     * Get the log history
     * @returns Array of log entries
     */
    getHistory() {
        return [...this.logHistory];
    }
    /**
     * Clear log history
     */
    clearHistory() {
        this.logHistory = [];
        this.outputChannel.clear();
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map