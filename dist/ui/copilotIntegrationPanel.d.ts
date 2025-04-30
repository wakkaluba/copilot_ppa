import * as vscode from 'vscode';
/**
 * Panel that provides a webview interface for Copilot and LLM interactions
 */
export declare class CopilotIntegrationPanel implements vscode.Disposable {
    private readonly context;
    private static instance;
    private panel?;
    private readonly contentService;
    private readonly stateManager;
    private readonly connectionManager;
    private readonly messageHandler;
    private readonly disposables;
    private readonly logger;
    private constructor();
    static getInstance(context: vscode.ExtensionContext): CopilotIntegrationPanel;
    private setupListeners;
    show(): Promise<void>;
    private registerWebviewHandlers;
    private updateWebviewContent;
    private showErrorInWebview;
    dispose(): void;
}
