import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ChatMessage, Conversation, Chapter } from './types';

export class ConversationHistory extends EventEmitter implements vscode.Disposable {
    private conversations: Map<string, Conversation> = new Map();
    private chapters: Map<string, Chapter> = new Map();
    private context: vscode.ExtensionContext;
    private mainObjectivesFile: string = 'project-objectives.json';
    private storageDir: string;

    constructor(context: vscode.ExtensionContext) {
        super();
        this.context = context;
        this.storageDir = path.join(context.globalStorageUri.fsPath, 'conversations');
        this.ensureStorageDirectory();
        this.loadFromStorage();
    }

    private ensureStorageDirectory(): void {
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }

    private getConversationFilePath(id: string): string {
        return path.join(this.storageDir, `${id}.json`);
    }

    private async loadFromStorage(): Promise<void> {
        // Load chapters from global state
        const storedChapters = this.context.globalState.get<Chapter[]>('conversationChapters', []);
        storedChapters.forEach(chapter => {
            this.chapters.set(chapter.id, chapter);
        });

        // Load conversations from files
        try {
            const files = fs.readdirSync(this.storageDir);
            for (const file of files) {
                if (file.endsWith('.json') && !file.includes('objectives')) {
                    const filePath = path.join(this.storageDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const conversation = JSON.parse(content) as Conversation;
                    this.conversations.set(conversation.id, conversation);
                }
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    private async saveConversationToFile(conversation: Conversation): Promise<void> {
        const filePath = this.getConversationFilePath(conversation.id);
        try {
            fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2));
        } catch (error) {
            console.error(`Error saving conversation ${conversation.id}:`, error);
            throw new Error(`Failed to save conversation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async deleteConversationFile(conversationId: string): Promise<void> {
        const filePath = this.getConversationFilePath(conversationId);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error(`Error deleting conversation ${conversationId}:`, error);
            throw new Error(`Failed to delete conversation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async createChapter(title: string, description?: string): Promise<Chapter> {
        const id = `chapter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const chapter: Chapter = {
            id,
            title,
            description,
            created: Date.now(),
            updated: Date.now(),
            conversationIds: []
        };

        this.chapters.set(id, chapter);
        await this.saveToStorage();
        this.emit('chapterCreated', chapter);
        return chapter;
    }

    async addConversationToChapter(conversationId: string, chapterId: string): Promise<void> {
        const chapter = this.chapters.get(chapterId);
        if (!chapter) {
            throw new Error(`Chapter with ID ${chapterId} not found`);
        }

        if (!this.conversations.has(conversationId)) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }

        if (!chapter.conversationIds.includes(conversationId)) {
            chapter.conversationIds.push(conversationId);
            chapter.updated = Date.now();
            await this.saveToStorage();
            this.emit('conversationAddedToChapter', { conversationId, chapterId });
        }
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
        await this.saveConversationToFile(conversation);
        
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
        
        await this.saveConversationToFile(conversation);
        this.emit('messageAdded', conversationId, message);
    }

    async updateConversationTitle(conversationId: string, title: string): Promise<void> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        
        conversation.title = title;
        conversation.updated = Date.now();
        
        await this.saveConversationToFile(conversation);
        this.emit('conversationUpdated', conversation);
    }

    async deleteConversation(conversationId: string): Promise<void> {
        if (!this.conversations.has(conversationId)) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        
        await this.deleteConversationFile(conversationId);
        this.conversations.delete(conversationId);
        
        this.emit('conversationDeleted', conversationId);
    }

    async clearAllConversations(): Promise<void> {
        for (const conversation of this.conversations.values()) {
            await this.deleteConversationFile(conversation.id);
        }
        
        this.conversations.clear();
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
            await this.saveConversationToFile(conversation);
            
            this.emit('conversationImported', conversation);
            return conversation;
        } catch (error) {
            throw new Error(`Failed to import conversation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async forgetMessage(conversationId: string, messageId: string): Promise<void> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }

        const index = conversation.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            conversation.messages.splice(index, 1);
            conversation.updated = Date.now();
            await this.saveConversationToFile(conversation);
            this.emit('messageRemoved', { conversationId, messageId });
        }
    }

    async updateProjectObjectives(objectives: string[]): Promise<void> {
        await this.context.globalState.update(this.mainObjectivesFile, objectives);
        this.emit('projectObjectivesUpdated', objectives);
    }

    async getProjectObjectives(): Promise<string[]> {
        return this.context.globalState.get<string[]>(this.mainObjectivesFile, []);
    }

    async addMessageReference(messageId: string, referenceMessageId: string): Promise<void> {
        let found = false;
        for (const conversation of this.conversations.values()) {
            const message = conversation.messages.find(m => m.id === messageId);
            if (message) {
                if (!message.references) {
                    message.references = [];
                }
                if (!message.references.includes(referenceMessageId)) {
                    message.references.push(referenceMessageId);
                    conversation.updated = Date.now();
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            throw new Error(`Message with ID ${messageId} not found`);
        }

        await this.saveToStorage();
        this.emit('messageReferenceAdded', { messageId, referenceMessageId });
    }

    getAllChapters(): Chapter[] {
        return Array.from(this.chapters.values());
    }

    getChapter(id: string): Chapter | undefined {
        return this.chapters.get(id);
    }

    async deleteChapter(chapterId: string): Promise<void> {
        if (!this.chapters.has(chapterId)) {
            throw new Error(`Chapter with ID ${chapterId} not found`);
        }
        
        this.chapters.delete(chapterId);
        await this.saveToStorage();
        
        this.emit('chapterDeleted', chapterId);
    }

    dispose(): void {
        this.removeAllListeners();
    }
}
