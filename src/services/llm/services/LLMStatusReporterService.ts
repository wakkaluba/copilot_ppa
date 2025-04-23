import * as vscode from 'vscode';
import { ConnectionState } from '../types';

export class StatusReporterService implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    }

    public updateStatusBar(state: ConnectionState, providerName?: string): void {
        const displayName = providerName || 'LLM';
        switch (state) {
            case 'connected':
                this.statusBarItem.text = `$(check) ${displayName}`;
                this.statusBarItem.show();
                break;
            case 'connecting':
                this.statusBarItem.text = `$(sync~spin) ${displayName}`;
                this.statusBarItem.show();
                break;
            case 'disconnected':
                this.statusBarItem.text = `$(circle-slash) ${displayName}`;
                this.statusBarItem.show();
                break;
            case 'error':
                this.statusBarItem.text = `$(error) ${displayName}`;
                this.statusBarItem.show();
                break;
            default:
                this.statusBarItem.hide();
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}