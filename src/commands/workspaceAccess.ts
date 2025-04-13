import * as vscode from 'vscode';

export class WorkspaceAccessManager {
    private static instance: WorkspaceAccessManager;
    private _isEnabled: boolean;
    private _statusBarItem: vscode.StatusBarItem;
    private _onDidChangeAccess: vscode.EventEmitter<boolean>;

    private constructor() {
        this._onDidChangeAccess = new vscode.EventEmitter<boolean>();
        this._isEnabled = vscode.workspace.getConfiguration('copilot-ppa').get('workspaceAccess.enabled', false);
        this._statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.updateStatusBar();
    }

    public static getInstance(): WorkspaceAccessManager {
        if (!WorkspaceAccessManager.instance) {
            WorkspaceAccessManager.instance = new WorkspaceAccessManager();
        }
        return WorkspaceAccessManager.instance;
    }

    public get onDidChangeAccess(): vscode.Event<boolean> {
        return this._onDidChangeAccess.event;
    }

    public async toggleAccess(): Promise<void> {
        this._isEnabled = !this._isEnabled;
        await vscode.workspace.getConfiguration('copilot-ppa').update(
            'workspaceAccess.enabled',
            this._isEnabled,
            vscode.ConfigurationTarget.Global
        );
        this.updateStatusBar();
        this._onDidChangeAccess.fire(this._isEnabled);
        await vscode.window.showInformationMessage(
            `Workspace access ${this._isEnabled ? 'enabled' : 'disabled'}`
        );
    }

    public isEnabled(): boolean {
        return this._isEnabled;
    }

    private updateStatusBar(): void {
        this._statusBarItem.text = `$(${this._isEnabled ? 'unlock' : 'lock'}) Workspace: ${
            this._isEnabled ? 'Enabled' : 'Disabled'
        }`;
        this._statusBarItem.tooltip = 'Click to toggle workspace access';
        this._statusBarItem.command = 'copilot-ppa.toggleWorkspaceAccess';
        this._statusBarItem.show();
    }

    public dispose(): void {
        this._statusBarItem.dispose();
        this._onDidChangeAccess.dispose();
    }
}
