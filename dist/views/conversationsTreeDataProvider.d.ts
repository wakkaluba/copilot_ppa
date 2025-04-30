import * as vscode from 'vscode';
import { ConversationManager, Conversation } from '../services/conversationManager';
export declare class ConversationsTreeDataProvider implements vscode.TreeDataProvider<ConversationTreeItem> {
    private conversationManager;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<ConversationTreeItem | undefined>;
    constructor(conversationManager: ConversationManager);
    getTreeItem(element: ConversationTreeItem): vscode.TreeItem;
    getChildren(element?: ConversationTreeItem): Thenable<ConversationTreeItem[]>;
    refresh(): void;
}
declare class ConversationTreeItem extends vscode.TreeItem {
    readonly conversation: Conversation;
    constructor(conversation: Conversation);
}
export {};
