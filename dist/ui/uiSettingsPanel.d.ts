import * as vscode from 'vscode';
export declare class UISettingsPanel implements vscode.Disposable {
    private readonly context;
    private static instance;
    private readonly logger;
    private readonly webviewService;
    private panel?;
    private readonly disposables;
    private constructor();
    static getInstance(context: vscode.ExtensionContext): UISettingsPanel;
    show(): Promise<void>;
    private registerMessageHandlers;
    selectTab(tabName: string): void;
    private showErrorMessage;
    private getGeneralSettingsContent;
    private getAdvancedSettingsContent;
    private handleTabChange;
    private handleSettingUpdate;
    dispose(): void;
}
