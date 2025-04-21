import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMHostManager } from '../services/llm/LLMHostManager';
import { LLMConnectionManager } from '../services/llm/LLMConnectionManager';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface ConnectionStatus {
    state: ConnectionState;
    message?: string;
    error?: Error;
    lastUpdate: Date;
}

export class ConnectionStatusService extends EventEmitter implements vscode.Disposable {
    private _status: ConnectionStatus = {
        state: 'disconnected',
        lastUpdate: new Date()
    };
    private readonly _onStatusChanged = new vscode.EventEmitter<ConnectionState>();
    public readonly onStatusChanged = this._onStatusChanged.event;

    constructor(
        private readonly hostManager: LLMHostManager,
        private readonly connectionManager: LLMConnectionManager
    ) {
        super();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.hostManager.on('stateChanged', (state) => {
            this.updateFromHostState(state);
        });

        this.connectionManager.on('stateChanged', (state) => {
            this.updateFromConnectionState(state);
        });

        this.connectionManager.on('error', (error) => {
            this.setStatus('error', error.message, error);
        });
    }

    private updateFromHostState(hostState: string): void {
        switch (hostState) {
            case 'RUNNING':
                // Only update if we're not already connected
                if (this._status.state !== 'connected') {
                    this.setStatus('connecting', 'LLM host is running, establishing connection...');
                }
                break;
            case 'STOPPED':
                this.setStatus('disconnected', 'LLM host is stopped');
                break;
            case 'ERROR':
                this.setStatus('error', 'LLM host encountered an error');
                break;
        }
    }

    private updateFromConnectionState(connectionState: string): void {
        switch (connectionState) {
            case 'CONNECTED':
                this.setStatus('connected', 'Connected to LLM service');
                break;
            case 'CONNECTING':
                this.setStatus('connecting', 'Establishing connection to LLM service...');
                break;
            case 'DISCONNECTED':
                this.setStatus('disconnected', 'Disconnected from LLM service');
                break;
            case 'ERROR':
                this.setStatus('error', 'Connection error');
                break;
        }
    }

    public setStatus(
        state: ConnectionState,
        message?: string,
        error?: Error
    ): void {
        this._status = {
            state,
            message,
            error,
            lastUpdate: new Date()
        };
        
        this._onStatusChanged.fire(state);
        this.emit('statusChanged', this._status);
    }

    public get status(): ConnectionState {
        return this._status.state;
    }

    public getFullStatus(): ConnectionStatus {
        return { ...this._status };
    }

    dispose(): void {
        this._onStatusChanged.dispose();
        this.removeAllListeners();
    }
}
