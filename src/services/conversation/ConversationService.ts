import * as vscode from 'vscode';
import { ConversationMemoryService } from './services/ConversationMemoryService';
import { Message } from './models';

/**
 * Service for managing conversation history and state
 */
export class ConversationService {
    private conversationMemoryService: ConversationMemoryService;
    
    /**
     * Create a new ConversationService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext) {
        this.conversationMemoryService = new ConversationMemoryService(context);
    }
    
    /**
     * Initialize the conversation service
     */
    public async initialize(): Promise<void> {
        await this.conversationMemoryService.initialize();
    }
    
    /**
     * Add a message to the conversation history
     * @param message Message to add
     */
    public addMessage(message: Message): void {
        this.conversationMemoryService.addMessage(message);
    }
    
    /**
     * Get recent messages from conversation history
     * @param limit Optional limit for number of messages
     * @returns Array of recent messages
     */
    public getRecentMessages(limit?: number): Message[] {
        return this.conversationMemoryService.getRecentMessages(limit);
    }
    
    /**
     * Clear conversation history
     */
    public async clearHistory(): Promise<void> {
        await this.conversationMemoryService.clearHistory();
    }
}
