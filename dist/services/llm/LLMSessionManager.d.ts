import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMSessionConfig, SessionState, SessionStats, LLMResponse } from '../../llm/types';
import { LLMConnectionManager } from './LLMConnectionManager';
import { LLMHostManager } from './LLMHostManager';
export interface Session {
    id: string;
    config: LLMSessionConfig;
    state: SessionState;
    createdAt: number;
    messages: Array<{
        prompt: string;
        response?: string;
        timestamp: number;
    }>;
}
export declare class LLMSessionManager extends EventEmitter implements vscode.Disposable {
    private sessions;
    private activeSessionId?;
    private readonly connectionManager;
    private readonly hostManager;
    private sessionTimeout;
    private sessionCheckInterval?;
    constructor(connectionManager: LLMConnectionManager, hostManager: LLMHostManager);
    /**
     * Create a new LLM session
     * @param config Session configuration
     * @returns The created session
     */
    createSession(config: LLMSessionConfig): Session;
    /**
     * Get a session by ID
     * @param id Session ID
     * @returns The session or undefined if not found
     */
    getSession(id: string): Session | undefined;
    /**
     * Get all active sessions
     * @returns Array of active sessions
     */
    getAllSessions(): Session[];
    /**
     * Get the current active session
     * @returns The active session or undefined if none is active
     */
    getActiveSession(): Session | undefined;
    /**
     * Activate a session
     * @param id Session ID to activate
     * @returns True if the session was activated
     */
    activateSession(id: string): boolean;
    /**
     * Deactivate a session
     * @param id Session ID to deactivate
     * @returns True if the session was deactivated
     */
    deactivateSession(id: string): boolean;
    /**
     * Close and remove a session
     * @param id Session ID to close
     * @returns True if the session was closed
     */
    closeSession(id: string): boolean;
    /**
     * Update a session's configuration
     * @param id Session ID to update
     * @param config New session configuration
     * @returns Updated session or undefined if not found
     */
    updateSessionConfig(id: string, config: Partial<LLMSessionConfig>): Session | undefined;
    /**
     * Send a prompt to the LLM using the active session
     * @param prompt The prompt to send
     * @returns Promise resolving to the LLM response
     */
    sendPrompt(prompt: string): Promise<LLMResponse>;
    /**
     * Send a prompt using a specific session
     * @param sessionId Session ID to use
     * @param prompt The prompt to send
     * @returns Promise resolving to the LLM response
     */
    sendPromptWithSession(sessionId: string, prompt: string): Promise<LLMResponse>;
    /**
     * Clear message history for a session
     * @param id Session ID
     * @returns True if history was cleared
     */
    clearSessionHistory(id: string): boolean;
    /**
     * Get session statistics
     * @param id Session ID
     * @returns Session statistics or undefined if session not found
     */
    getSessionStats(id: string): SessionStats | undefined;
    /**
     * Set the session timeout period
     * @param timeoutMs Timeout in milliseconds
     */
    setSessionTimeout(timeoutMs: number): void;
    /**
     * Start the session cleanup process
     */
    private startSessionCleanup;
    /**
     * Cleanup inactive sessions
     */
    private cleanupInactiveSessions;
    dispose(): void;
}
