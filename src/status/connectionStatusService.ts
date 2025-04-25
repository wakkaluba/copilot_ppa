import * as vscode from 'vscode';
import { LLMHostManager, HostStatus } from '../services/llm/LLMHostManager';
import { LLMConnectionManager, ConnectionStatus } from '../services/llm/LLMConnectionManager';

export interface StatusInfo {
    status: ConnectionStatus;
    hostStatus?: HostStatus;
    provider?: string;
    host?: string;
    lastUpdate: number;
    details?: Record<string, any>;
}

export class ConnectionStatusService implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;
    private currentStatus: StatusInfo;
    private hostManager: LLMHostManager;
    private connectionManager: LLMConnectionManager;
    private disposables: vscode.Disposable[] = [];
    
    constructor(hostManager: LLMHostManager, connectionManager: LLMConnectionManager) {
        this.hostManager = hostManager;
        this.connectionManager = connectionManager;
        
        // Initialize with disconnected status
        this.currentStatus = {
            status: ConnectionStatus.Disconnected,
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
    
    private registerEventListeners(): void {
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
        let color: string | undefined;
        
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
        
        // Dispose all registered event listeners
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}
