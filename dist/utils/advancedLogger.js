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
exports.AdvancedLogger = void 0;
const vscode = __importStar(require("vscode"));
const logging_1 = require("../types/logging");
const events_1 = require("events");
const FileLogManager_1 = require("../services/logging/FileLogManager");
const LogBufferManager_1 = require("../services/logging/LogBufferManager");
const LogFormatterService_1 = require("../services/logging/LogFormatterService");
/**
 * Advanced logger service with enhanced features, error handling, and storage options
 */
class AdvancedLogger extends events_1.EventEmitter {
    constructor() {
        super();
        this.logLevel = logging_1.LogLevel.INFO;
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
        this.fileManager = new FileLogManager_1.FileLogManager();
        this.bufferManager = new LogBufferManager_1.LogBufferManager();
        this.formatter = new LogFormatterService_1.LogFormatterService();
        this.setupEventListeners();
    }
    static getInstance() {
        if (!AdvancedLogger.instance) {
            AdvancedLogger.instance = new AdvancedLogger();
        }
        return AdvancedLogger.instance;
    }
    setupEventListeners() {
        this.fileManager.on('error', (error) => this.handleError(error));
        this.bufferManager.on('overflow', () => this.handleBufferOverflow());
    }
    updateFromConfig() {
        try {
            const config = vscode.workspace.getConfiguration('copilot-ppa.logger');
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
            this.handleError(new Error(`Failed to update config: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
    setLogLevel(level) {
        try {
            this.logLevel = typeof level === 'string' ?
                logging_1.LogLevel[level.toUpperCase()] : level;
        }
        catch (error) {
            this.handleError(new Error(`Invalid log level: ${level}`));
            this.logLevel = logging_1.LogLevel.INFO;
        }
    }
    enableFileLogging(filePath = '', maxSizeMB = 5, maxFiles = 3) {
        try {
            this.fileManager.initialize({ filePath, maxSizeMB, maxFiles });
        }
        catch (error) {
            this.handleError(new Error(`Failed to enable file logging: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
    disableFileLogging() {
        this.fileManager.disable();
    }
    isFileLoggingEnabled() {
        return this.fileManager.isEnabled();
    }
    getLogFilePath() {
        return this.fileManager.getCurrentPath();
    }
    debug(message, context = {}, source) {
        if (this.logLevel <= logging_1.LogLevel.DEBUG) {
            this.log(logging_1.LogLevel.DEBUG, message, context, source);
        }
    }
    info(message, context = {}, source) {
        if (this.logLevel <= logging_1.LogLevel.INFO) {
            this.log(logging_1.LogLevel.INFO, message, context, source);
        }
    }
    warn(message, context = {}, source) {
        if (this.logLevel <= logging_1.LogLevel.WARN) {
            this.log(logging_1.LogLevel.WARN, message, context, source);
        }
    }
    error(message, context = {}, source) {
        if (this.logLevel <= logging_1.LogLevel.ERROR) {
            this.log(logging_1.LogLevel.ERROR, message, context, source);
        }
    }
    log(level, message, context = {}, source) {
        try {
            const entry = this.formatter.createEntry(level, message, context, source);
            this.processLogEntry(entry);
        }
        catch (error) {
            this.handleError(new Error(`Failed to create log entry: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
    processLogEntry(entry) {
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
            this.handleError(new Error(`Failed to process log entry: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
    getLogs() {
        return this.bufferManager.getEntries();
    }
    clearLogs() {
        this.bufferManager.clear();
        this.outputChannel.clear();
    }
    addLogListener(listener) {
        this.on('logged', listener);
    }
    removeLogListener(listener) {
        this.off('logged', listener);
    }
    showOutputChannel() {
        this.outputChannel.show();
    }
    getEntryCount(level) {
        return this.bufferManager.getCount(level);
    }
    handleError(error) {
        console.error(`[AdvancedLogger] ${error.message}`);
        this.emit('error', error);
    }
    handleBufferOverflow() {
        this.warn('Log buffer overflow - oldest entries will be removed');
    }
    dispose() {
        this.outputChannel.dispose();
        this.fileManager.dispose();
        this.removeAllListeners();
    }
}
exports.AdvancedLogger = AdvancedLogger;
//# sourceMappingURL=advancedLogger.js.map