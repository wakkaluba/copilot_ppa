import { IChatMessage, IChatSession, IChatErrorEvent, IConnectionStatus } from '../../models/interfaces';
import { Event } from 'vscode';
export interface ILLMProvider {
    isConnected(): boolean;
    connect(): Promise<void>;
    generateResponse(prompt: string, options: {
        context?: string;
    }, onProgress?: (content: string) => void): Promise<void>;
}
export interface ILLMChatManager {
    createSession(): Promise<IChatSession>;
    getSessionMessages(sessionId: string): IChatMessage[];
    handleUserMessage(sessionId: string, content: string): Promise<void>;
    clearSessionHistory(sessionId: string): Promise<void>;
    getConnectionStatus(): IConnectionStatus;
    onMessageHandled: Event<void>;
    onHistoryCleared: Event<void>;
    onError: Event<IChatErrorEvent>;
    onConnectionStatusChanged: Event<void>;
}
