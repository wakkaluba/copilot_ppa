/**
 * Represents a chat message in a conversation
 */
export interface ChatMessage {
    /** Unique identifier for the message */
    id?: string;
    /** Role of the message sender */
    role: 'user' | 'assistant' | 'system';
    /** Content of the message */
    content: string;
    /** Timestamp when the message was created (milliseconds since epoch or ISO string) */
    timestamp: number | string;
    /** Any additional properties that might be attached to the message */
    [key: string]: unknown;
}
export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    created: number;
    updated: number;
}
export interface ConversationSearchResult {
    conversation: Conversation;
    matches: MessageMatch[];
    titleMatch?: boolean;
    score: number;
}
export interface MessageMatch {
    message: ChatMessage;
    matchPositions: [number, number][];
}
export interface SearchOptions {
    query: string;
    searchInTitles?: boolean;
    searchInContent?: boolean;
    caseSensitive?: boolean;
    useRegex?: boolean;
    dateFrom?: number;
    dateTo?: number;
    onlyUserMessages?: boolean;
    onlyAssistantMessages?: boolean;
    maxResults?: number;
}
