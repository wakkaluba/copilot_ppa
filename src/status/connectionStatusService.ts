import * as vscode from 'vscode';

/**
 * Enum representing the different connection states
 */
export enum ConnectionState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2,
    Error = 3
}

/**
 * Service for handling LLM connection status and UI updates
 */
export class ConnectionStatusService implements vscode.Disposable {
    private _state: ConnectionState = ConnectionState.Disconnected;
    private _activeModelName: string = '';
    private _providerName: string = '';
    private _statusBarItem: vscode.StatusBarItem;
    private _stateChangeEmitter = new vscode.EventEmitter<ConnectionState>();

    constructor() {
        this._statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this._statusBarItem.command = 'copilot-ppa.toggleLLMConnection';
        this.updateStatusBarItem();
        this._statusBarItem.show();
    }

    /**
     * Current connection state
     */
    get state(): ConnectionState {
        return this._state;
    }

    /**
     * Name of the currently active model
     */
    get activeModelName(): string {
        return this._activeModelName;
    }

    /**
     * Name of the currently active provider
     */
    get providerName(): string {
        return this._providerName;
    }

    /**
     * Event that fires when the connection state changes
     */
    get onDidChangeState(): vscode.Event<ConnectionState> {
        return this._stateChangeEmitter.event;
    }

    /**
     * Sets the connection state
     * @param state New state
     * @param info Additional info about the state change
     */
    public setState(state: ConnectionState, info?: any): void {
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
    public showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
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
    private updateStatusBarItem(): void {
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
    public dispose(): void {
        this._stateChangeEmitter.dispose();
        this._statusBarItem.dispose();
    }
}
