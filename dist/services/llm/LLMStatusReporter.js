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
exports.LLMStatusReporter = void 0;
const vscode = __importStar(require("vscode"));
const llm_1 = require("../../types/llm");
/**
 * Reports LLM connection status to VS Code UI
 */
class LLMStatusReporter {
    static instance;
    statusBarItem;
    outputChannel;
    currentProvider;
    currentModel;
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.outputChannel = vscode.window.createOutputChannel('LLM Connection');
        this.setupStatusBarItem();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LLMStatusReporter();
        }
        return this.instance;
    }
    /**
     * Update the displayed status
     */
    updateStatus(status, provider) {
        this.currentProvider = provider;
        this.currentModel = status.modelInfo;
        this.updateStatusBar(status.state);
        this.logStatus(status, provider);
    }
    /**
     * Report a connection state change
     */
    reportStateChange(event, provider) {
        this.updateStatusBar(event.newState);
        this.logStateChange(event, provider);
    }
    /**
     * Report an error
     */
    reportError(error, provider) {
        const prefix = provider ? `[${provider}] ` : '';
        const message = `${prefix}Error: ${error.message}`;
        vscode.window.showErrorMessage(message);
        this.outputChannel.appendLine(`${new Date().toISOString()} - ${message}`);
        if (error.stack) {
            this.outputChannel.appendLine(error.stack);
        }
    }
    /**
     * Show connection details
     */
    async showConnectionDetails() {
        if (!this.currentProvider) {
            vscode.window.showInformationMessage('No active LLM connection');
            return;
        }
        const details = [
            `Provider: ${this.currentProvider}`,
            this.currentModel ? `Model: ${this.currentModel.name}` : 'No model loaded',
            this.currentModel?.capabilities?.length ?
                `Capabilities: ${this.currentModel.capabilities.join(', ')}` :
                'No capabilities info'
        ];
        const result = await vscode.window.showInformationMessage(details.join('\n'), 'Show Logs');
        if (result === 'Show Logs') {
            this.outputChannel.show();
        }
    }
    setupStatusBarItem() {
        this.statusBarItem.command = 'llm.showConnectionDetails';
        this.updateStatusBar(llm_1.ConnectionState.DISCONNECTED);
        this.statusBarItem.show();
    }
    updateStatusBar(state) {
        const icons = {
            [llm_1.ConnectionState.CONNECTED]: '$(link)',
            [llm_1.ConnectionState.CONNECTING]: '$(sync~spin)',
            [llm_1.ConnectionState.DISCONNECTED]: '$(unlink)',
            [llm_1.ConnectionState.ERROR]: '$(warning)'
        };
        const provider = this.currentProvider ? ` - ${this.currentProvider}` : '';
        const model = this.currentModel ? ` (${this.currentModel.name})` : '';
        this.statusBarItem.text = `${icons[state]} LLM${provider}${model}`;
        this.statusBarItem.tooltip = `LLM Connection Status: ${state}${provider}${model}`;
    }
    logStatus(status, provider) {
        const timestamp = new Date().toISOString();
        const prefix = provider ? `[${provider}] ` : '';
        this.outputChannel.appendLine(`${timestamp} - ${prefix}Status: ${status.state}` +
            (status.modelInfo ? ` - Model: ${status.modelInfo.name}` : '') +
            (status.error ? `\nError: ${status.error.message}` : ''));
    }
    logStateChange(event, provider) {
        const timestamp = new Date().toISOString();
        const prefix = provider ? `[${provider}] ` : '';
        this.outputChannel.appendLine(`${timestamp} - ${prefix}State changed: ${event.previousState} -> ${event.newState}`);
    }
    dispose() {
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    }
}
exports.LLMStatusReporter = LLMStatusReporter;
//# sourceMappingURL=LLMStatusReporter.js.map