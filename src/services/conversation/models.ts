/**
 * Message type enum
 */
export enum MessageType {
    User = 'user',
    Assistant = 'assistant',
    System = 'system'
}

/**
 * Message interface
 */
export interface Message {
    id?: string;
    type: MessageType;
    content: string;
    timestamp?: number;
    metadata?: Record<string, any>;
}
