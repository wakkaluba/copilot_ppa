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
    ChatMetrics
} from '../types';
import { LLMRequestExecutionService } from './LLMRequestExecutionService';
import { LLMChatHistoryService } from './LLMChatHistoryService';
import { LLMChatFormatter } from './LLMChatFormatter';

/**
 * Manages chat sessions, messages, and conversation flow
 */
export class LLMChatManager extends EventEmitter {
    private readonly executionService: LLMRequestExecutionService;
    private readonly historyService: LLMChatHistoryService;
    private readonly formatter: LLMChatFormatter;
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
        historyService: LLMChatHistoryService,
        formatter: LLMChatFormatter
    ) {
        super();
        this.executionService = executionService;
        this.historyService = historyService;
        this.formatter = formatter;
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
            timestamp: Date.now()
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
            timestamp: Date.now()
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
                const response = await this.getResponse(session, message, options);
                session.messages.push(response);
                session.metadata.lastMessage = response;
                session.metadata.messageCount++;
                this.metrics.totalMessages++;

                // Update metrics
                const responseTime = response.timestamp - message.timestamp;
                this.updateResponseTimeMetrics(responseTime);
            }

            // Save history
            await this.historyService.saveMessage(sessionId, message);
            
            return message;

        } catch (error) {
            this.handleChatError(session, error);
            throw error;
        }
    }

    /**
     * Get chat response
     */
    private async getResponse(
        session: ChatSession,
        message: ChatMessage,
        options: MessageOptions
    ): Promise<ChatMessage> {
        const startTime = Date.now();

        try {
            // Format conversation context
            const formattedContext = this.formatter.formatContext(
                session.messages,
                session.context
            );

            // Execute request
            const response = await this.executionService.execute(
                formattedContext,
                {
                    ...options,
                    sessionId: session.id,
                    messageId: message.id
                }
            );

            // Format response
            const formattedResponse = this.formatter.formatResponse(response);

            return {
                id: crypto.randomUUID(),
                role: ChatRole.Assistant,
                content: formattedResponse,
                timestamp: Date.now(),
                metadata: {
                    responseTime: Date.now() - startTime,
                    tokenCount: response.usage?.totalTokens
                }
            };

        } catch (error) {
            this.metrics.errorRate = (
                this.metrics.totalMessages > 0 ?
                (session.metadata.errorCount || 0) / this.metrics.totalMessages :
                0
            );
            throw new ChatError('Failed to get response', session.id, error);
        }
    }

    /**
     * End a chat session
     */
    public async endSession(sessionId: string): Promise<void> {
        const session = this.activeSessions.get(sessionId);
        if (!session) return;

        session.state = ChatState.Ended;
        session.metadata.endedAt = Date.now();
        
        await this.historyService.saveSession(session);
        this.activeSessions.delete(sessionId);
        this.metrics.activeSessions--;

        this.emit(ChatEvent.SessionEnded, {
            sessionId,
            timestamp: Date.now()
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
            timestamp: Date.now()
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
            timestamp: Date.now()
        });
    }

    private updateResponseTimeMetrics(responseTime: number): void {
        const totalResponses = this.metrics.totalMessages / 2; // Assuming each user message gets a response
        this.metrics.averageResponseTime = (
            (this.metrics.averageResponseTime * (totalResponses - 1) + responseTime) /
            totalResponses
        );
    }

    public dispose(): void {
        // End all active sessions
        for (const sessionId of this.activeSessions.keys()) {
            this.endSession(sessionId).catch(console.error);
        }
        this.activeSessions.clear();
        this.removeAllListeners();
    }
}