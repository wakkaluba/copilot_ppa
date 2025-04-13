import * as vscode from 'vscode';

export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error'
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
export class StatusService {
  private static instance: StatusService;
  private _statusEventEmitter = new vscode.EventEmitter<StatusInfo>();
  private _currentStatus: StatusInfo = { status: ConnectionStatus.Disconnected };

  private constructor() {}

  public static getInstance(): StatusService {
    if (!StatusService.instance) {
      StatusService.instance = new StatusService();
    }
    return StatusService.instance;
  }

  get onStatusChange(): vscode.Event<StatusInfo> {
    return this._statusEventEmitter.event;
  }

  get currentStatus(): StatusInfo {
    return this._currentStatus;
  }

  public updateStatus(status: StatusInfo): void {
    this._currentStatus = status;
    this._statusEventEmitter.fire(status);
  }

  public setConnecting(providerName: string): void {
    this.updateStatus({
      status: ConnectionStatus.Connecting,
      message: `Connecting to ${providerName}...`,
      providerName
    });
  }

  public setConnected(providerName: string, modelName: string): void {
    this.updateStatus({
      status: ConnectionStatus.Connected,
      message: `Connected to ${modelName} via ${providerName}`,
      providerName,
      modelName
    });
  }

  public setDisconnected(): void {
    this.updateStatus({
      status: ConnectionStatus.Disconnected,
      message: 'Disconnected from LLM'
    });
  }

  public setError(errorMessage: string, providerName?: string): void {
    this.updateStatus({
      status: ConnectionStatus.Error,
      message: `Error: ${errorMessage}`,
      providerName
    });
  }
}
