import * as vscode from 'vscode';
import { ConversationManager } from '../services/conversationManager';
import { ConversationSearchService, ConversationSearchResult, SearchFilters, SearchOptions } from '../services/conversationSearchService';
import { Conversation } from '../types/conversation';

export class ConversationSearchViewModel {
    private conversationManager: ConversationManager;
    private searchService: ConversationSearchService;
    private _onConversationsChanged = new vscode.EventEmitter<Conversation[]>();
    readonly onConversationsChanged = this._onConversationsChanged.event;
    
    constructor(context: vscode.ExtensionContext) {
        this.conversationManager = ConversationManager.getInstance();
        this.searchService = ConversationSearchService.getInstance(this.conversationManager);
        
        // Listen for search results changes
        this.searchService.onSearchResultsChanged(results => {
            const conversations = results.map(result => result.conversation);
            this._onConversationsChanged.fire(conversations);
        });
    }
    
    /**
     * Search conversations with a simple text query
     */
    public async quickSearch(query: string): Promise<Conversation[]> {
        if (!query.trim()) {
            return this.conversationManager.listConversations();
        }
        
        const searchOptions: SearchOptions = {
            query: query.trim()
        };
        
        const results = await this.searchService.search(searchOptions);
        return results.map(result => result.conversation);
    }
    
    /**
     * Apply filters to conversations
     */
    public async filterConversations(filters: SearchFilters): Promise<Conversation[]> {
        const results = await this.searchService.filter(filters);
        this._onConversationsChanged.fire(results);
        return results;
    }
    
    /**
     * Reset filters and show all conversations
     */
    public resetFilters(): Conversation[] {
        const conversations = this.conversationManager.listConversations();
        this._onConversationsChanged.fire(conversations);
        return conversations;
    }
    
    /**
     * Get detailed search results including message matches
     */
    public getDetailedSearchResults(): ConversationSearchResult[] {
        return this.searchService.getLastResults();
    }

    public dispose() {
        this._onConversationsChanged.dispose();
    }
}
