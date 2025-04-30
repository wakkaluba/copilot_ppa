import * as vscode from 'vscode';
export declare class SecurityManager implements vscode.Disposable {
    private readonly context;
    private static instance;
    private panel?;
    private readonly logger;
    private readonly webviewService;
    private readonly scanService;
    private readonly statusBarItem;
    private readonly disposables;
    private lastResult?;
    private constructor();
    static getInstance(context: vscode.ExtensionContext): SecurityManager;
    private registerCommands;
    show(): Promise<void>;
    private registerWebviewMessageHandlers;
    private runScan;
    private updateWebviewContent;
    private showIssueDetails;
    private showErrorMessage;
    dispose(): void;
}
