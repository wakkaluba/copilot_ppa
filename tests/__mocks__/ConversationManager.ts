import { Conversation } from '../../src/types';

export class ConversationManager {
    private static instance: ConversationManager;
    private conversations: Map<string, Conversation> = new Map();

    public static getInstance(): ConversationManager {
        if (!ConversationManager.instance) {
            ConversationManager.instance = new ConversationManager();
        }
        return ConversationManager.instance;
    }

    public async startNewConversation(title: string): Promise<{ id: string }> {
        const id = `conv-${Date.now()}`;
        this.conversations.set(id, {
            id,
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        });
        return { id };
    }

    public async listConversations(): Promise<Array<{ id: string; title: string; updated: number }>> {
        return Array.from(this.conversations.values()).map(conv => ({
            id: conv.id,
            title: conv.title,
            updated: conv.updated
        }));
    }

    public getConversation(id: string): Conversation | undefined {
        return this.conversations.get(id);
    }

    public dispose(): void {
        this.conversations.clear();
    }
}