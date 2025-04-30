import * as vscode from 'vscode';
export declare class SnippetCommands {
    static readonly createSnippetCommandId = "copilotPPA.createSnippet";
    static readonly insertSnippetCommandId = "copilotPPA.insertSnippet";
    static readonly manageSnippetsCommandId = "copilotPPA.manageSnippets";
    private readonly creationService;
    private readonly selectionService;
    private readonly insertionService;
    constructor(context: vscode.ExtensionContext);
    register(): vscode.Disposable[];
    private createSnippet;
    private insertSnippet;
    private manageSnippets;
}
