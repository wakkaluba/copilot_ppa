import * as vscode from 'vscode';
import { Conversation, Message, ConversationManager } from './conversationManager';

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

export interface ConversationSearchResult {
    conversation: Conversation;
    matches: MessageMatch[];
    titleMatch?: boolean;
    score: number;
}

export interface MessageMatch {
    message: Message;
    matchPositions: [number, number][]; // Start and end positions of matches
}

export class ConversationSearchService {
    private static instance: ConversationSearchService;
    private conversationManager: ConversationManager;
    private _onSearchResultsChanged = new vscode.EventEmitter<ConversationSearchResult[]>();
    readonly onSearchResultsChanged = this._onSearchResultsChanged.event;
    private lastResults: ConversationSearchResult[] = [];

    private constructor(conversationManager: ConversationManager) {
        this.conversationManager = conversationManager;
    }

    public static getInstance(conversationManager?: ConversationManager): ConversationSearchService {
        if (!ConversationSearchService.instance && conversationManager) {
            ConversationSearchService.instance = new ConversationSearchService(conversationManager);
        }
        return ConversationSearchService.instance;
    }

    public getLastResults(): ConversationSearchResult[] {
        return this.lastResults;
    }

    public async search(options: SearchOptions): Promise<ConversationSearchResult[]> {
        // Default options
        const searchOptions: Required<SearchOptions> = {
            query: options.query,
            searchInTitles: options.searchInTitles !== false,
            searchInContent: options.searchInContent !== false,
            caseSensitive: !!options.caseSensitive,
            useRegex: !!options.useRegex,
            dateFrom: options.dateFrom || 0,
            dateTo: options.dateTo || Number.MAX_SAFE_INTEGER,
            onlyUserMessages: !!options.onlyUserMessages,
            onlyAssistantMessages: !!options.onlyAssistantMessages,
            maxResults: options.maxResults || 100
        };

        const conversations = this.conversationManager.getAllConversations();
        const results: ConversationSearchResult[] = [];

        if (!searchOptions.query.trim()) {
            // Return conversations sorted by last updated date if no query
            const sortedConversations = conversations
                .filter(conv => conv.updatedAt >= searchOptions.dateFrom && 
                                conv.updatedAt <= searchOptions.dateTo)
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, searchOptions.maxResults);
            
            this.lastResults = sortedConversations.map(conv => ({
                conversation: conv,
                matches: [],
                score: 1,
            }));
            
            this._onSearchResultsChanged.fire(this.lastResults);
            return this.lastResults;
        }

        // Build regex pattern for searching
        let searchPattern: RegExp;
        try {
            if (searchOptions.useRegex) {
                searchPattern = new RegExp(
                    searchOptions.query, 
                    searchOptions.caseSensitive ? 'g' : 'gi'
                );
            } else {
                const escapedQuery = this.escapeRegExp(searchOptions.query);
                searchPattern = new RegExp(
                    escapedQuery, 
                    searchOptions.caseSensitive ? 'g' : 'gi'
                );
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Invalid search pattern: ${error.message}`);
            return [];
        }

        // Search through each conversation
        for (const conversation of conversations) {
            // Skip conversations outside the date range
            if (conversation.updatedAt < searchOptions.dateFrom || 
                conversation.updatedAt > searchOptions.dateTo) {
                continue;
            }

            let titleMatch = false;
            const matches: MessageMatch[] = [];
            let score = 0;

            // Search in title
            if (searchOptions.searchInTitles) {
                searchPattern.lastIndex = 0;
                titleMatch = searchPattern.test(conversation.title);
                if (titleMatch) {
                    score += 10; // Title matches are worth more
                }
            }

            // Search in messages
            if (searchOptions.searchInContent) {
                for (const message of conversation.messages) {
                    // Skip messages based on role filter
                    if ((searchOptions.onlyUserMessages && message.role !== 'user') ||
                        (searchOptions.onlyAssistantMessages && message.role !== 'assistant')) {
                        continue;
                    }

                    const messageMatches: [number, number][] = [];
                    searchPattern.lastIndex = 0;
                    let match: RegExpExecArray | null;
                    
                    while ((match = searchPattern.exec(message.content)) !== null) {
                        messageMatches.push([match.index, match.index + match[0].length]);
                    }

                    if (messageMatches.length > 0) {
                        matches.push({
                            message,
                            matchPositions: messageMatches
                        });
                        score += messageMatches.length;
                    }
                }
            }

            // Add to results if there's a match
            if (titleMatch || matches.length > 0) {
                results.push({
                    conversation,
                    matches,
                    titleMatch,
                    score
                });
            }
        }

        // Sort by score (most relevant first) and limit the number of results
        results.sort((a, b) => b.score - a.score);
        const limitedResults = results.slice(0, searchOptions.maxResults);
        
        this.lastResults = limitedResults;
        this._onSearchResultsChanged.fire(this.lastResults);
        return limitedResults;
    }

    /**
     * Filter conversations based on criteria
     * @param criteria Filtering criteria
     */
    public async filter(criteria: {
        dateFrom?: number;
        dateTo?: number;
        onlyUserMessages?: boolean;
        onlyAssistantMessages?: boolean;
        minMessages?: number;
    }): Promise<Conversation[]> {
        const conversations = this.conversationManager.getAllConversations();
        const filtered = conversations.filter(conv => {
            // Date range filter
            if (criteria.dateFrom && conv.updatedAt < criteria.dateFrom) {
                return false;
            }
            if (criteria.dateTo && conv.updatedAt > criteria.dateTo) {
                return false;
            }

            // Minimum messages count
            if (criteria.minMessages && conv.messages.length < criteria.minMessages) {
                return false;
            }

            // Message type filters - only apply if the conversation has no messages matching the criteria
            if (criteria.onlyUserMessages && 
                !conv.messages.some(msg => msg.role === 'user')) {
                return false;
            }
            if (criteria.onlyAssistantMessages && 
                !conv.messages.some(msg => msg.role === 'assistant')) {
                return false;
            }

            return true;
        });

        // Sort by last updated
        filtered.sort((a, b) => b.updatedAt - a.updatedAt);
        return filtered;
    }

    /**
     * Escape special characters for regex
     */
    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
