"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMSessionTrackingService = void 0;
const events_1 = require("events");
/**
 * Service for tracking LLM session lifecycle and metrics
 */
class LLMSessionTrackingService extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.activeSessions = new Map();
        this.sessionHistory = [];
        this.stats = {
            totalSessions: 0,
            successfulSessions: 0,
            failedSessions: 0,
            abortedSessions: 0,
            averageSessionDuration: 0,
            totalTokensUsed: 0
        };
    }
    /**
     * Start a new session
     */
    startSession(sessionId, config) {
        const session = {
            id: sessionId,
            config,
            startTime: Date.now(),
            state: 'active'
        };
        this.activeSessions.set(sessionId, session);
        this.stats.totalSessions++;
        this.emit('sessionStarted', session);
        return session;
    }
    /**
     * End a session
     */
    endSession(sessionId, state = 'completed') {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }
        session.endTime = Date.now();
        session.state = state;
        this.updateStats(session);
        this.sessionHistory.push(session);
        this.activeSessions.delete(sessionId);
        this.emit('sessionEnded', session);
    }
    /**
     * Record a successful response
     */
    recordSuccess(sessionId, response) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }
        session.response = response;
        session.state = 'completed';
        // Update token usage stats if available
        if (response.usage?.totalTokens) {
            this.stats.totalTokensUsed += response.usage.totalTokens;
        }
        this.emit('sessionSuccess', {
            sessionId,
            response
        });
    }
    /**
     * Record a session error
     */
    recordError(sessionId, error) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }
        session.error = error instanceof Error ? error : new Error(String(error));
        session.state = 'failed';
        this.emit('sessionError', {
            sessionId,
            error: session.error
        });
    }
    /**
     * Stop all active sessions
     */
    stopAllSessions() {
        for (const sessionId of this.activeSessions.keys()) {
            this.endSession(sessionId, 'aborted');
        }
    }
    /**
     * Handle connection error for all active sessions
     */
    handleError(error) {
        for (const session of this.activeSessions.values()) {
            this.recordError(session.id, error);
            this.endSession(session.id, 'failed');
        }
    }
    /**
     * Get session statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Get recent session history
     */
    getSessionHistory(limit = 100) {
        return this.sessionHistory
            .slice(-limit)
            .map(session => ({ ...session }));
    }
    /**
     * Get active session info
     */
    getActiveSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        return session ? { ...session } : undefined;
    }
    /**
     * Get all active sessions
     */
    getActiveSessions() {
        return Array.from(this.activeSessions.values())
            .map(session => ({ ...session }));
    }
    updateStats(session) {
        if (!session.endTime) {
            return;
        }
        const duration = session.endTime - session.startTime;
        switch (session.state) {
            case 'completed':
                this.stats.successfulSessions++;
                break;
            case 'failed':
                this.stats.failedSessions++;
                break;
            case 'aborted':
                this.stats.abortedSessions++;
                break;
        }
        // Update average duration
        const totalSessions = this.stats.successfulSessions + this.stats.failedSessions;
        if (totalSessions > 0) {
            this.stats.averageSessionDuration =
                (this.stats.averageSessionDuration * (totalSessions - 1) + duration) / totalSessions;
        }
    }
    dispose() {
        this.stopAllSessions();
        this.removeAllListeners();
    }
}
exports.LLMSessionTrackingService = LLMSessionTrackingService;
//# sourceMappingURL=LLMSessionTrackingService.js.map