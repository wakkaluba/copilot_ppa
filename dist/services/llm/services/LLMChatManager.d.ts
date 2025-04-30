import { EventEmitter } from 'events';
import { ChatMessage, ChatSession, ChatOptions, MessageOptions, ChatMetrics } from '../types';
import { LLMRequestExecutionService } from './LLMRequestExecutionService';
import { LLMChatHistoryService } from './LLMChatHistoryService';
/**
 * Manages chat sessions, messages, and conversation flow
 */
export declare class LLMChatManager extends EventEmitter {
    private readonly executionService;
    private readonly historyService;
    private readonly activeSessions;
    private readonly metrics;
    constructor(executionService: LLMRequestExecutionService, historyService: LLMChatHistoryService);
    private setupEventListeners;
    /**
     * Create a new chat session
     */
    createSession(options?: ChatOptions): Promise<ChatSession>;
    /**
     * Send a message in a chat session
     */
    sendMessage(sessionId: string, content: string, options?: MessageOptions): Promise<ChatMessage>;
    private sendRequest;
    private handleResponse;
    /**
     * End a chat session
     */
    endSession(sessionId: string): Promise<void>;
    /**
     * Resume a previous chat session
     */
    resumeSession(sessionId: string): Promise<ChatSession>;
    /**
     * Get session messages
     */
    getSessionMessages(sessionId: string): ChatMessage[];
    /**
     * Get active sessions
     */
    getActiveSessions(): ChatSession[];
    /**
     * Get chat metrics
     */
    getMetrics(): ChatMetrics;
    private handleHistoryLoaded;
    private handleHistorySaved;
    private handleChatError;
    dispose(): void;
    /**
     * Handle incoming user message
     */
    handleUserMessage(sessionId: string, content: string): Promise<void>;
    /**
     * Clear chat history for a session
     */
    clearSessionHistory(sessionId: string): Promise<void>;
    /**
     * Get connection status
     */
    getConnectionStatus(): {
        isConnected: boolean;
        status: string;
    };
}
