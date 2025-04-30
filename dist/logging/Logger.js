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
exports.Logger = void 0;
const vscode = __importStar(require("vscode"));
const ILogger_1 = require("./ILogger");
/**
 * Simple logger implementation
 */
class Logger {
    outputChannel;
    logLevel = ILogger_1.LogLevel.Info;
    constructor(channelName = 'Copilot PPA') {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    debug(message, ...args) {
        if (this.logLevel <= ILogger_1.LogLevel.Debug) {
            this.log('DEBUG', message, ...args);
        }
    }
    info(message, ...args) {
        if (this.logLevel <= ILogger_1.LogLevel.Info) {
            this.log('INFO', message, ...args);
        }
    }
    warn(message, ...args) {
        if (this.logLevel <= ILogger_1.LogLevel.Warning) {
            this.log('WARN', message, ...args);
        }
    }
    error(message, ...args) {
        if (this.logLevel <= ILogger_1.LogLevel.Error) {
            this.log('ERROR', message, ...args);
        }
    }
    log(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message}`;
        this.outputChannel.appendLine(formattedMessage);
        if (args.length > 0) {
            for (const arg of args) {
                if (arg instanceof Error) {
                    this.outputChannel.appendLine(`  ${arg.message}`);
                    if (arg.stack) {
                        this.outputChannel.appendLine(`  ${arg.stack}`);
                    }
                }
                else {
                    try {
                        const stringified = typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                        this.outputChannel.appendLine(`  ${stringified}`);
                    }
                    catch (err) {
                        this.outputChannel.appendLine(`  [Unstringifiable object]`);
                    }
                }
            }
        }
    }
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map