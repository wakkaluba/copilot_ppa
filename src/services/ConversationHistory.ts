import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Logger } from './logger';
import { EventEmitter } from 'events';
import { validate as validateUUID } from 'uuid';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

export interface ConversationMetadata {
    tags?: string[];
    model?: string;
    context?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    created: number;
    updated: number;
    metadata?: ConversationMetadata;
}

export class ConversationError extends Error {
    constructor(public code: string, message: string) {
        super(message);
        this.name = 'ConversationError';
    }
}

interface IConversationEvents {
    'conversation:created': (conversation: Conversation) => void;
    'conversation:updated': (conversation: Conversation) => void;
    'conversation:deleted': (id: string) => void;
    'message:added': (conversationId: string, message: ChatMessage) => void;
}

export class ConversationHistory extends EventEmitter {
    on<U extends keyof IConversationEvents>(event: U, listener: IConversationEvents[U]): this;
    emit<U extends keyof IConversationEvents>(event: U, ...args: Parameters<IConversationEvents[U]>): boolean;
    
    private static instance: ConversationHistory;
    private conversations: Map<string, Conversation> = new Map();
    private storageDir: string;
    private readonly logger = new Logger('ConversationHistory');
    private initialized = false;

    private constructor(context: vscode.ExtensionContext) {
        super();
        this.storageDir = path.join(context.globalStorageUri.fsPath, 'conversations');
    }

    static getInstance(context: vscode.ExtensionContext): ConversationHistory {
        if (!ConversationHistory.instance) {
            ConversationHistory.instance = new ConversationHistory(context);
        }
        return ConversationHistory.instance;
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            await fs.mkdir(this.storageDir, { recursive: true });
            await this.loadConversations();
            this.initialized = true;
            this.logger.info('Conversation history initialized');
        } catch (error) {
            this.logger.error('Failed to initialize conversation history:', error);
            throw new ConversationError('init_failed', `Failed to initialize: ${error.message}`);
        }
    }

    async createConversation(title: string, metadata?: ConversationMetadata): Promise<Conversation> {
        if (!this.initialized) {
            throw new ConversationError('not_initialized', 'ConversationHistory not initialized');
        }

        this.validateTitle(title);

        const conversation: Conversation = {
            id: this.generateId(),
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now(),
            metadata
        };

        this.conversations.set(conversation.id, conversation);
        await this.saveConversation(conversation);
        this.emit('conversation:created', conversation);
        this.logger.info(`Created conversation ${conversation.id}: ${title}`);
        return conversation;
    }

    async addMessage(conversationId: string, message: ChatMessage): Promise<void> {
        if (!this.initialized) {
            throw new ConversationError('not_initialized', 'ConversationHistory not initialized');
        }

        const conversation = this.getConversationOrThrow(conversationId);
        this.validateMessage(message);

        conversation.messages.push(message);
        conversation.updated = Date.now();
        await this.saveConversation(conversation);
        
        this.emit('message:added', conversationId, message);
        this.emit('conversation:updated', conversation);
        this.logger.info(`Added message to conversation ${conversationId}`);
    }

    getConversation(id: string): Conversation | undefined {
        return this.conversations.get(id);
    }

    getAllConversations(): Conversation[] {
        return Array.from(this.conversations.values())
            .sort((a, b) => b.updated - a.updated);
    }

    async deleteConversation(id: string): Promise<void> {
        if (!this.initialized) {
            throw new ConversationError('not_initialized', 'ConversationHistory not initialized');
        }

        const conversation = this.getConversationOrThrow(id);
        
        try {
            const filePath = this.getConversationPath(id);
            await fs.unlink(filePath);
            this.conversations.delete(id);
            this.emit('conversation:deleted', id);
            this.logger.info(`Deleted conversation ${id}`);
        } catch (error) {
            this.logger.error(`Failed to delete conversation ${id}:`, error);
            throw new ConversationError('delete_failed', `Failed to delete conversation: ${error.message}`);
        }
    }

    async searchConversations(query: string): Promise<Conversation[]> {
        const normalizedQuery = query.toLowerCase();
        return this.getAllConversations()
            .filter(conv => {
                const titleMatch = conv.title.toLowerCase().includes(normalizedQuery);
                const contentMatch = conv.messages.some(msg => 
                    msg.content.toLowerCase().includes(normalizedQuery)
                );
                const tagMatch = conv.metadata?.tags?.some(tag =>
                    tag.toLowerCase().includes(normalizedQuery)
                );
                return titleMatch || contentMatch || tagMatch;
            });
    }

    async exportConversation(id: string, format: 'json' | 'markdown' = 'json'): Promise<string> {
        const conversation = this.getConversationOrThrow(id);

        if (format === 'markdown') {
            return this.convertToMarkdown(conversation);
        }
        
        return JSON.stringify(conversation, null, 2);
    }

    async importConversation(data: string, format: 'json' | 'markdown' = 'json'): Promise<Conversation> {
        try {
            let conversation: Conversation;
            
            if (format === 'json') {
                conversation = this.validateConversation(JSON.parse(data));
            } else {
                conversation = this.parseMarkdown(data);
            }

            // Ensure unique ID
            conversation.id = this.generateId();
            
            this.conversations.set(conversation.id, conversation);
            await this.saveConversation(conversation);
            this.emit('conversation:created', conversation);
            
            return conversation;
        } catch (error) {
            throw new ConversationError('import_failed', `Failed to import conversation: ${error.message}`);
        }
    }

    private async loadConversations(): Promise<void> {
        try {
            const files = await fs.readdir(this.storageDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const content = await fs.readFile(path.join(this.storageDir, file), 'utf-8');
                    const conversation = this.validateConversation(JSON.parse(content));
                    this.conversations.set(conversation.id, conversation);
                }
            }
            this.logger.info(`Loaded ${this.conversations.size} conversations`);
        } catch (error) {
            this.logger.error('Failed to load conversations:', error);
            throw new ConversationError('load_failed', `Failed to load conversations: ${error.message}`);
        }
    }

    private async saveConversation(conversation: Conversation): Promise<void> {
        try {
            const filePath = this.getConversationPath(conversation.id);
            await fs.writeFile(filePath, JSON.stringify(conversation, null, 2), 'utf-8');
        } catch (error) {
            this.logger.error(`Failed to save conversation ${conversation.id}:`, error);
            throw new ConversationError('save_failed', `Failed to save conversation: ${error.message}`);
        }
    }

    private getConversationPath(id: string): string {
        return path.join(this.storageDir, `${id}.json`);
    }

    private getConversationOrThrow(id: string): Conversation {
        const conversation = this.conversations.get(id);
        if (!conversation) {
            throw new ConversationError('not_found', `Conversation not found: ${id}`);
        }
        return conversation;
    }

    private validateTitle(title: string): void {
        if (!title || title.trim().length === 0) {
            throw new ConversationError('invalid_title', 'Title cannot be empty');
        }
        if (title.length > 100) {
            throw new ConversationError('invalid_title', 'Title cannot be longer than 100 characters');
        }
    }

    private validateMessage(message: ChatMessage): void {
        if (!message.content || message.content.trim().length === 0) {
            throw new ConversationError('invalid_message', 'Message content cannot be empty');
        }
        if (!['user', 'assistant', 'system'].includes(message.role)) {
            throw new ConversationError('invalid_message', 'Invalid message role');
        }
        if (!message.timestamp || typeof message.timestamp !== 'number') {
            throw new ConversationError('invalid_message', 'Invalid message timestamp');
        }
    }

    private validateConversation(data: unknown): Conversation {
        const conv = data as Conversation;
        
        if (!conv || typeof conv !== 'object') {
            throw new ConversationError('invalid_format', 'Invalid conversation format');
        }

        if (!conv.id || typeof conv.id !== 'string' || !validateUUID(conv.id)) {
            throw new ConversationError('invalid_id', 'Invalid conversation ID');
        }

        this.validateTitle(conv.title);

        if (!Array.isArray(conv.messages)) {
            throw new ConversationError('invalid_messages', 'Messages must be an array');
        }

        conv.messages.forEach(this.validateMessage.bind(this));

        if (!conv.created || !conv.updated || 
            typeof conv.created !== 'number' || 
            typeof conv.updated !== 'number') {
            throw new ConversationError('invalid_timestamps', 'Invalid timestamps');
        }

        return conv;
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private convertToMarkdown(conversation: Conversation): string {
        let md = `# ${conversation.title}\n\n`;
        
        if (conversation.metadata?.tags?.length) {
            md += `Tags: ${conversation.metadata.tags.join(', ')}\n\n`;
        }

        md += `Created: ${new Date(conversation.created).toISOString()}\n`;
        md += `Updated: ${new Date(conversation.updated).toISOString()}\n\n`;
        
        conversation.messages.forEach(msg => {
            md += `## ${msg.role}\n`;
            md += `${msg.content}\n\n`;
        });

        return md;
    }

    private parseMarkdown(markdown: string): Conversation {
        const lines = markdown.split('\n');
        const title = lines[0].replace('# ', '');
        const messages: ChatMessage[] = [];
        let currentMessage: Partial<ChatMessage> | null = null;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('## ')) {
                if (currentMessage?.role && currentMessage.content) {
                    messages.push({
                        role: currentMessage.role,
                        content: currentMessage.content.trim(),
                        timestamp: Date.now()
                    });
                }
                
                currentMessage = {
                    role: line.replace('## ', '').trim() as 'user' | 'assistant' | 'system',
                    content: ''
                };
            } else if (currentMessage) {
                currentMessage.content = (currentMessage.content || '') + line + '\n';
            }
        }

        if (currentMessage?.role && currentMessage.content) {
            messages.push({
                role: currentMessage.role,
                content: currentMessage.content.trim(),
                timestamp: Date.now()
            });
        }

        return {
            id: this.generateId(),
            title,
            messages,
            created: Date.now(),
            updated: Date.now()
        };
    }
}
