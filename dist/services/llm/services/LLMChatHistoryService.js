"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMChatHistoryService = void 0;
const events_1 = require("events");
const types_1 = require("../types");
/**
 * Service for managing chat history, persistence, and statistics
 */
class LLMChatHistoryService extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.sessions = new Map();
        this.stats = {
            totalSessions: 0,
            totalMessages: 0,
            averageMessagesPerSession: 0,
            oldestSession: null,
            newestSession: null
        };
        this.options = {
            maxHistory: options.maxHistory || 100,
            maxMessagesPerSession: options.maxMessagesPerSession || 1000,
            pruneInterval: options.pruneInterval || 3600000, // 1 hour
            ...options
        };
        this.startPruneInterval();
    }
    /**
     * Save a chat message
     */
    async saveMessage(sessionId, message) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new types_1.ChatError('Session not found', sessionId);
        }
        // Check message limit
        if (session.messages.length >= this.options.maxMessagesPerSession) {
            throw new types_1.ChatError(`Session ${sessionId} has reached maximum message limit`, sessionId);
        }
        try {
            await this.persistMessage(session, message);
            this.updateStats();
            this.emit(types_1.ChatEvent.HistorySaved, {
                sessionId,
                messageId: message.id,
                timestamp: new Date()
            });
        }
        catch (error) {
            throw new types_1.ChatError('Failed to save message', sessionId, error instanceof Error ? error : undefined);
        }
    }
    /**
     * Save a chat session
     */
    async saveSession(session) {
        try {
            await this.persistSession(session);
            this.sessions.set(session.id, session);
            this.updateStats();
            this.emit(types_1.ChatEvent.HistorySaved, {
                sessionId: session.id,
                timestamp: new Date()
            });
        }
        catch (error) {
            throw new types_1.ChatError('Failed to save session', session.id, error instanceof Error ? error : undefined);
        }
    }
    /**
     * Load a chat session
     */
    async loadSession(sessionId) {
        try {
            const session = await this.retrieveSession(sessionId);
            if (session) {
                this.sessions.set(sessionId, session);
                this.emit(types_1.ChatEvent.HistoryLoaded, {
                    sessionId,
                    timestamp: new Date()
                });
            }
            return session;
        }
        catch (error) {
            throw new types_1.ChatError('Failed to load session', sessionId, error instanceof Error ? error : undefined);
        }
    }
    /**
     * Delete a chat session
     */
    async deleteSession(sessionId) {
        try {
            await this.removeSession(sessionId);
            this.sessions.delete(sessionId);
            this.updateStats();
            this.emit(types_1.ChatEvent.HistoryDeleted, {
                sessionId,
                timestamp: new Date()
            });
        }
        catch (error) {
            throw new types_1.ChatError('Failed to delete session', sessionId, error instanceof Error ? error : undefined);
        }
    }
    /**
     * Export chat history
     */
    async exportHistory(sessionId, format = 'json') {
        const session = await this.loadSession(sessionId);
        if (!session) {
            throw new types_1.ChatError('Session not found', sessionId);
        }
        try {
            switch (format) {
                case 'json':
                    return JSON.stringify(session, null, 2);
                case 'text':
                    return this.formatHistoryAsText(session);
                case 'markdown':
                    return this.formatHistoryAsMarkdown(session);
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        }
        catch (error) {
            throw new types_1.ChatError('Failed to export history', sessionId, error instanceof Error ? error : undefined);
        }
    }
    /**
     * Import chat history
     */
    async importHistory(content, format = 'json') {
        try {
            let session;
            switch (format) {
                case 'json':
                    session = JSON.parse(content);
                    break;
                case 'text':
                case 'markdown':
                    session = this.parseHistoryFromText(content);
                    break;
                default:
                    throw new Error(`Unsupported import format: ${format}`);
            }
            // Validate imported session
            if (!this.validateSession(session)) {
                throw new Error('Invalid session format');
            }
            await this.saveSession(session);
            return session;
        }
        catch (error) {
            throw new types_1.ChatError('Failed to import history', undefined, error instanceof Error ? error : undefined);
        }
    }
    /**
     * Get chat statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Clean up old sessions
     */
    async pruneHistory() {
        const sessions = Array.from(this.sessions.values());
        const sortedSessions = sessions.sort((a, b) => (b.metadata.lastMessage?.timestamp || 0) -
            (a.metadata.lastMessage?.timestamp || 0));
        // Keep only the most recent sessions up to maxHistory
        const sessionsToDelete = sortedSessions.slice(this.options.maxHistory);
        for (const session of sessionsToDelete) {
            await this.deleteSession(session.id);
        }
    }
    startPruneInterval() {
        setInterval(async () => {
            try {
                await this.pruneHistory();
            }
            catch (error) {
                console.error('Failed to prune history:', error);
            }
        }, this.options.pruneInterval);
    }
    async persistMessage(session, message) {
        // This would integrate with storage system
        throw new Error('Not implemented');
    }
    async persistSession(session) {
        // This would integrate with storage system
        throw new Error('Not implemented');
    }
    async retrieveSession(sessionId) {
        // This would integrate with storage system
        throw new Error('Not implemented');
    }
    async removeSession(sessionId) {
        // This would integrate with storage system
        throw new Error('Not implemented');
    }
    formatHistoryAsText(session) {
        let text = `Chat Session: ${session.id}\n`;
        text += `Created: ${new Date(session.metadata.createdAt).toISOString()}\n\n`;
        for (const message of session.messages) {
            const timestamp = new Date(message.timestamp).toLocaleTimeString();
            text += `[${timestamp}] ${message.role}: ${message.content}\n\n`;
        }
        return text;
    }
    formatHistoryAsMarkdown(session) {
        let md = `# Chat Session: ${session.id}\n\n`;
        md += `Created: ${new Date(session.metadata.createdAt).toISOString()}\n\n`;
        for (const message of session.messages) {
            const timestamp = new Date(message.timestamp).toLocaleTimeString();
            md += `### ${message.role} (${timestamp})\n\n`;
            md += `${message.content}\n\n`;
        }
        return md;
    }
    parseHistoryFromText(content) {
        // This would parse text/markdown format back into a session
        throw new Error('Not implemented');
    }
    validateSession(session) {
        return (typeof session === 'object' &&
            typeof session.id === 'string' &&
            Array.isArray(session.messages) &&
            typeof session.metadata === 'object' &&
            typeof session.metadata.createdAt === 'number');
    }
    updateStats() {
        this.stats.totalSessions = this.sessions.size;
        this.stats.totalMessages = Array.from(this.sessions.values())
            .reduce((total, session) => total + session.messages.length, 0);
        if (this.stats.totalSessions > 0) {
            this.stats.averageMessagesPerSession =
                this.stats.totalMessages / this.stats.totalSessions;
        }
        const sessions = Array.from(this.sessions.values());
        if (sessions.length > 0) {
            const sorted = sessions.sort((a, b) => a.metadata.createdAt - b.metadata.createdAt);
            this.stats.oldestSession = {
                id: sorted[0].id,
                createdAt: sorted[0].metadata.createdAt
            };
            this.stats.newestSession = {
                id: sorted[sorted.length - 1].id,
                createdAt: sorted[sorted.length - 1].metadata.createdAt
            };
        }
    }
    dispose() {
        this.removeAllListeners();
    }
}
exports.LLMChatHistoryService = LLMChatHistoryService;
//# sourceMappingURL=LLMChatHistoryService.js.map