import * as vscode from 'vscode';
import { BaseConnectionManager } from './BaseConnectionManager';
export declare class ConnectionUIManager implements vscode.Disposable {
    private readonly statusService;
    private readonly modelInfoService;
    private readonly detailsService;
    private readonly disposables;
    private connectionManager?;
    constructor();
    setConnectionManager(manager: BaseConnectionManager): void;
    private subscribeToEvents;
    private updateUI;
    private registerCommands;
    private handleToggleConnection;
    private handleConfigure;
    private showConnectionDetails;
    dispose(): void;
}
