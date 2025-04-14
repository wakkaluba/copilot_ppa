import * as vscode from 'vscode';
import { ConversationManager, Conversation } from '../services/conversationManager';

export class ConversationsTreeDataProvider implements vscode.TreeDataProvider<ConversationTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ConversationTreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    
    constructor(private conversationManager: ConversationManager) {
        // Listen to conversation changes
        this.conversationManager.onConversationChanged(() => this.refresh());
        this.conversationManager.onConversationAdded(() => this.refresh());
        this.conversationManager.onConversationRemoved(() => this.refresh());
        this.conversationManager.onConversationsImported(() => this.refresh());
    }
    
    getTreeItem(element: ConversationTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ConversationTreeItem): Thenable<ConversationTreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return this.conversationManager.getConversations().then(conversations => {
                return conversations.map(conversation => new ConversationTreeItem(conversation));
            });
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}

class ConversationTreeItem extends vscode.TreeItem {
    constructor(public readonly conversation: Conversation) {
        super(conversation.title, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${this.conversation.title}`;
        this.description = this.conversation.description;
    }
}