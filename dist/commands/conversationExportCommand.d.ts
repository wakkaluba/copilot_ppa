import * as vscode from 'vscode';
export declare class ConversationExportCommand {
    static readonly commandId = "copilotPPA.exportConversation";
    static readonly exportAllCommandId = "copilotPPA.exportAllConversations";
    private readonly exportService;
    private readonly fileDialogService;
    private readonly selectionService;
    constructor(context: vscode.ExtensionContext);
    register(): vscode.Disposable[];
    private exportConversation;
    private exportAllConversations;
}
