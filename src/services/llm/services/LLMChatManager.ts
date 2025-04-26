import { EventEmitter } from 'events';
import { 
    ChatMessage,
    ChatSession,
    ChatEvent,
    ChatOptions,
    ChatRole,
    MessageOptions,
    ChatError,
    ChatState,
    ChatMetrics,
    LLMRequestOptions,
    LLMResponse
} from '../types';
import { LLMRequestExecutionService } from './LLMRequestExecutionService';
import { LLMChatHistoryService } from './LLMChatHistoryService';

/**
 * Manages chat sessions, messages, and conversation flow
 */
export class LLMChatManager extends EventEmitter {
    private readonly executionService: LLMRequestExecutionService;
    private readonly historyService: LLMChatHistoryService;
    private readonly activeSessions = new Map<string, ChatSession>();
    private readonly metrics: ChatMetrics = {
        totalSessions: 0,
        activeSessions: 0,
        totalMessages: 0,
        averageResponseTime: 0,
        errorRate: 0
    };

    constructor(
        executionService: LLMRequestExecutionService,
        historyService: LLMChatHistoryService
    ) {
        super();
        this.executionService = executionService;
        this.historyService = historyService;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.historyService.on(ChatEvent.HistoryLoaded, this.handleHistoryLoaded.bind(this));
        this.historyService.on(ChatEvent.HistorySaved, this.handleHistorySaved.bind(this));
    }

    /**
     * Create a new chat session
     */
    public async createSession(options: ChatOptions = {}): Promise<ChatSession> {
        const session: ChatSession = {
            id: crypto.randomUUID(),
            state: ChatState.Active,
            messages: [],
            context: options.context || {},
            metadata: {
                createdAt: Date.now(),
                lastMessage: null,
                messageCount: 0
            }
        };

        this.activeSessions.set(session.id, session);
        this.metrics.totalSessions++;
        this.metrics.activeSessions++;

        this.emit(ChatEvent.SessionCreated, {
            sessionId: session.id,
            timestamp: new Date()
        });

        return session;
    }

    /**
     * Send a message in a chat session
     */
    public async sendMessage(
        sessionId: string,
        content: string,
        options: MessageOptions = {}
    ): Promise<ChatMessage> {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new ChatError('Session not found', sessionId);
        }

        const message: ChatMessage = {
            id: crypto.randomUUID(),
            role: options.role || ChatRole.User,
            content,
            timestamp: new Date(),
            metadata: {}
        };

        try {
            // Add message to session
            session.messages.push(message);
            session.metadata.lastMessage = message;
            session.metadata.messageCount++;
            this.metrics.totalMessages++;

            this.emit(ChatEvent.MessageSent, {
                sessionId,
                messageId: message.id,
                timestamp: message.timestamp
            });

            // Get response if it's a user message
            if (message.role === ChatRole.User) {
                await this.sendRequest(session, content);
            }

            // Save history
            await this.historyService.saveMessage(sessionId, message);
            
            return message;

        } catch (error) {
            this.handleChatError(session, error);
            throw error;
        }
    }

    private async sendRequest(session: ChatSession, content: string): Promise<void> {
        try {
            session.metadata['requestStartTime'] = Date.now();
            
            const options: LLMRequestOptions = {
                metadata: {
                    chatSessionId: session.id
                }
            };

            const response = await this.executionService.execute(content, options);
            await this.handleResponse(session, response);
        } catch (error) {
            const chatError = error instanceof Error ? 
                new ChatError('Failed to get response', session.id, error) :
                new ChatError('Failed to get response', session.id);
                
            session.metadata['errorCount'] = (session.metadata['errorCount'] || 0) + 1;
            session.metadata['lastError'] = chatError;
            
            throw chatError;
        }
    }

    private async handleResponse(session: ChatSession, response: LLMResponse): Promise<void> {
        const responseTime = Date.now() - (session.metadata['requestStartTime'] as number);
        
        const message: ChatMessage = {
            id: crypto.randomUUID(),
            role: ChatRole.Assistant,
            content: response.content,
            timestamp: new Date(),
            metadata: {
                responseTime,
                tokenCount: response.usage?.totalTokens ?? null
            }
        };

        session.messages.push(message);
        session.metadata.lastMessage = message;
        session.metadata.messageCount++;

        this.emit(ChatEvent.MessageHandled, { 
            sessionId: session.id, 
            message 
        });
    }

    /**
     * End a chat session
     */
    public async endSession(sessionId: string): Promise<void> {
        const session = this.activeSessions.get(sessionId);
        if (!session) {return;}

        session.state = ChatState.Ended;
        session.metadata.endedAt = Date.now();
        
        await this.historyService.saveSession(session);
        this.activeSessions.delete(sessionId);
        this.metrics.activeSessions--;

        this.emit(ChatEvent.SessionEnded, {
            sessionId,
            timestamp: new Date()
        });
    }

    /**
     * Resume a previous chat session
     */
    public async resumeSession(sessionId: string): Promise<ChatSession> {
        const session = await this.historyService.loadSession(sessionId);
        if (!session) {
            throw new ChatError('Session not found', sessionId);
        }

        session.state = ChatState.Active;
        this.activeSessions.set(sessionId, session);
        this.metrics.activeSessions++;

        this.emit(ChatEvent.SessionResumed, {
            sessionId,
            timestamp: new Date()
        });

        return session;
    }

    /**
     * Get session messages
     */
    public getSessionMessages(sessionId: string): ChatMessage[] {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new ChatError('Session not found', sessionId);
        }
        return [...session.messages];
    }

    /**
     * Get active sessions
     */
    public getActiveSessions(): ChatSession[] {
        return Array.from(this.activeSessions.values());
    }

    /**
     * Get chat metrics
     */
    public getMetrics(): ChatMetrics {
        return { ...this.metrics };
    }

    private handleHistoryLoaded(event: { sessionId: string }): void {
        this.emit(ChatEvent.HistoryLoaded, event);
    }

    private handleHistorySaved(event: { sessionId: string }): void {
        this.emit(ChatEvent.HistorySaved, event);
    }

    private handleChatError(session: ChatSession, error: unknown): void {
        session.metadata.errorCount = (session.metadata.errorCount || 0) + 1;
        session.metadata.lastError = error instanceof Error ? error : new Error(String(error));
        
        this.emit(ChatEvent.Error, {
            sessionId: session.id,
            error: session.metadata.lastError,
            timestamp: new Date()
        });
    }

    public dispose(): void {
        // End all active sessions
        for (const sessionId of this.activeSessions.keys()) {
            this.endSession(sessionId).catch(console.error);
        }
        this.activeSessions.clear();
        this.removeAllListeners();
    }

    /**
     * Handle incoming user message
     */
    public async handleUserMessage(sessionId: string, content: string): Promise<void> {
        if (!content.trim()) {
            return;
        }

        const message = await this.sendMessage(sessionId, content);
        
        this.emit(ChatEvent.MessageHandled, {
            sessionId,
            messageId: message.id,
            timestamp: new Date()
        });
    }

    /**
     * Clear chat history for a session
     */
    public async clearSessionHistory(sessionId: string): Promise<void> {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new ChatError('Session not found', sessionId);
        }

        session.messages = [];
        session.metadata.messageCount = 0;
        await this.historyService.saveSession(session);

        this.emit(ChatEvent.HistoryCleared, {
            sessionId,
            timestamp: new Date()
        });
    }

    /**
     * Get connection status
     */
    public getConnectionStatus(): { isConnected: boolean; status: string } {
        const isConnected = this.executionService.isConnected();
        return {
            isConnected,
            status: isConnected ? 'Connected' : 'Disconnected'
        };
    }
}