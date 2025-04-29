import * as vscode from 'vscode';
import { Message, MessageType } from '../models';
import * as crypto from 'crypto';

/**
 * Service for managing conversation memory
 */
export class ConversationMemoryService {
    private messages: Message[] = [];
    private context: vscode.ExtensionContext;
    private maxHistory: number = 100;

    /**
     * Create a new ConversationMemoryService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Initialize service
     */
    public async initialize(): Promise<void> {
        // Load messages from storage
        const storedMessages = this.context.globalState.get('conversationMemory');
        if (storedMessages) {
            try {
                this.messages = JSON.parse(storedMessages as string) as Message[];
            } catch (error) {
                console.error('Failed to parse stored messages', error);
                this.messages = [];
            }
        }
    }

    /**
     * Add a message to memory
     * @param message Message to add
     */
    public addMessage(message: Message): void {
        // Generate ID if not provided
        if (!message.id) {
            message.id = crypto.randomUUID();
        }
        
        // Add timestamp if not provided
        if (!message.timestamp) {
            message.timestamp = Date.now();
        }
        
        this.messages.push(message);
        
        // Limit history size
        if (this.messages.length > this.maxHistory) {
            this.messages = this.messages.slice(-this.maxHistory);
        }
        
        // Save to storage
        this.saveMessages();
    }

    /**
     * Get all messages
     */
    public getMessages(): Message[] {
        return [...this.messages];
    }

    /**
     * Get recent messages
     * @param limit Maximum number of messages to return
     */
    public getRecentMessages(limit: number = 10): Message[] {
        return this.messages.slice(-limit);
    }

    /**
     * Get messages by date range
     * @param startDate Start date timestamp
     * @param endDate End date timestamp
     */
    public getMessagesByDateRange(startDate: number, endDate: number): Message[] {
        return this.messages.filter(
            msg => (msg.timestamp || 0) >= startDate && (msg.timestamp || 0) <= endDate
        );
    }

    /**
     * Clear all messages
     */
    public async clearMessages(): Promise<void> {
        this.messages = [];
        await this.saveMessages();
    }

    /**
     * Clear all history (alias for clearMessages)
     */
    public async clearHistory(): Promise<void> {
        await this.clearMessages();
    }

    /**
     * Save messages to storage
     */
    private async saveMessages(): Promise<void> {
        await this.context.globalState.update('conversationMemory', JSON.stringify(this.messages));
    }
}
