export interface IChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface IChatSession {
    id: string;
    messages: IChatMessage[];
}

export interface IChatErrorEvent {
    error: Error | string | unknown;
}

export interface IConnectionStatus {
    state: 'connected' | 'disconnected';
    message?: string;
    isInputDisabled?: boolean;
}