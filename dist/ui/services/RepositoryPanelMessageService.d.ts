import * as vscode from 'vscode';
export declare class RepositoryPanelMessageService implements vscode.Disposable {
    private readonly webview;
    private readonly _disposables;
    private readonly _listeners;
    constructor(webview: vscode.Webview);
    private handleMessage;
    onCreateRepository(callback: (provider: string, name: string, description: string, isPrivate: boolean) => Promise<void>): void;
    onToggleAccess(callback: (enabled: boolean) => void): void;
    postMessage(message: Record<string, unknown>): Promise<boolean>;
    dispose(): void;
}
