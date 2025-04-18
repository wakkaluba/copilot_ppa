import * as vscode from 'vscode';
import { WorkspaceManager } from './WorkspaceManager';
import { ChatMessage, Conversation } from '../types/conversation';

export class ConversationManager {
    private static instance: ConversationManager;
    private workspaceManager: WorkspaceManager;
    private currentConversation: Conversation | null = null;
    private historyPath = 'conversations';

    private constructor() {
        this.workspaceManager = WorkspaceManager.getInstance();
    }

    static getInstance(): ConversationManager {
        if (!this.instance) {
            this.instance = new ConversationManager();
        }
        return this.instance;
    }

    async startNewConversation(title: string): Promise<void> {
        await this.saveCurrentConversation();
        this.currentConversation = {
            id: this.generateId(),
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
    }

    async addMessage(role: 'user' | 'assistant' | 'system', content: string): Promise<void> {
        if (!this.currentConversation) {
            await this.startNewConversation('New Conversation');
        }

        const message: ChatMessage = {
            role,
            content,
            timestamp: Date.now()
        };

        this.currentConversation!.messages.push(message);
        this.currentConversation!.updated = Date.now();
        await this.autoSave();
    }

    async loadConversation(id: string): Promise<boolean> {
        try {
            const filePath = `${this.historyPath}/${id}.json`;
            const content = await this.workspaceManager.readFile(filePath);
            this.currentConversation = JSON.parse(content);
            return true;
        } catch {
            return false;
        }
    }

    async listConversations(): Promise<Array<{ id: string; title: string; updated: number }>> {
        try {
            const files = await this.workspaceManager.listFiles(this.historyPath);
            const conversations = await Promise.all(
                files.map(async (file) => {
                    const content = await this.workspaceManager.readFile(file);
                    const conv = JSON.parse(content);
                    return {
                        id: conv.id,
                        title: conv.title,
                        updated: conv.updated
                    };
                })
            );
            return conversations.sort((a, b) => b.updated - a.updated);
        } catch {
            return [];
        }
    }

    getCurrentContext(maxMessages: number = 10): ChatMessage[] {
        if (!this.currentConversation) return [];
        return this.currentConversation.messages.slice(-maxMessages);
    }

    private async autoSave(): Promise<void> {
        if (this.currentConversation) {
            await this.saveCurrentConversation();
        }
    }

    private async saveCurrentConversation(): Promise<void> {
        if (!this.currentConversation) return;

        const filePath = `${this.historyPath}/${this.currentConversation.id}.json`;
        await this.workspaceManager.createDirectory(this.historyPath);
        await this.workspaceManager.writeFile(
            filePath,
            JSON.stringify(this.currentConversation, null, 2)
        );
    }

    private generateId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
}
