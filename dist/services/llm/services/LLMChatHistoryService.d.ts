import { EventEmitter } from 'events';
import { ChatMessage, ChatSession, ChatHistoryOptions, ChatExportFormat, ChatStats } from '../types';
/**
 * Service for managing chat history, persistence, and statistics
 */
export declare class LLMChatHistoryService extends EventEmitter {
    private readonly sessions;
    private readonly options;
    private readonly stats;
    constructor(options?: ChatHistoryOptions);
    /**
     * Save a chat message
     */
    saveMessage(sessionId: string, message: ChatMessage): Promise<void>;
    /**
     * Save a chat session
     */
    saveSession(session: ChatSession): Promise<void>;
    /**
     * Load a chat session
     */
    loadSession(sessionId: string): Promise<ChatSession | null>;
    /**
     * Delete a chat session
     */
    deleteSession(sessionId: string): Promise<void>;
    /**
     * Export chat history
     */
    exportHistory(sessionId: string, format?: ChatExportFormat): Promise<string>;
    /**
     * Import chat history
     */
    importHistory(content: string, format?: ChatExportFormat): Promise<ChatSession>;
    /**
     * Get chat statistics
     */
    getStats(): ChatStats;
    /**
     * Clean up old sessions
     */
    private pruneHistory;
    private startPruneInterval;
    private persistMessage;
    private persistSession;
    private retrieveSession;
    private removeSession;
    private formatHistoryAsText;
    private formatHistoryAsMarkdown;
    private parseHistoryFromText;
    private validateSession;
    private updateStats;
    dispose(): void;
}
