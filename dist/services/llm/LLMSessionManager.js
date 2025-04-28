"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMSessionManager = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
const LLMConnectionManager_1 = require("./LLMConnectionManager");
class LLMSessionManager extends events_1.EventEmitter {
    constructor(connectionManager, hostManager) {
        super();
        this.sessions = new Map();
        this.sessionTimeout = 3600000; // 1 hour
        this.connectionManager = connectionManager;
        this.hostManager = hostManager;
        // Listen for connection status changes
        this.connectionManager.on('statusChanged', (event) => {
            if (event.status === LLMConnectionManager_1.ConnectionStatus.Disconnected && this.activeSessionId) {
                this.deactivateSession(this.activeSessionId);
            }
        });
        // Start session cleanup
        this.startSessionCleanup();
    }
    /**
     * Create a new LLM session
     * @param config Session configuration
     * @returns The created session
     */
    createSession(config) {
        const id = (0, uuid_1.v4)();
        const now = Date.now();
        const session = {
            id,
            config,
            state: {
                id,
                active: false,
                startTime: now,
                lastActivity: now,
                requestCount: 0,
                tokenCount: 0,
                model: config.model,
                provider: config.provider
            },
            createdAt: now,
            messages: []
        };
        this.sessions.set(id, session);
        this.emit('sessionCreated', session);
        return session;
    }
    /**
     * Get a session by ID
     * @param id Session ID
     * @returns The session or undefined if not found
     */
    getSession(id) {
        return this.sessions.get(id);
    }
    /**
     * Get all active sessions
     * @returns Array of active sessions
     */
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
    /**
     * Get the current active session
     * @returns The active session or undefined if none is active
     */
    getActiveSession() {
        if (!this.activeSessionId) {
            return undefined;
        }
        return this.sessions.get(this.activeSessionId);
    }
    /**
     * Activate a session
     * @param id Session ID to activate
     * @returns True if the session was activated
     */
    activateSession(id) {
        const session = this.sessions.get(id);
        if (!session) {
            return false;
        }
        // Deactivate current active session if any
        if (this.activeSessionId && this.activeSessionId !== id) {
            this.deactivateSession(this.activeSessionId);
        }
        // Set as active
        this.activeSessionId = id;
        session.state.active = true;
        this.emit('sessionActivated', session);
        return true;
    }
    /**
     * Deactivate a session
     * @param id Session ID to deactivate
     * @returns True if the session was deactivated
     */
    deactivateSession(id) {
        const session = this.sessions.get(id);
        if (!session) {
            return false;
        }
        session.state.active = false;
        if (this.activeSessionId === id) {
            this.activeSessionId = undefined;
        }
        this.emit('sessionDeactivated', session);
        return true;
    }
    /**
     * Close and remove a session
     * @param id Session ID to close
     * @returns True if the session was closed
     */
    closeSession(id) {
        if (!this.sessions.has(id)) {
            return false;
        }
        if (this.activeSessionId === id) {
            this.activeSessionId = undefined;
        }
        const session = this.sessions.get(id);
        this.sessions.delete(id);
        this.emit('sessionClosed', session);
        return true;
    }
    /**
     * Update a session's configuration
     * @param id Session ID to update
     * @param config New session configuration
     * @returns Updated session or undefined if not found
     */
    updateSessionConfig(id, config) {
        const session = this.sessions.get(id);
        if (!session) {
            return undefined;
        }
        session.config = {
            ...session.config,
            ...config
        };
        // Update state if model or provider changed
        if (config.model) {
            session.state.model = config.model;
        }
        if (config.provider) {
            session.state.provider = config.provider;
        }
        this.emit('sessionUpdated', session);
        return session;
    }
    /**
     * Send a prompt to the LLM using the active session
     * @param prompt The prompt to send
     * @returns Promise resolving to the LLM response
     */
    async sendPrompt(prompt) {
        if (!this.activeSessionId) {
            throw new Error('No active session');
        }
        return this.sendPromptWithSession(this.activeSessionId, prompt);
    }
    /**
     * Send a prompt using a specific session
     * @param sessionId Session ID to use
     * @param prompt The prompt to send
     * @returns Promise resolving to the LLM response
     */
    async sendPromptWithSession(sessionId, prompt) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session with ID ${sessionId} not found`);
        }
        if (this.connectionManager.getConnectionStatus() !== LLMConnectionManager_1.ConnectionStatus.Connected) {
            throw new Error('LLM provider is not connected');
        }
        const provider = this.connectionManager.getProvider();
        if (!provider) {
            throw new Error('No LLM provider available');
        }
        // Update session activity timestamp
        session.state.lastActivity = Date.now();
        session.state.requestCount++;
        // Create request
        const request = {
            id: (0, uuid_1.v4)(),
            prompt,
            model: session.config.model,
            options: session.config.parameters,
            priority: 'normal', // Default priority
            timestamp: new Date(),
            status: 'pending'
        };
        try {
            // Send to provider
            const response = await provider.completePrompt(request);
            // Record message
            session.messages.push({
                prompt,
                response: response.content,
                timestamp: new Date()
            });
            // Update token count if available
            if (response.tokenUsage) {
                session.state.tokenCount += response.tokenUsage.totalTokens;
            }
            this.emit('promptCompleted', { sessionId, request, response });
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit('promptFailed', {
                sessionId,
                request,
                error: new Error(`Failed to complete prompt: ${errorMessage}`)
            });
            throw error;
        }
    }
    /**
     * Clear message history for a session
     * @param id Session ID
     * @returns True if history was cleared
     */
    clearSessionHistory(id) {
        const session = this.sessions.get(id);
        if (!session) {
            return false;
        }
        session.messages = [];
        this.emit('historyCleared', id);
        return true;
    }
    /**
     * Get session statistics
     * @param id Session ID
     * @returns Session statistics or undefined if session not found
     */
    getSessionStats(id) {
        const session = this.sessions.get(id);
        if (!session) {
            return undefined;
        }
        const errorCount = session.messages.filter(m => !m.response).length;
        const totalRequests = session.state.requestCount;
        const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;
        // Calculate average response time
        let totalResponseTime = 0;
        let responseTimes = 0;
        for (let i = 1; i < session.messages.length; i++) {
            if (session.messages[i].response) {
                totalResponseTime += session.messages[i].timestamp - session.messages[i - 1].timestamp;
                responseTimes++;
            }
        }
        const averageResponseTime = responseTimes > 0
            ? totalResponseTime / responseTimes
            : 0;
        return {
            totalRequests,
            totalTokens: session.state.tokenCount,
            averageResponseTime,
            errorRate
        };
    }
    /**
     * Set the session timeout period
     * @param timeoutMs Timeout in milliseconds
     */
    setSessionTimeout(timeoutMs) {
        if (timeoutMs < 60000) { // Minimum 1 minute
            throw new Error('Session timeout must be at least 60000ms (1 minute)');
        }
        this.sessionTimeout = timeoutMs;
    }
    /**
     * Start the session cleanup process
     */
    startSessionCleanup() {
        this.sessionCheckInterval = setInterval(() => {
            this.cleanupInactiveSessions();
        }, 60000); // Check every minute
    }
    /**
     * Cleanup inactive sessions
     */
    cleanupInactiveSessions() {
        const now = Date.now();
        const expiredSessionIds = [];
        // Find expired sessions
        for (const [id, session] of this.sessions.entries()) {
            if (!session.state.active && (now - session.state.lastActivity) > this.sessionTimeout) {
                expiredSessionIds.push(id);
            }
        }
        // Close expired sessions
        for (const id of expiredSessionIds) {
            this.closeSession(id);
            this.emit('sessionExpired', id);
        }
    }
    dispose() {
        // Clear session cleanup interval
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }
        // Close all sessions
        for (const id of this.sessions.keys()) {
            this.closeSession(id);
        }
        this.removeAllListeners();
    }
}
exports.LLMSessionManager = LLMSessionManager;
//# sourceMappingURL=LLMSessionManager.js.map