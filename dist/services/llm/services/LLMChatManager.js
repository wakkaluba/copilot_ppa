"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMChatManager = void 0;
const events_1 = require("events");
const types_1 = require("../types");
/**
 * Manages chat sessions, messages, and conversation flow
 */
class LLMChatManager extends events_1.EventEmitter {
    executionService;
    historyService;
    formatter;
    activeSessions = new Map();
    metrics = {
        totalSessions: 0,
        activeSessions: 0,
        totalMessages: 0,
        averageResponseTime: 0,
        errorRate: 0
    };
    constructor(executionService, historyService, formatter) {
        super();
        this.executionService = executionService;
        this.historyService = historyService;
        this.formatter = formatter;
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.historyService.on(types_1.ChatEvent.HistoryLoaded, this.handleHistoryLoaded.bind(this));
        this.historyService.on(types_1.ChatEvent.HistorySaved, this.handleHistorySaved.bind(this));
    }
    /**
     * Create a new chat session
     */
    async createSession(options = {}) {
        const session = {
            id: crypto.randomUUID(),
            state: types_1.ChatState.Active,
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
        this.emit(types_1.ChatEvent.SessionCreated, {
            sessionId: session.id,
            timestamp: Date.now()
        });
        return session;
    }
    /**
     * Send a message in a chat session
     */
    async sendMessage(sessionId, content, options = {}) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new types_1.ChatError('Session not found', sessionId);
        }
        const message = {
            id: crypto.randomUUID(),
            role: options.role || types_1.ChatRole.User,
            content,
            timestamp: Date.now()
        };
        try {
            // Add message to session
            session.messages.push(message);
            session.metadata.lastMessage = message;
            session.metadata.messageCount++;
            this.metrics.totalMessages++;
            this.emit(types_1.ChatEvent.MessageSent, {
                sessionId,
                messageId: message.id,
                timestamp: message.timestamp
            });
            // Get response if it's a user message
            if (message.role === types_1.ChatRole.User) {
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
        }
        catch (error) {
            this.handleChatError(session, error);
            throw error;
        }
    }
    /**
     * Get chat response
     */
    async getResponse(session, message, options) {
        const startTime = Date.now();
        try {
            // Format conversation context
            const formattedContext = this.formatter.formatContext(session.messages, session.context);
            // Execute request
            const response = await this.executionService.execute(formattedContext, {
                ...options,
                sessionId: session.id,
                messageId: message.id
            });
            // Format response
            const formattedResponse = this.formatter.formatResponse(response);
            return {
                id: crypto.randomUUID(),
                role: types_1.ChatRole.Assistant,
                content: formattedResponse,
                timestamp: Date.now(),
                metadata: {
                    responseTime: Date.now() - startTime,
                    tokenCount: response.usage?.totalTokens
                }
            };
        }
        catch (error) {
            this.metrics.errorRate = (this.metrics.totalMessages > 0 ?
                (session.metadata.errorCount || 0) / this.metrics.totalMessages :
                0);
            throw new types_1.ChatError('Failed to get response', session.id, error);
        }
    }
    /**
     * End a chat session
     */
    async endSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        session.state = types_1.ChatState.Ended;
        session.metadata.endedAt = Date.now();
        await this.historyService.saveSession(session);
        this.activeSessions.delete(sessionId);
        this.metrics.activeSessions--;
        this.emit(types_1.ChatEvent.SessionEnded, {
            sessionId,
            timestamp: Date.now()
        });
    }
    /**
     * Resume a previous chat session
     */
    async resumeSession(sessionId) {
        const session = await this.historyService.loadSession(sessionId);
        if (!session) {
            throw new types_1.ChatError('Session not found', sessionId);
        }
        session.state = types_1.ChatState.Active;
        this.activeSessions.set(sessionId, session);
        this.metrics.activeSessions++;
        this.emit(types_1.ChatEvent.SessionResumed, {
            sessionId,
            timestamp: Date.now()
        });
        return session;
    }
    /**
     * Get session messages
     */
    getSessionMessages(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new types_1.ChatError('Session not found', sessionId);
        }
        return [...session.messages];
    }
    /**
     * Get active sessions
     */
    getActiveSessions() {
        return Array.from(this.activeSessions.values());
    }
    /**
     * Get chat metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    handleHistoryLoaded(event) {
        this.emit(types_1.ChatEvent.HistoryLoaded, event);
    }
    handleHistorySaved(event) {
        this.emit(types_1.ChatEvent.HistorySaved, event);
    }
    handleChatError(session, error) {
        session.metadata.errorCount = (session.metadata.errorCount || 0) + 1;
        session.metadata.lastError = error instanceof Error ? error : new Error(String(error));
        this.emit(types_1.ChatEvent.Error, {
            sessionId: session.id,
            error: session.metadata.lastError,
            timestamp: Date.now()
        });
    }
    updateResponseTimeMetrics(responseTime) {
        const totalResponses = this.metrics.totalMessages / 2; // Assuming each user message gets a response
        this.metrics.averageResponseTime = ((this.metrics.averageResponseTime * (totalResponses - 1) + responseTime) /
            totalResponses);
    }
    dispose() {
        // End all active sessions
        for (const sessionId of this.activeSessions.keys()) {
            this.endSession(sessionId).catch(console.error);
        }
        this.activeSessions.clear();
        this.removeAllListeners();
    }
}
exports.LLMChatManager = LLMChatManager;
//# sourceMappingURL=LLMChatManager.js.map