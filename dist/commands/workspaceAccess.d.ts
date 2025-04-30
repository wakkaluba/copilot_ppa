import * as vscode from 'vscode';
export declare class WorkspaceAccessManager {
    private static instance;
    private _isEnabled;
    private _statusBarItem;
    private _onDidChangeAccess;
    private constructor();
    static getInstance(): WorkspaceAccessManager;
    get onDidChangeAccess(): vscode.Event<boolean>;
    toggleAccess(): Promise<void>;
    isEnabled(): boolean;
    private updateStatusBar;
    dispose(): void;
}
