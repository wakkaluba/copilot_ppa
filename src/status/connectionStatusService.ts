import * as vscode from 'vscode';

export enum ConnectionState {
    Disconnected = 'disconnected',
    Connecting = 'connecting',
    Connected = 'connected',
    Error = 'error'
}

/**
 * Service to manage and share the LLM connection status across the extension
 */
export class ConnectionStatusService {
    private _statusBarItem: vscode.StatusBarItem;
    private _state: ConnectionState = ConnectionState.Disconnected;
    private _stateChangeEmitter = new vscode.EventEmitter<ConnectionState>();
    private _activeModelName: string = '';
    private _providerName: string = '';

    /**
     * Event that fires when the connection state changes
     */
    public readonly onDidChangeState = this._stateChangeEmitter.event;

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
    public get state(): ConnectionState {
        return this._state;
    }

    /**
     * Get the active model name
     */
    public get activeModelName(): string {
        return this._activeModelName;
    }

    /**
     * Get the provider name
     */
    public get providerName(): string {
        return this._providerName;
    }

    /**
     * Set the connection state and notify listeners
     */
    public setState(state: ConnectionState, options?: { modelName?: string, providerName?: string }): void {
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
    private _updateStatusBar(): void {
        const statusText = this._getStatusText();
        const tooltip = this._getTooltipText();
        const icon = this._getStatusIcon();

        this._statusBarItem.text = `${icon} ${statusText}`;
        this._statusBarItem.tooltip = tooltip;

        // Apply color based on state
        if (this._state === ConnectionState.Connected) {
            this._statusBarItem.backgroundColor = undefined;
            this._statusBarItem.color = new vscode.ThemeColor('testing.iconPassed');
        } else if (this._state === ConnectionState.Error) {
            this._statusBarItem.backgroundColor = undefined;
            this._statusBarItem.color = new vscode.ThemeColor('testing.iconFailed');
        } else {
            this._statusBarItem.backgroundColor = undefined;
            this._statusBarItem.color = undefined;
        }
    }

    /**
     * Get the appropriate icon for the current state
     */
    private _getStatusIcon(): string {
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
    private _getStatusText(): string {
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
    private _getTooltipText(): string {
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
    public showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
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
    public dispose(): void {
        this._statusBarItem.dispose();
        this._stateChangeEmitter.dispose();
    }
}
