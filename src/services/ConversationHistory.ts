import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    created: number;
    updated: number;
}

export class ConversationHistory {
    private static instance: ConversationHistory;
    private conversations: Map<string, Conversation> = new Map();
    private storageDir: string;

    private constructor(context: vscode.ExtensionContext) {
        this.storageDir = path.join(context.globalStorageUri.fsPath, 'conversations');
    }

    static getInstance(context: vscode.ExtensionContext): ConversationHistory {
        if (!ConversationHistory.instance) {
            ConversationHistory.instance = new ConversationHistory(context);
        }
        return ConversationHistory.instance;
    }

    async initialize(): Promise<void> {
        try {
            await fs.mkdir(this.storageDir, { recursive: true });
            await this.loadConversations();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize conversation history: ${error}`);
        }
    }

    async createConversation(title: string): Promise<Conversation> {
        const conversation: Conversation = {
            id: Date.now().toString(),
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
        this.conversations.set(conversation.id, conversation);
        await this.saveConversation(conversation);
        return conversation;
    }

    async addMessage(conversationId: string, message: ChatMessage): Promise<void> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation not found: ${conversationId}`);
        }

        conversation.messages.push(message);
        conversation.updated = Date.now();
        await this.saveConversation(conversation);
    }

    getConversation(id: string): Conversation | undefined {
        return this.conversations.get(id);
    }

    getAllConversations(): Conversation[] {
        return Array.from(this.conversations.values());
    }

    private async loadConversations(): Promise<void> {
        try {
            const files = await fs.readdir(this.storageDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const content = await fs.readFile(path.join(this.storageDir, file), 'utf-8');
                    const conversation = JSON.parse(content) as Conversation;
                    this.conversations.set(conversation.id, conversation);
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load conversations: ${error}`);
        }
    }

    private async saveConversation(conversation: Conversation): Promise<void> {
        try {
            const filePath = path.join(this.storageDir, `${conversation.id}.json`);
            await fs.writeFile(filePath, JSON.stringify(conversation, null, 2), 'utf-8');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to save conversation: ${error}`);
        }
    }
}
