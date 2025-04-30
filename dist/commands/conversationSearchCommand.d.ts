import * as vscode from 'vscode';
export declare class ConversationSearchCommand {
    static readonly commandId = "copilotPPA.searchConversations";
    private conversationManager;
    private searchService;
    constructor(context: vscode.ExtensionContext);
    register(): vscode.Disposable;
    private executeSearch;
    private getSearchOptions;
    private showSearchResults;
}
