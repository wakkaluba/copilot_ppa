import * as vscode from 'vscode';
export declare class RepositoryManager {
    private static instance;
    private _isEnabled;
    private _statusBarItem;
    private _onDidChangeAccess;
    private constructor();
    static getInstance(): RepositoryManager;
    get onDidChangeAccess(): vscode.Event<boolean>;
    toggleAccess(): Promise<void>;
    isEnabled(): boolean;
    private updateStatusBar;
    dispose(): void;
    createNewRepository(): Promise<void>;
    private getRepositoryOptions;
    private initializeGitRepository;
}
