import * as vscode from 'vscode';
import { ConversationManager } from './conversationManager';
import { Conversation } from '../types/conversation';
export interface SearchOptions {
    query: string;
    filters?: SearchFilters;
}
export interface SearchFilters {
    dateFrom?: number;
    dateTo?: number;
    onlyUserMessages?: boolean;
    onlyAssistantMessages?: boolean;
}
export interface ConversationSearchResult {
    conversation: Conversation;
    messageMatches: {
        messageIndex: number;
        content: string;
        highlights: {
            start: number;
            end: number;
        }[];
    }[];
    score: number;
}
export declare class ConversationSearchService {
    private static instance;
    private conversationManager;
    private lastResults;
    private _onSearchResultsChanged;
    readonly onSearchResultsChanged: vscode.Event<ConversationSearchResult[]>;
    private constructor();
    static getInstance(conversationManager: ConversationManager): ConversationSearchService;
    search(options: SearchOptions): Promise<ConversationSearchResult[]>;
    filter(filters: SearchFilters): Promise<Conversation[]>;
    private findMatchingMessages;
    private calculateRelevanceScore;
    getLastResults(): ConversationSearchResult[];
    dispose(): void;
}
