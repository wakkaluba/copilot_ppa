import * as vscode from 'vscode';
import { Message } from '../models';

/**
 * Service for storing and retrieving conversation messages
 */
export class ConversationMemoryService {
    private storage: Message[] = [];
    private readonly storageKey = 'conversationHistory';
    
    constructor(private context: vscode.ExtensionContext) {
        this.loadFromStorage();
    }
    
    /**
     * Add a new message to storage
     * @param message Message to add
     */
    public async addMessage(message: Message): Promise<void> {
        this.storage.push(message);
        await this.saveToStorage();
    }
    
    /**
     * Get all messages
     * @returns Array of messages
     */
    public getMessages(): Message[] {
        return [...this.storage];
    }
    
    /**
     * Get messages within a date range
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @returns Messages in range
     */
    public getMessagesByDateRange(startTime: number, endTime: number): Message[] {
        return this.storage.filter(
            msg => msg.timestamp >= startTime && msg.timestamp <= endTime
        );
    }
    
    /**
     * Clear all messages
     */
    public async clearMessages(): Promise<void> {
        this.storage = [];
        await this.saveToStorage();
    }
    
    /**
     * Save messages to extension storage
     */
    private async saveToStorage(): Promise<void> {
        await this.context.globalState.update(this.storageKey, this.storage);
    }
    
    /**
     * Load messages from extension storage
     */
    private loadFromStorage(): void {
        const saved = this.context.globalState.get<Message[]>(this.storageKey);
        if (saved) {
            this.storage = saved;
        }
    }
}
