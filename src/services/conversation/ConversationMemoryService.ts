import * as vscode from 'vscode';
import { Message, MessageType } from './models';

/**
 * Service for managing conversation memory
 */
export class ConversationMemoryService {
    private messages: Message[] = [];
    private memoryLimit: number = 50;
    private context: vscode.ExtensionContext;
    private storageKey = 'conversation.history';

    /**
     * Create a new ConversationMemoryService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Initialize the conversation memory from persistent storage
     */
    public async initialize(): Promise<void> {
        const storedMessages = this.context.globalState.get<Message[]>(this.storageKey);
        if (storedMessages) {
            this.messages = storedMessages;
        }
    }

    /**
     * Add a message to the conversation memory
     * @param message The message to add
     */
    public addMessage(message: Message): void {
        this.messages.push(message);
        
        // Trim to memory limit
        if (this.messages.length > this.memoryLimit) {
            this.messages = this.messages.slice(-this.memoryLimit);
        }
        
        // Persist changes
        this.persist();
    }

    /**
     * Get recent messages from conversation memory
     * @param limit Optional limit of messages to retrieve
     * @returns Array of recent messages
     */
    public getRecentMessages(limit?: number): Message[] {
        if (!limit || limit >= this.messages.length) {
            return [...this.messages];
        }
        return this.messages.slice(-limit);
    }

    /**
     * Clear all messages from conversation memory
     */
    public async clearHistory(): Promise<void> {
        this.messages = [];
        await this.persist();
    }

    /**
     * Set the memory limit
     * @param limit New memory limit
     */
    public setMemoryLimit(limit: number): void {
        if (limit < 1) {
            throw new Error('Memory limit must be at least 1');
        }
        this.memoryLimit = limit;
        
        // Trim if necessary
        if (this.messages.length > this.memoryLimit) {
            this.messages = this.messages.slice(-this.memoryLimit);
            this.persist();
        }
    }

    /**
     * Get the total number of messages
     */
    public getMessageCount(): number {
        return this.messages.length;
    }

    /**
     * Persist conversation memory to storage
     */
    private async persist(): Promise<void> {
        await this.context.globalState.update(this.storageKey, this.messages);
    }

    /**
     * Search messages for specific content
     * @param query Text to search for
     * @returns Messages that match the query
     */
    public searchMessages(query: string): Message[] {
        const lowerQuery = query.toLowerCase();
        return this.messages.filter(message => 
            message.content.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Group messages by type
     * @returns Object with arrays of messages by type
     */
    public groupMessagesByType(): Record<MessageType, Message[]> {
        const result: Partial<Record<MessageType, Message[]>> = {};
        
        for (const message of this.messages) {
            if (!result[message.type]) {
                result[message.type] = [];
            }
            result[message.type]!.push(message);
        }
        
        return result as Record<MessageType, Message[]>;
    }
}
