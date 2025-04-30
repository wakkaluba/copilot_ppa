import * as vscode from 'vscode';
export declare class VectorDatabasePanel {
    static readonly viewType = "copilotPPA.vectorDatabasePanel";
    private readonly _panel;
    private _disposables;
    static createOrShow(extensionUri: vscode.Uri): VectorDatabasePanel;
    private constructor();
    private _update;
    private _getHtmlForWebview;
    dispose(): void;
}
