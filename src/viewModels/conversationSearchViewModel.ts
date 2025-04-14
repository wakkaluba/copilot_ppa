import * as vscode from 'vscode';
import { ConversationManager, Conversation } from '../services/conversationManager';
import { ConversationSearchService, SearchOptions, ConversationSearchResult } from '../services/conversationSearchService';

export class ConversationSearchViewModel {
    private conversationManager: ConversationManager;
    private searchService: ConversationSearchService;
    private _onConversationsChanged = new vscode.EventEmitter<Conversation[]>();
    readonly onConversationsChanged = this._onConversationsChanged.event;
    
    constructor(context: vscode.ExtensionContext) {
        this.conversationManager = ConversationManager.getInstance(context);
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
            // If no query, show all conversations
            const conversations = this.conversationManager.getAllConversations()
                .sort((a, b) => b.updatedAt - a.updatedAt);
            this._onConversationsChanged.fire(conversations);
            return conversations;
        }
        
        const searchOptions: SearchOptions = {
            query,
            searchInTitles: true,
            searchInContent: true
        };
        
        const results = await this.searchService.search(searchOptions);
        const conversations = results.map(result => result.conversation);
        
        return conversations;
    }
    
    /**
     * Apply filters to conversations
     */
    public async filterConversations(filters: {
        today?: boolean;
        week?: boolean;
        month?: boolean;
        userMessages?: boolean;
        assistantMessages?: boolean;
    }): Promise<Conversation[]> {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(now);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        // Build filter criteria
        const criteria: any = {};
        
        // Date filters
        if (filters.today) {
            criteria.dateFrom = startOfDay.getTime();
        } else if (filters.week) {
            criteria.dateFrom = startOfWeek.getTime();
        } else if (filters.month) {
            criteria.dateFrom = startOfMonth.getTime();
        }
        
        // Message type filters
        if (filters.userMessages) {
            criteria.onlyUserMessages = true;
        }
        if (filters.assistantMessages) {
            criteria.onlyAssistantMessages = true;
        }
        
        const results = await this.searchService.filter(criteria);
        this._onConversationsChanged.fire(results);
        
        return results;
    }
    
    /**
     * Reset filters and show all conversations
     */
    public resetFilters(): Conversation[] {
        const conversations = this.conversationManager.getAllConversations()
            .sort((a, b) => b.updatedAt - a.updatedAt);
        
        this._onConversationsChanged.fire(conversations);
        return conversations;
    }
    
    /**
     * Get detailed search results including message matches
     */
    public getDetailedSearchResults(): ConversationSearchResult[] {
        return this.searchService.getLastResults();
    }
    
    /**
     * Open the conversation panel with the search results highlighted
     */
    public async openConversationWithHighlights(conversationId: string): Promise<void> {
        // Find the conversation in search results
        const searchResults = this.searchService.getLastResults();
        const result = searchResults.find(r => r.conversation.id === conversationId);
        
        if (!result) {
            // Just open the conversation normally if not found in search results
            await vscode.commands.executeCommand('copilotPPA.openConversation', conversationId);
            return;
        }
        
        // Open the conversation with highlights
        await vscode.commands.executeCommand(
            'copilotPPA.openConversationWithHighlights', 
            conversationId, 
            result.matches
        );
    }
}
