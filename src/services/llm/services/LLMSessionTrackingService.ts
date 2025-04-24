import { EventEmitter } from 'events';
import { LLMSessionConfig, LLMResponse, SessionState, SessionStats } from '../types';

interface SessionInfo {
    id: string;
    config: LLMSessionConfig;
    startTime: number;
    endTime?: number;
    state: SessionState;
    error?: Error;
    response?: LLMResponse;
}

/**
 * Service for tracking LLM session lifecycle and metrics
 */
export class LLMSessionTrackingService extends EventEmitter {
    private readonly activeSessions = new Map<string, SessionInfo>();
    private readonly sessionHistory: SessionInfo[] = [];
    private readonly stats: SessionStats = {
        totalSessions: 0,
        successfulSessions: 0,
        failedSessions: 0,
        abortedSessions: 0,
        averageSessionDuration: 0,
        totalTokensUsed: 0
    };

    /**
     * Start a new session
     */
    public startSession(sessionId: string, config: LLMSessionConfig): SessionInfo {
        const session: SessionInfo = {
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
    public endSession(sessionId: string, state: SessionState = 'completed'): void {
        const session = this.activeSessions.get(sessionId);
        if (!session) {return;}

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
    public recordSuccess(sessionId: string, response: LLMResponse): void {
        const session = this.activeSessions.get(sessionId);
        if (!session) {return;}

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
    public recordError(sessionId: string, error: unknown): void {
        const session = this.activeSessions.get(sessionId);
        if (!session) {return;}

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
    public stopAllSessions(): void {
        for (const sessionId of this.activeSessions.keys()) {
            this.endSession(sessionId, 'aborted');
        }
    }

    /**
     * Handle connection error for all active sessions
     */
    public handleError(error: Error): void {
        for (const session of this.activeSessions.values()) {
            this.recordError(session.id, error);
            this.endSession(session.id, 'failed');
        }
    }

    /**
     * Get session statistics
     */
    public getStats(): SessionStats {
        return { ...this.stats };
    }

    /**
     * Get recent session history
     */
    public getSessionHistory(limit = 100): SessionInfo[] {
        return this.sessionHistory
            .slice(-limit)
            .map(session => ({ ...session }));
    }

    /**
     * Get active session info
     */
    public getActiveSession(sessionId: string): SessionInfo | undefined {
        const session = this.activeSessions.get(sessionId);
        return session ? { ...session } : undefined;
    }

    /**
     * Get all active sessions
     */
    public getActiveSessions(): SessionInfo[] {
        return Array.from(this.activeSessions.values())
            .map(session => ({ ...session }));
    }

    private updateStats(session: SessionInfo): void {
        if (!session.endTime) {return;}

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

    public dispose(): void {
        this.stopAllSessions();
        this.removeAllListeners();
    }
}