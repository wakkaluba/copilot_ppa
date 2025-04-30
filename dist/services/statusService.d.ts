import * as vscode from 'vscode';
export declare enum ConnectionStatus {
    Disconnected = "disconnected",
    Connecting = "connecting",
    Connected = "connected",
    Error = "error"
}
export interface StatusInfo {
    status: ConnectionStatus;
    message?: string;
    modelName?: string;
    providerName?: string;
}
/**
 * Service to track and notify about LLM connection status
 */
export declare class StatusService {
    private static instance;
    private _statusEventEmitter;
    private _currentStatus;
    private constructor();
    static getInstance(): StatusService;
    get onStatusChange(): vscode.Event<StatusInfo>;
    get currentStatus(): StatusInfo;
    updateStatus(status: StatusInfo): void;
    setConnecting(providerName: string): void;
    setConnected(providerName: string, modelName: string): void;
    setDisconnected(): void;
    setError(errorMessage: string, providerName?: string): void;
}
