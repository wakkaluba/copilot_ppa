import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ChatMessage, Conversation } from '../types/conversation';

export class ConversationHistory extends EventEmitter implements vscode.Disposable {
    private conversations: Map<string, Conversation> = new Map();
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        super();
        this.context = context;
        this.loadFromStorage();
    }

    private async loadFromStorage(): Promise<void> {
        const storedConversations = this.context.globalState.get<Conversation[]>('conversationHistory', []);
        storedConversations.forEach(conversation => {
            this.conversations.set(conversation.id, conversation);
        });
    }

    private async saveToStorage(): Promise<void> {
        const conversationsArray = Array.from(this.conversations.values());
        await this.context.globalState.update('conversationHistory', conversationsArray);
    }

    async createConversation(title: string): Promise<Conversation> {
        const id = `conversation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const conversation: Conversation = {
            id,
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
        
        this.conversations.set(id, conversation);
        await this.saveToStorage();
        
        this.emit('conversationCreated', conversation);
        return conversation;
    }

    getConversation(id: string): Conversation | undefined {
        return this.conversations.get(id);
    }

    getAllConversations(): Conversation[] {
        return Array.from(this.conversations.values());
    }

    async addMessage(conversationId: string, message: ChatMessage): Promise<void> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        
        conversation.messages.push(message);
        conversation.updated = Date.now();
        
        await this.saveToStorage();
        this.emit('messageAdded', conversationId, message);
    }

    async updateConversationTitle(conversationId: string, title: string): Promise<void> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        
        conversation.title = title;
        conversation.updated = Date.now();
        
        await this.saveToStorage();
        this.emit('conversationUpdated', conversation);
    }

    async deleteConversation(conversationId: string): Promise<void> {
        if (!this.conversations.has(conversationId)) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        
        this.conversations.delete(conversationId);
        await this.saveToStorage();
        
        this.emit('conversationDeleted', conversationId);
    }

    async clearAllConversations(): Promise<void> {
        this.conversations.clear();
        await this.saveToStorage();
        
        this.emit('historyCleared');
    }

    async searchConversations(query: string): Promise<Conversation[]> {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.conversations.values()).filter(conversation => {
            // Search in title
            if (conversation.title.toLowerCase().includes(lowerQuery)) {
                return true;
            }
            
            // Search in messages
            return conversation.messages.some(message => 
                message.content.toLowerCase().includes(lowerQuery)
            );
        });
    }

    async exportConversation(conversationId: string): Promise<string> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        
        return JSON.stringify(conversation, null, 2);
    }

    async importConversation(jsonData: string): Promise<Conversation> {
        try {
            const conversation = JSON.parse(jsonData) as Conversation;
            
            // Validate required fields
            if (!conversation.id || !conversation.title) {
                throw new Error('Invalid conversation data: missing required fields');
            }
            
            // Generate a new ID to avoid conflicts
            const newId = `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            conversation.id = newId;
            
            // Set timestamps if missing
            if (!conversation.created) {
                conversation.created = Date.now();
            }
            
            if (!conversation.updated) {
                conversation.updated = Date.now();
            }
            
            // Ensure messages array exists
            if (!Array.isArray(conversation.messages)) {
                conversation.messages = [];
            }
            
            this.conversations.set(newId, conversation);
            await this.saveToStorage();
            
            this.emit('conversationImported', conversation);
            return conversation;
        } catch (error) {
            throw new Error(`Failed to import conversation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    dispose(): void {
        this.removeAllListeners();
    }
}
