"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMChatManager = void 0;
const events_1 = require("events");
const types_1 = require("../types");
/**
 * Manages chat sessions, messages, and conversation flow
 */
class LLMChatManager extends events_1.EventEmitter {
    constructor(executionService, historyService) {
        super();
        this.activeSessions = new Map();
        this.metrics = {
            totalSessions: 0,
            activeSessions: 0,
            totalMessages: 0,
            averageResponseTime: 0,
            errorRate: 0
        };
        this.executionService = executionService;
        this.historyService = historyService;
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
            timestamp: new Date()
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
            timestamp: new Date(),
            metadata: {}
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
                await this.sendRequest(session, content);
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
    async sendRequest(session, content) {
        try {
            session.metadata['requestStartTime'] = Date.now();
            const options = {
                metadata: {
                    chatSessionId: session.id
                }
            };
            const response = await this.executionService.execute(content, options);
            await this.handleResponse(session, response);
        }
        catch (error) {
            const chatError = error instanceof Error ?
                new types_1.ChatError('Failed to get response', session.id, error) :
                new types_1.ChatError('Failed to get response', session.id);
            session.metadata['errorCount'] = (session.metadata['errorCount'] || 0) + 1;
            session.metadata['lastError'] = chatError;
            throw chatError;
        }
    }
    async handleResponse(session, response) {
        const responseTime = Date.now() - session.metadata['requestStartTime'];
        const message = {
            id: crypto.randomUUID(),
            role: types_1.ChatRole.Assistant,
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
        this.emit(types_1.ChatEvent.MessageHandled, {
            sessionId: session.id,
            message
        });
    }
    /**
     * End a chat session
     */
    async endSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }
        session.state = types_1.ChatState.Ended;
        session.metadata.endedAt = Date.now();
        await this.historyService.saveSession(session);
        this.activeSessions.delete(sessionId);
        this.metrics.activeSessions--;
        this.emit(types_1.ChatEvent.SessionEnded, {
            sessionId,
            timestamp: new Date()
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
            timestamp: new Date()
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
            timestamp: new Date()
        });
    }
    dispose() {
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
    async handleUserMessage(sessionId, content) {
        if (!content.trim()) {
            return;
        }
        const message = await this.sendMessage(sessionId, content);
        this.emit(types_1.ChatEvent.MessageHandled, {
            sessionId,
            messageId: message.id,
            timestamp: new Date()
        });
    }
    /**
     * Clear chat history for a session
     */
    async clearSessionHistory(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new types_1.ChatError('Session not found', sessionId);
        }
        session.messages = [];
        session.metadata.messageCount = 0;
        await this.historyService.saveSession(session);
        this.emit(types_1.ChatEvent.HistoryCleared, {
            sessionId,
            timestamp: new Date()
        });
    }
    /**
     * Get connection status
     */
    getConnectionStatus() {
        const isConnected = this.executionService.isConnected();
        return {
            isConnected,
            status: isConnected ? 'Connected' : 'Disconnected'
        };
    }
}
exports.LLMChatManager = LLMChatManager;
//# sourceMappingURL=LLMChatManager.js.map