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
export declare class LLMSessionTrackingService extends EventEmitter {
    private readonly activeSessions;
    private readonly sessionHistory;
    private readonly stats;
    /**
     * Start a new session
     */
    startSession(sessionId: string, config: LLMSessionConfig): SessionInfo;
    /**
     * End a session
     */
    endSession(sessionId: string, state?: SessionState): void;
    /**
     * Record a successful response
     */
    recordSuccess(sessionId: string, response: LLMResponse): void;
    /**
     * Record a session error
     */
    recordError(sessionId: string, error: unknown): void;
    /**
     * Stop all active sessions
     */
    stopAllSessions(): void;
    /**
     * Handle connection error for all active sessions
     */
    handleError(error: Error): void;
    /**
     * Get session statistics
     */
    getStats(): SessionStats;
    /**
     * Get recent session history
     */
    getSessionHistory(limit?: number): SessionInfo[];
    /**
     * Get active session info
     */
    getActiveSession(sessionId: string): SessionInfo | undefined;
    /**
     * Get all active sessions
     */
    getActiveSessions(): SessionInfo[];
    private updateStats;
    dispose(): void;
}
export {};
