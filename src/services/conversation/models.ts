/**
 * Types of messages in a conversation
 */
export enum MessageType {
    USER = 'user',
    SYSTEM = 'system',
    ASSISTANT = 'assistant',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}

/**
 * Message in a conversation
 */
export interface Message {
    /**
     * Message content
     */
    content: string;
    
    /**
     * Message type
     */
    type: MessageType;
    
    /**
     * Timestamp when message was created
     */
    timestamp: number;
    
    /**
     * Optional metadata for the message
     */
    metadata?: Record<string, any>;
}
