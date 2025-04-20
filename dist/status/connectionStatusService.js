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
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["Disconnected"] = "disconnected";
    ConnectionState["Connecting"] = "connecting";
    ConnectionState["Connected"] = "connected";
    ConnectionState["Error"] = "error";
})(ConnectionState || (exports.ConnectionState = ConnectionState = {}));
/**
 * Service to manage and share the LLM connection status across the extension
 */
class ConnectionStatusService {
    _statusBarItem;
    _state = ConnectionState.Disconnected;
    _stateChangeEmitter = new vscode.EventEmitter();
    _activeModelName = '';
    _providerName = '';
    /**
     * Event that fires when the connection state changes
     */
    onDidChangeState = this._stateChangeEmitter.event;
    constructor() {
        // Create status bar item
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this._statusBarItem.command = 'localLlmAgent.openSidebar';
        this._updateStatusBar();
        this._statusBarItem.show();
    }
    /**
     * Get the current connection state
     */
    get state() {
        return this._state;
    }
    /**
     * Get the active model name
     */
    get activeModelName() {
        return this._activeModelName;
    }
    /**
     * Get the provider name
     */
    get providerName() {
        return this._providerName;
    }
    /**
     * Set the connection state and notify listeners
     */
    setState(state, options) {
        this._state = state;
        if (options?.modelName !== undefined) {
            this._activeModelName = options.modelName;
        }
        if (options?.providerName !== undefined) {
            this._providerName = options.providerName;
        }
        this._updateStatusBar();
        this._stateChangeEmitter.fire(this._state);
    }
    /**
     * Update status bar item appearance based on current state
     */
    _updateStatusBar() {
        const statusText = this._getStatusText();
        const tooltip = this._getTooltipText();
        const icon = this._getStatusIcon();
        this._statusBarItem.text = `${icon} ${statusText}`;
        this._statusBarItem.tooltip = tooltip;
        // Apply color based on state
        if (this._state === ConnectionState.Connected) {
            this._statusBarItem.backgroundColor = undefined;
            this._statusBarItem.color = new vscode.ThemeColor('testing.iconPassed');
        }
        else if (this._state === ConnectionState.Error) {
            this._statusBarItem.backgroundColor = undefined;
            this._statusBarItem.color = new vscode.ThemeColor('testing.iconFailed');
        }
        else {
            this._statusBarItem.backgroundColor = undefined;
            this._statusBarItem.color = undefined;
        }
    }
    /**
     * Get the appropriate icon for the current state
     */
    _getStatusIcon() {
        switch (this._state) {
            case ConnectionState.Connected:
                return '$(plug)';
            case ConnectionState.Connecting:
                return '$(loading~spin)';
            case ConnectionState.Error:
                return '$(error)';
            case ConnectionState.Disconnected:
            default:
                return '$(debug-disconnect)';
        }
    }
    /**
     * Get the status text to display
     */
    _getStatusText() {
        switch (this._state) {
            case ConnectionState.Connected:
                if (this._activeModelName) {
                    return `LLM: ${this._activeModelName}`;
                }
                return 'LLM: Connected';
            case ConnectionState.Connecting:
                return 'LLM: Connecting...';
            case ConnectionState.Error:
                return 'LLM: Error';
            case ConnectionState.Disconnected:
            default:
                return 'LLM: Disconnected';
        }
    }
    /**
     * Get detailed tooltip text
     */
    _getTooltipText() {
        let tooltip = `Local LLM Agent - ${this._state.charAt(0).toUpperCase() + this._state.slice(1)}`;
        if (this._providerName) {
            tooltip += `\nProvider: ${this._providerName}`;
        }
        if (this._activeModelName) {
            tooltip += `\nModel: ${this._activeModelName}`;
        }
        tooltip += '\n\nClick to open agent sidebar';
        return tooltip;
    }
    /**
     * Show a notification for important status changes
     */
    showNotification(message, type = 'info') {
        switch (type) {
            case 'warning':
                vscode.window.showWarningMessage(message);
                break;
            case 'error':
                vscode.window.showErrorMessage(message);
                break;
            case 'info':
            default:
                vscode.window.showInformationMessage(message);
                break;
        }
    }
    /**
     * Dispose the service
     */
    dispose() {
        this._statusBarItem.dispose();
        this._stateChangeEmitter.dispose();
    }
}
exports.ConnectionStatusService = ConnectionStatusService;
//# sourceMappingURL=connectionStatusService.js.map