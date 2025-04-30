import * as vscode from 'vscode';
export declare class RepositoryPanel implements vscode.Disposable {
    private readonly context;
    private static instance;
    private panel?;
    private readonly webviewService;
    private readonly disposables;
    private readonly logger;
    private constructor();
    static getInstance(context: vscode.ExtensionContext): RepositoryPanel;
    show(): Promise<void>;
    private updateWebviewContent;
    private registerMessageHandlers;
    private refreshRepository;
    private showBranches;
    private showCommits;
    private showErrorInWebview;
    dispose(): void;
}
