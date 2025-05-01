import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import {
    ILLMMessage,
    ILLMRequest,
    ILLMRequestOptions
} from '../types';

export interface ISessionConfig {
    id: string;
    model: string;
    provider: string;
    systemPrompt?: string;
    options?: ILLMRequestOptions;
    maxHistory?: number;
    timeoutMs?: number;
}

export interface ISessionState {
    id: string;
    messages: ILLMMessage[];
    lastActivity: number;
    totalTokens: number;
    activeRequest?: ILLMRequest;
}

export interface ISessionMetrics {
    requestCount: number;
    totalTokens: number;
    averageLatency: number;
    errorCount: number;
}

@injectable()
export class LLMSessionManager extends EventEmitter {
    private readonly sessions = new Map<string, ISessionState>();
    private readonly metrics = new Map<string, ISessionMetrics>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public async createSession(config: ISessionConfig): Promise<string> {
        try {
            const session: ISessionState = {
                id: config.id,
                messages: [],
                lastActivity: Date.now(),
                totalTokens: 0
            };

            if (config.systemPrompt) {
                session.messages.push({
                    role: 'system',
                    content: config.systemPrompt
                });
            }

            this.sessions.set(config.id, session);
            this.metrics.set(config.id, {
                requestCount: 0,
                totalTokens: 0,
                averageLatency: 0,
                errorCount: 0
            });

            this.emit('sessionCreated', { sessionId: config.id });
            return config.id;
        } catch (error) {
            this.handleError('Failed to create session', error as Error);
            throw error;
        }
    }

    public async addMessage(sessionId: string, message: ILLMMessage): Promise<void> {
        try {
            const session = this.getSession(sessionId);
            session.messages.push(message);
            session.lastActivity = Date.now();

            this.emit('messageAdded', { sessionId, message });
        } catch (error) {
            this.handleError('Failed to add message', error as Error);
            throw error;
        }
    }

    public getSessionHistory(sessionId: string): ILLMMessage[] {
        const session = this.getSession(sessionId);
        return [...session.messages];
    }

    public getSessionMetrics(sessionId: string): ISessionMetrics {
        const metrics = this.metrics.get(sessionId);
        if (!metrics) {
            throw new Error(`Session ${sessionId} not found`);
        }
        return { ...metrics };
    }

    public async clearSession(sessionId: string): Promise<void> {
        try {
            const session = this.getSession(sessionId);
            const systemMessage = session.messages.find(m => m.role === 'system');

            session.messages = systemMessage ? [systemMessage] : [];
            session.lastActivity = Date.now();
            session.totalTokens = 0;

            this.metrics.set(sessionId, {
                requestCount: 0,
                totalTokens: 0,
                averageLatency: 0,
                errorCount: 0
            });

            this.emit('sessionCleared', { sessionId });
        } catch (error) {
            this.handleError('Failed to clear session', error as Error);
            throw error;
        }
    }

    public async deleteSession(sessionId: string): Promise<void> {
        if (!this.sessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} not found`);
        }

        this.sessions.delete(sessionId);
        this.metrics.delete(sessionId);
        this.emit('sessionDeleted', { sessionId });
    }

    private getSession(sessionId: string): ISessionState {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        return session;
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[LLMSessionManager]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.sessions.clear();
        this.metrics.clear();
        this.removeAllListeners();
    }
}
