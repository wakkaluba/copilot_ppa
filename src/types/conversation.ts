export interface IChatMessage {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface IConversation {
    id: string;
    title: string;
    messages: IChatMessage[];
    created: number;
    updated: number;
}

export interface IConversationSearchResult {
    conversation: IConversation;
    matches: IMessageMatch[];
    titleMatch?: boolean;
    score: number;
}

export interface IMessageMatch {
    message: IChatMessage;
    matchPositions: [number, number][]; // Start and end positions of matches
}

export interface ISearchOptions {
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