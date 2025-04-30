import * as vscode from 'vscode';
export declare class ConversationImportCommand {
    static readonly commandId = "copilotPPA.importConversation";
    private conversationManager;
    constructor(context: vscode.ExtensionContext);
    register(): vscode.Disposable;
    private importConversation;
    private getOpenFilePath;
    private shouldReplaceExisting;
}
