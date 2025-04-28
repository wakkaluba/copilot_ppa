/**
 * Message types in conversations
 */
export enum MessageType {
    System = 'system',
    User = 'user',
    Assistant = 'assistant'
}

/**
 * Message structure for conversations
 */
export interface Message {
    id: string;
    role: MessageType;
    content: string;
    timestamp: number; // Using number type for timestamp
    metadata?: Record<string, unknown>;
}
