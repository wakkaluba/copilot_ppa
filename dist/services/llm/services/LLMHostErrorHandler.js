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
exports.LLMHostErrorHandler = void 0;
const vscode = __importStar(require("vscode"));
class LLMHostErrorHandler {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
    }
    handleProcessError(error, info) {
        this.logError('Process Error', error, info);
        this.showErrorNotification(`LLM Host Process Error: ${error.message}`);
    }
    handleStartError(error) {
        this.logError('Start Error', error);
        this.showErrorNotification(`Failed to start LLM Host: ${error.message}`);
    }
    handleStopError(error) {
        this.logError('Stop Error', error);
        this.showErrorNotification(`Failed to stop LLM Host: ${error.message}`);
    }
    handleRestartError(error) {
        this.logError('Restart Error', error);
        this.showErrorNotification(`Failed to restart LLM Host: ${error.message}`);
    }
    handleHealthWarning(message, metrics) {
        this.outputChannel.appendLine(`[WARNING] Health: ${message}`);
        this.outputChannel.appendLine(`Metrics: ${JSON.stringify(metrics, null, 2)}`);
    }
    handleHealthCritical(error, metrics) {
        this.logError('Critical Health Error', error, metrics);
        this.showErrorNotification(`LLM Host Health Critical: ${error.message}`);
    }
    logError(type, error, context) {
        this.outputChannel.appendLine(`[ERROR] ${type}:`);
        this.outputChannel.appendLine(error.stack || error.message);
        if (context) {
            this.outputChannel.appendLine(`Context: ${JSON.stringify(context, null, 2)}`);
        }
    }
    showErrorNotification(message) {
        vscode.window.showErrorMessage(message);
    }
}
exports.LLMHostErrorHandler = LLMHostErrorHandler;
//# sourceMappingURL=LLMHostErrorHandler.js.map