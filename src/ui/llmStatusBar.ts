import * as vscode from 'vscode';

export class LLMStatusBar {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.show();
    }

    public updateStatus(connected: boolean, modelName?: string) {
        if (connected) {
            this.statusBarItem.text = `$(check) LLM: ${modelName || 'Connected'}`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.successBackground');
        } else {
            this.statusBarItem.text = '$(error) LLM: Disconnected';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        }
        this.statusBarItem.tooltip = `LLM Connection Status${modelName ? ': ' + modelName : ''}`;
    }

    public dispose() {
        this.statusBarItem.dispose();
    }
}
