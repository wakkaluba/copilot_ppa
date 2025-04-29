import { EventEmitter } from 'events';

export enum ConnectionState {
    Connected = 'connected',
    Connecting = 'connecting',
    Disconnected = 'disconnected',
    Error = 'error'
}

export interface ConnectionStatus {
    state: ConnectionState;
    error?: Error;
    metadata?: Record<string, any>;
}

export class ConnectionStatusService extends EventEmitter {
    private currentState: ConnectionState = ConnectionState.Disconnected;
    private currentError?: Error;
    private metadata: Record<string, any> = {};

    constructor() {
        super();
        // Start emitting periodic heartbeat events
        setInterval(() => {
            this.emit('heartbeat', {
                state: this.currentState,
                metadata: this.metadata,
                timestamp: new Date()
            });
        }, 60000); // Every minute
    }

    public getState(): ConnectionState {
        return this.currentState;
    }

    public setState(state: ConnectionState, metadata?: Record<string, any>): void {
        const previousState = this.currentState;
        this.currentState = state;
        
        if (metadata) {
            this.metadata = { ...this.metadata, ...metadata };
        }

        if (state === ConnectionState.Connected) {
            this.clearError();
        }

        this.emit('stateChanged', {
            previousState,
            currentState: state,
            metadata: this.metadata,
            timestamp: new Date()
        });
    }

    public setError(error: Error): void {
        this.currentError = error;
        this.setState(ConnectionState.Error);
        this.emit('error', {
            error,
            metadata: this.metadata,
            timestamp: new Date()
        });
    }

    public clearError(): void {
        if (this.currentError) {
            this.currentError = undefined;
            this.emit('errorCleared', {
                metadata: this.metadata,
                timestamp: new Date()
            });
        }
    }

    public getError(): Error | undefined {
        return this.currentError;
    }

    public showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
        this.emit('notification', {
            message,
            type,
            metadata: this.metadata,
            timestamp: new Date()
        });
    }

    public updateMetadata(metadata: Record<string, any>): void {
        this.metadata = { ...this.metadata, ...metadata };
        this.emit('metadataChanged', {
            metadata: this.metadata,
            timestamp: new Date()
        });
    }

    public clearMetadata(): void {
        this.metadata = {};
        this.emit('metadataCleared', {
            timestamp: new Date()
        });
    }

    public getMetadata(): Record<string, any> {
        return { ...this.metadata };
    }

    public dispose(): void {
        this.removeAllListeners();
    }
}
