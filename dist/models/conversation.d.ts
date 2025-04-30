/**
 * Interface for Conversation model
 */
export interface Conversation {
    id: string;
    title: string;
    messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: number | string;
        id?: string;
        [key: string]: unknown;
    }[];
    createdAt: number;
    updatedAt: number;
}
