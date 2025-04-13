import * as vscode from 'vscode';

export class LLMStatusBar {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
    }

    public show(): void {
        this.statusBarItem.show();
    }

    public hide(): void {
        this.statusBarItem.hide();
    }

    public updateStatus(connected: boolean, modelName?: string): void {
        if (connected) {
            this.statusBarItem.text = `$(check) LLM: ${modelName || 'Connected'}`;
            this.statusBarItem.tooltip = 'Connected to LLM';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.successBackground');
        } else {
            this.statusBarItem.text = '$(error) LLM: Disconnected';
            this.statusBarItem.tooltip = 'Not connected to LLM';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
