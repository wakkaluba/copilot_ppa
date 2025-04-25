import * as vscode from 'vscode';
import { ConnectionState, ConnectionStatusService } from '../../src/status/connectionStatusService';
import { EventEmitter } from 'events';

/**
 * Mock ConnectionStatusService for testing
 */
export class MockConnectionStatusService extends EventEmitter implements ConnectionStatusService {
    private _state: ConnectionState = ConnectionState.Disconnected;
    private _activeModelName: string = '';
    private _providerName: string = '';
    private _statusBarItem: vscode.StatusBarItem;

    constructor() {
        super();
        this._statusBarItem = {
            id: 'mock-status-bar',
            name: 'Mock Status Bar',
            tooltip: '',
            text: '',
            command: undefined,
            color: undefined,
            backgroundColor: undefined,
            alignment: vscode.StatusBarAlignment.Left,
            priority: 0,
            accessibilityInformation: { label: 'Mock Status', role: 'Status' },
            show: () => {},
            hide: () => {},
            dispose: () => {}
        };
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
        
        this.emit('stateChanged', state, info);
    }

    /**
     * Shows a notification to the user
     * @param message Message to show
     * @param type Notification type (info, warning, error)
     */
    public showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
        // No-op in mock implementation
    }

    /**
     * Event emitted when the connection state changes
     */
    public readonly onDidChangeState = this.event;

    /**
     * Creates an event listener
     */
    private get event(): vscode.Event<ConnectionState> {
        return (listener: (e: ConnectionState) => any) => {
            this.on('stateChanged', listener);
            
            // Return a disposable to remove the listener
            return {
                dispose: () => {
                    this.off('stateChanged', listener);
                }
            };
        };
    }

    /**
     * Disposes of resources
     */
    public dispose(): void {
        this.removeAllListeners();
        this._statusBarItem.dispose();
    }
}