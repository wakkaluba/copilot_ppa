import * as vscode from 'vscode';
import { Message } from '../models';
/**
 * Service for managing conversation memory
 */
export declare class ConversationMemoryService {
    private messages;
    private context;
    private maxHistory;
    /**
     * Create a new ConversationMemoryService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize service
     */
    initialize(): Promise<void>;
    /**
     * Add a message to memory
     * @param message Message to add
     */
    addMessage(message: Message): void;
    /**
     * Get all messages
     */
    getMessages(): Message[];
    /**
     * Get recent messages
     * @param limit Maximum number of messages to return
     */
    getRecentMessages(limit?: number): Message[];
    /**
     * Get messages by date range
     * @param startDate Start date timestamp
     * @param endDate End date timestamp
     */
    getMessagesByDateRange(startDate: number, endDate: number): Message[];
    /**
     * Clear all messages
     */
    clearMessages(): Promise<void>;
    /**
     * Clear all history (alias for clearMessages)
     */
    clearHistory(): Promise<void>;
    /**
     * Save messages to storage
     */
    private saveMessages;
}
