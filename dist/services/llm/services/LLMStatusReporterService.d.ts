import * as vscode from 'vscode';
import { ConnectionState } from '../types';
export declare class StatusReporterService implements vscode.Disposable {
    private statusBarItem;
    constructor();
    updateStatusBar(state: ConnectionState, providerName?: string): void;
    dispose(): void;
}
