import { EventEmitter } from 'events';
export declare enum ConnectionState {
    Connected = "connected",
    Connecting = "connecting",
    Disconnected = "disconnected",
    Error = "error"
}
export interface ConnectionStatus {
    state: ConnectionState;
    error?: Error;
    metadata?: Record<string, any>;
}
export declare class ConnectionStatusService extends EventEmitter {
    private currentState;
    private currentError?;
    private metadata;
    constructor();
    getState(): ConnectionState;
    setState(state: ConnectionState, metadata?: Record<string, any>): void;
    setError(error: Error): void;
    clearError(): void;
    getError(): Error | undefined;
    showNotification(message: string, type?: 'info' | 'warning' | 'error'): void;
    updateMetadata(metadata: Record<string, any>): void;
    clearMetadata(): void;
    getMetadata(): Record<string, any>;
    dispose(): void;
}
