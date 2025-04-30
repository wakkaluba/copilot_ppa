import * as vscode from 'vscode';
export declare class ContextMenuManager {
    constructor(context: vscode.ExtensionContext);
    private explainCodeHandler;
    private improveCodeHandler;
    private generateTestsHandler;
}
