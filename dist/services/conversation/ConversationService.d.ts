import * as vscode from 'vscode';
import { Message } from './models';
/**
 * Service for managing conversation history and state
 */
export declare class ConversationService {
    private conversationMemoryService;
    /**
     * Create a new ConversationService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize the conversation service
     */
    initialize(): Promise<void>;
    /**
     * Add a message to the conversation history
     * @param message Message to add
     */
    addMessage(message: Message): void;
    /**
     * Get recent messages from conversation history
     * @param limit Optional limit for number of messages
     * @returns Array of recent messages
     */
    getRecentMessages(limit?: number): Message[];
    /**
     * Clear conversation history
     */
    clearHistory(): Promise<void>;
}
