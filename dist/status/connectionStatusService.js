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
exports.ConnectionStatusService = void 0;
const vscode = __importStar(require("vscode"));
const LLMConnectionManager_1 = require("../services/llm/LLMConnectionManager");
class ConnectionStatusService {
    statusBarItem;
    currentStatus;
    hostManager;
    connectionManager;
    disposables = [];
    constructor(hostManager, connectionManager) {
        this.hostManager = hostManager;
        this.connectionManager = connectionManager;
        // Initialize with disconnected status
        this.currentStatus = {
            status: LLMConnectionManager_1.ConnectionStatus.Disconnected,
            lastUpdate: Date.now()
        };
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'localLlmAgent.connect'; // Command to trigger when clicked
        this.updateStatusBar();
        this.statusBarItem.show();
        // Set up event listeners
        this.registerEventListeners();
    }
    registerEventListeners() {
        // Listen for connection status changes
        const connectionListener = this.connectionManager.on('statusChanged', (event) => {
            this.updateConnectionStatus();
        });
        // Listen for host status changes
        const hostStatusListener = this.hostManager.on('hostStatusChanged', (host) => {
            this.updateHostStatus(host.id);
        });
        // Listen for host availability changes
        const hostAvailableListener = this.hostManager.on('hostBecameAvailable', (host) => {
            this.updateHostStatus(host.id);
        });
        const hostUnavailableListener = this.hostManager.on('hostBecameUnavailable', (host) => {
            this.updateHostStatus(host.id);
        });
    }
    /**
     * Update the connection status information
     */
    updateConnectionStatus() {
        const connectionStatus = this.connectionManager.getConnectionStatus();
        const provider = this.connectionManager.getProvider();
        this.currentStatus = {
            ...this.currentStatus,
            status: connectionStatus,
            provider: provider?.getName(),
            lastUpdate: Date.now()
        };
        this.updateStatusBar();
    }
    /**
     * Update host status information
     * @param hostId ID of the host to update
     */
    updateHostStatus(hostId) {
        const host = this.hostManager.getHost(hostId);
        if (!host) {
            return;
        }
        this.currentStatus = {
            ...this.currentStatus,
            hostStatus: host.status,
            host: host.name,
            lastUpdate: Date.now()
        };
        this.updateStatusBar();
    }
    /**
     * Get the current connection status
     * @returns Current status information
     */
    getStatus() {
        return { ...this.currentStatus };
    }
    /**
     * Update the status bar display based on current status
     */
    updateStatusBar() {
        const { status, provider, host } = this.currentStatus;
        let text = '';
        let tooltip = '';
        let color;
        switch (status) {
            case LLMConnectionManager_1.ConnectionStatus.Connected:
                text = `$(check) LLM: ${provider || 'Connected'}`;
                tooltip = `Connected to ${provider}${host ? ` on ${host}` : ''}`;
                break;
            case LLMConnectionManager_1.ConnectionStatus.Connecting:
                text = `$(sync~spin) LLM: Connecting...`;
                tooltip = `Connecting to LLM provider${provider ? ` (${provider})` : ''}`;
                break;
            case LLMConnectionManager_1.ConnectionStatus.Error:
                text = `$(error) LLM: Error`;
                tooltip = `Error connecting to LLM provider${provider ? ` (${provider})` : ''}`;
                color = new vscode.ThemeColor('statusBarItem.errorBackground');
                break;
            case LLMConnectionManager_1.ConnectionStatus.Disconnected:
            default:
                text = `$(plug) LLM: Disconnected`;
                tooltip = 'Click to connect to an LLM provider';
                break;
        }
        this.statusBarItem.text = text;
        this.statusBarItem.tooltip = tooltip;
        if (color) {
            this.statusBarItem.backgroundColor = color;
        }
        else {
            this.statusBarItem.backgroundColor = undefined;
        }
    }
    dispose() {
        this.statusBarItem.dispose();
        // Dispose all registered event listeners
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}
exports.ConnectionStatusService = ConnectionStatusService;
//# sourceMappingURL=connectionStatusService.js.map