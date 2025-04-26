import * as vscode from 'vscode';
import { LLMHostManager, HostStatus } from '../services/llm/LLMHostManager';
import { LLMConnectionManager, ConnectionStatus } from '../services/llm/LLMConnectionManager';
import { EventEmitter } from 'events';

export enum ConnectionState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2,
    Error = 3
}

export interface StatusInfo {
    status: ConnectionStatus;
    hostStatus?: HostStatus;
    provider?: string;
    host?: string;
    lastUpdate: number;
    details?: Record<string, any>;
}

export class ConnectionStatusService extends EventEmitter implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;
    private currentStatus: StatusInfo;
    private hostManager: LLMHostManager;
    private connectionManager: LLMConnectionManager;
    private disposables: vscode.Disposable[] = [];
    private _state: ConnectionState = ConnectionState.Disconnected;
    private _activeModelName: string = '';
    private _providerName: string = '';
    private _stateChangeEmitter = new vscode.EventEmitter<ConnectionState>();

    constructor(hostManager: LLMHostManager, connectionManager: LLMConnectionManager) {
        super();
        this.hostManager = hostManager;
        this.connectionManager = connectionManager;
        
        this.currentStatus = {
            status: ConnectionStatus.Disconnected,
            lastUpdate: Date.now()
        };
        
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'copilot-ppa.toggleLLMConnection';
        this.updateStatusBar();
        this.statusBarItem.show();
        
        this.registerEventListeners();
    }

    get state(): ConnectionState {
        return this._state;
    }

    get activeModelName(): string {
        return this._activeModelName;
    }

    get providerName(): string {
        return this._providerName;
    }

    get onDidChangeState(): vscode.Event<ConnectionState> {
        return this._stateChangeEmitter.event;
    }

    public setState(state: ConnectionState): void {
        this._state = state;
        this._stateChangeEmitter.fire(state);
        this.updateStatusBar();
    }

    public showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
        switch (type) {
            case 'warning':
                vscode.window.showWarningMessage(message);
                break;
            case 'error':
                vscode.window.showErrorMessage(message);
                break;
            default:
                vscode.window.showInformationMessage(message);
        }
    }

    private registerEventListeners(): void {
        // Listen for connection status changes
        this.connectionManager.on('statusChanged', (event) => {
            this.updateConnectionStatus();
        });
        
        // Listen for host status changes
        this.hostManager.on('hostStatusChanged', (host) => {
            this.updateHostStatus(host.id);
        });
        
        // Listen for host availability changes
        this.hostManager.on('hostBecameAvailable', (host) => {
            this.updateHostStatus(host.id);
        });
        
        this.hostManager.on('hostBecameUnavailable', (host) => {
            this.updateHostStatus(host.id);
        });
    }
    
    /**
     * Update the connection status information
     */
    updateConnectionStatus(): void {
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
    updateHostStatus(hostId: string): void {
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
    getStatus(): StatusInfo {
        return { ...this.currentStatus };
    }
    
    /**
     * Update the status bar display based on current status
     */
    private updateStatusBar(): void {
        const { status, provider, host } = this.currentStatus;
        
        let text = '';
        let tooltip = '';
        let color: vscode.ThemeColor | undefined;
        
        switch (status) {
            case ConnectionStatus.Connected:
                text = `$(check) LLM: ${provider || 'Connected'}`;
                tooltip = `Connected to ${provider}${host ? ` on ${host}` : ''}`;
                break;
                
            case ConnectionStatus.Connecting:
                text = `$(sync~spin) LLM: Connecting...`;
                tooltip = `Connecting to LLM provider${provider ? ` (${provider})` : ''}`;
                break;
                
            case ConnectionStatus.Error:
                text = `$(error) LLM: Error`;
                tooltip = `Error connecting to LLM provider${provider ? ` (${provider})` : ''}`;
                color = new vscode.ThemeColor('statusBarItem.errorBackground');
                break;
                
            case ConnectionStatus.Disconnected:
            default:
                text = `$(plug) LLM: Disconnected`;
                tooltip = 'Click to connect to an LLM provider';
                break;
        }
        
        this.statusBarItem.text = text;
        this.statusBarItem.tooltip = tooltip;
        
        if (color) {
            this.statusBarItem.backgroundColor = color;
        } else {
            this.statusBarItem.backgroundColor = undefined;
        }
    }
    
    dispose(): void {
        this.statusBarItem.dispose();
        this._stateChangeEmitter.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
