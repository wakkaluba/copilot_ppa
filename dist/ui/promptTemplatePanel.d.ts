import * as vscode from 'vscode';
export declare class PromptTemplatePanel {
    static readonly viewType = "copilotPPA.promptTemplatePanel";
    private readonly _panel;
    private _disposables;
    static createOrShow(extensionUri: vscode.Uri): PromptTemplatePanel;
    private constructor();
    private _update;
    show(uri: vscode.Uri): void;
    private handleMessage;
    dispose(): void;
}
