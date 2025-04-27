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
exports.ConnectionStatusBar = exports.ConnectionStatus = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Status types for the LLM connection
 */
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["Disconnected"] = "Disconnected";
    ConnectionStatus["Connecting"] = "Connecting";
    ConnectionStatus["Connected"] = "Connected";
    ConnectionStatus["Error"] = "Error";
})(ConnectionStatus = exports.ConnectionStatus || (exports.ConnectionStatus = {}));
/**
 * A class that manages the status bar item for displaying LLM connection status
 */
class ConnectionStatusBar {
    constructor() {
        this.status = ConnectionStatus.Disconnected;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.updateStatus(ConnectionStatus.Disconnected);
        this.statusBarItem.show();
    }
    /**
     * Update the connection status display
     * @param newStatus The new connection status
     * @param message Optional additional message to display
     */
    updateStatus(newStatus, message) {
        this.status = newStatus;
        // Set icon based on status
        switch (newStatus) {
            case ConnectionStatus.Connected:
                this.statusBarItem.text = `$(check) LLM: Connected`;
                this.statusBarItem.tooltip = message || 'Connected to LLM service';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case ConnectionStatus.Connecting:
                this.statusBarItem.text = `$(sync~spin) LLM: Connecting`;
                this.statusBarItem.tooltip = message || 'Connecting to LLM service...';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case ConnectionStatus.Error:
                this.statusBarItem.text = `$(error) LLM: Error`;
                this.statusBarItem.tooltip = message || 'Error connecting to LLM service';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                break;
            case ConnectionStatus.Disconnected:
            default:
                this.statusBarItem.text = `$(plug) LLM: Disconnected`;
                this.statusBarItem.tooltip = message || 'Not connected to any LLM service';
                this.statusBarItem.backgroundColor = undefined;
                break;
        }
        // Add command to click the status bar for connection settings
        this.statusBarItem.command = 'vscode-local-llm-agent.openConnectionSettings';
    }
    /**
     * Get the current connection status
     */
    getStatus() {
        return this.status;
    }
    /**
     * Dispose of the status bar item when extension is deactivated
     */
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.ConnectionStatusBar = ConnectionStatusBar;
//# sourceMappingURL=ConnectionStatusBar.js.map