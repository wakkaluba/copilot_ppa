import * as vscode from 'vscode';
import { ConversationSearchResult, SearchFilters } from '../services/conversationSearchService';
import { Conversation } from '../types/conversation';
export declare class ConversationSearchViewModel {
    private conversationManager;
    private searchService;
    private _onConversationsChanged;
    readonly onConversationsChanged: vscode.Event<Conversation[]>;
    constructor(context: vscode.ExtensionContext);
    /**
     * Search conversations with a simple text query
     */
    quickSearch(query: string): Promise<Conversation[]>;
    /**
     * Apply filters to conversations
     */
    filterConversations(filters: SearchFilters): Promise<Conversation[]>;
    /**
     * Reset filters and show all conversations
     */
    resetFilters(): Conversation[];
    /**
     * Get detailed search results including message matches
     */
    getDetailedSearchResults(): ConversationSearchResult[];
    dispose(): void;
}
