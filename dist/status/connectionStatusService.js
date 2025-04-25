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
exports.ConnectionStatusService = exports.ConnectionState = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Enum representing the different connection states
 */
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["Disconnected"] = 0] = "Disconnected";
    ConnectionState[ConnectionState["Connecting"] = 1] = "Connecting";
    ConnectionState[ConnectionState["Connected"] = 2] = "Connected";
    ConnectionState[ConnectionState["Error"] = 3] = "Error";
})(ConnectionState || (exports.ConnectionState = ConnectionState = {}));
/**
 * Service for handling LLM connection status and UI updates
 */
class ConnectionStatusService {
    _state = ConnectionState.Disconnected;
    _activeModelName = '';
    _providerName = '';
    _statusBarItem;
    _stateChangeEmitter = new vscode.EventEmitter();
    constructor() {
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this._statusBarItem.command = 'copilot-ppa.toggleLLMConnection';
        this.updateStatusBarItem();
        this._statusBarItem.show();
    }
    /**
     * Current connection state
     */
    get state() {
        return this._state;
    }
    /**
     * Name of the currently active model
     */
    get activeModelName() {
        return this._activeModelName;
    }
    /**
     * Name of the currently active provider
     */
    get providerName() {
        return this._providerName;
    }
    /**
     * Event that fires when the connection state changes
     */
    get onDidChangeState() {
        return this._stateChangeEmitter.event;
    }
    /**
     * Sets the connection state
     * @param state New state
     * @param info Additional info about the state change
     */
    setState(state, info) {
        this._state = state;
        if (info) {
            if (info.modelName) {
                this._activeModelName = info.modelName;
            }
            if (info.providerName) {
                this._providerName = info.providerName;
            }
        }
        this.updateStatusBarItem();
        this._stateChangeEmitter.fire(state);
    }
    /**
     * Shows a notification to the user
     * @param message Message to show
     * @param type Notification type (info, warning, error)
     */
    showNotification(message, type = 'info') {
        switch (type) {
            case 'info':
                vscode.window.showInformationMessage(message);
                break;
            case 'warning':
                vscode.window.showWarningMessage(message);
                break;
            case 'error':
                vscode.window.showErrorMessage(message);
                break;
        }
    }
    /**
     * Updates the status bar item based on the current state
     */
    updateStatusBarItem() {
        switch (this._state) {
            case ConnectionState.Disconnected:
                this._statusBarItem.text = '$(cloud) LLM: Disconnected';
                this._statusBarItem.tooltip = 'LLM is disconnected. Click to connect.';
                this._statusBarItem.backgroundColor = undefined;
                break;
            case ConnectionState.Connecting:
                this._statusBarItem.text = '$(sync~spin) LLM: Connecting...';
                this._statusBarItem.tooltip = 'Connecting to LLM...';
                this._statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
                break;
            case ConnectionState.Connected:
                const modelInfo = this._activeModelName ? ` (${this._activeModelName})` : '';
                this._statusBarItem.text = `$(cloud) LLM: ${this._providerName}${modelInfo}`;
                this._statusBarItem.tooltip = `Connected to ${this._providerName}${modelInfo}. Click to disconnect.`;
                this._statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
                break;
            case ConnectionState.Error:
                this._statusBarItem.text = '$(error) LLM: Error';
                this._statusBarItem.tooltip = 'Error connecting to LLM. Click for details.';
                this._statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                break;
        }
    }
    /**
     * Disposes resources used by this service
     */
    dispose() {
        this._stateChangeEmitter.dispose();
        this._statusBarItem.dispose();
    }
}
exports.ConnectionStatusService = ConnectionStatusService;
//# sourceMappingURL=connectionStatusService.js.map