export interface ChatMessage {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
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
    matchPositions: [number, number][]; // Start and end positions of matches
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