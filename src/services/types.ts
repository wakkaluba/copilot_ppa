export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    references?: string[]; // IDs of referenced messages
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    created: number;
    updated: number;
}

export interface Chapter {
    id: string;
    title: string;
    description?: string;
    created: number;
    updated: number;
    conversationIds: string[];
}