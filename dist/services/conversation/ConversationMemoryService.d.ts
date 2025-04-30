import * as vscode from 'vscode';
import { Message, MessageType } from './models';
/**
 * Service for managing conversation memory
 */
export declare class ConversationMemoryService {
    private messages;
    private memoryLimit;
    private context;
    private storageKey;
    /**
     * Create a new ConversationMemoryService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize the conversation memory from persistent storage
     */
    initialize(): Promise<void>;
    /**
     * Add a message to the conversation memory
     * @param message The message to add
     */
    addMessage(message: Message): void;
    /**
     * Get recent messages from conversation memory
     * @param limit Optional limit of messages to retrieve
     * @returns Array of recent messages
     */
    getRecentMessages(limit?: number): Message[];
    /**
     * Clear all messages from conversation memory
     */
    clearHistory(): Promise<void>;
    /**
     * Set the memory limit
     * @param limit New memory limit
     */
    setMemoryLimit(limit: number): void;
    /**
     * Get the total number of messages
     */
    getMessageCount(): number;
    /**
     * Persist conversation memory to storage
     */
    private persist;
    /**
     * Search messages for specific content
     * @param query Text to search for
     * @returns Messages that match the query
     */
    searchMessages(query: string): Message[];
    /**
     * Group messages by type
     * @returns Object with arrays of messages by type
     */
    groupMessagesByType(): Record<MessageType, Message[]>;
}
