import * as vscode from 'vscode';
export declare class RepositoryPanelUIService implements vscode.Disposable {
    private readonly panel;
    private readonly _disposables;
    constructor(panel: vscode.WebviewPanel);
    update(extensionUri: vscode.Uri): void;
    private getWebviewContent;
    private generateNonce;
    dispose(): void;
}
