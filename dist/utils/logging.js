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
exports.LoggingService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Logging service for the extension
 * Provides consistent logging across the extension with multiple log levels
 */
class LoggingService {
    outputChannel;
    extensionName;
    /**
     * Creates a new logging service
     * @param extensionName The name of the extension for the output channel
     */
    constructor(extensionName) {
        this.extensionName = extensionName;
        this.outputChannel = vscode.window.createOutputChannel(`${extensionName}`);
    }
    /**
     * Log an informational message
     * @param message The message to log
     */
    log(message) {
        this.logWithLevel('INFO', message);
    }
    /**
     * Log a debug message
     * @param message The message to log
     */
    debug(message) {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        if (config.get('debugLogging', false)) {
            this.logWithLevel('DEBUG', message);
        }
    }
    /**
     * Log a warning message
     * @param message The warning message
     */
    warn(message) {
        this.logWithLevel('WARN', message);
    }
    /**
     * Log an error message with optional Error object
     * @param message The error message
     * @param error Optional Error object
     */
    error(message, error) {
        this.logWithLevel('ERROR', message);
        if (error) {
            if (error instanceof Error) {
                this.outputChannel.appendLine(`  Error Details: ${error.message}`);
                if (error.stack) {
                    this.outputChannel.appendLine(`  Stack Trace: ${error.stack}`);
                }
            }
            else {
                this.outputChannel.appendLine(`  Error Details: ${String(error)}`);
            }
        }
    }
    /**
     * Internal method to format and log a message with the specified level
     * @param level The log level
     * @param message The message to log
     */
    logWithLevel(level, message) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
    }
    /**
     * Show the output channel
     */
    show() {
        this.outputChannel.show();
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.LoggingService = LoggingService;
//# sourceMappingURL=logging.js.map