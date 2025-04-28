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
exports.Logger = exports.LogLevel = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
    LogLevel[LogLevel["Off"] = 4] = "Off";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger class for consistent logging
 */
class Logger {
    /**
     * Create a new Logger instance
     */
    constructor() {
        this.logLevel = LogLevel.Info;
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * Set the log level
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    /**
     * Log a debug message
     */
    debug(message, ...args) {
        this.log(LogLevel.Debug, message, ...args);
    }
    /**
     * Log an info message
     */
    info(message, ...args) {
        this.log(LogLevel.Info, message, ...args);
    }
    /**
     * Log a warning message
     */
    warn(message, ...args) {
        this.log(LogLevel.Warn, message, ...args);
    }
    /**
     * Log an error message
     */
    error(message, ...args) {
        this.log(LogLevel.Error, message, ...args);
    }
    /**
     * Log a message with the specified level
     */
    log(level, message, ...args) {
        if (level < this.logLevel) {
            return;
        }
        const timestamp = new Date().toISOString();
        const levelStr = LogLevel[level].toUpperCase();
        let formattedMessage = `[${timestamp}] [${levelStr}] ${message}`;
        if (args.length > 0) {
            formattedMessage += ' ' + args
                .map(arg => {
                if (arg === null)
                    return 'null';
                if (arg === undefined)
                    return 'undefined';
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    }
                    catch (e) {
                        return String(arg);
                    }
                }
                return String(arg);
            })
                .join(' ');
        }
        try {
            this.outputChannel.appendLine(formattedMessage);
        }
        catch (e) {
            console.error('Error writing to output channel:', e);
        }
        // Also log to console for development
        if (level === LogLevel.Error) {
            console.error(formattedMessage);
        }
        else if (level === LogLevel.Warn) {
            console.warn(formattedMessage);
        }
        else if (level === LogLevel.Info) {
            console.info(formattedMessage);
        }
        else {
            console.log(formattedMessage);
        }
    }
    /**
     * Show the output channel
     */
    show() {
        this.outputChannel.show();
    }
    /**
     * Clear the log
     */
    clear() {
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