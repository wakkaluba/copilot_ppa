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
        highlights: { start: number; end: number; }[];
    }[];
    score: number;
}

export class ConversationSearchService {
    private static instance: ConversationSearchService;
    private conversationManager: ConversationManager;
    private lastResults: ConversationSearchResult[] = [];
    private _onSearchResultsChanged = new vscode.EventEmitter<ConversationSearchResult[]>();
    readonly onSearchResultsChanged = this._onSearchResultsChanged.event;

    private constructor(conversationManager: ConversationManager) {
        this.conversationManager = conversationManager;
    }

    public static getInstance(conversationManager: ConversationManager): ConversationSearchService {
        if (!ConversationSearchService.instance) {
            ConversationSearchService.instance = new ConversationSearchService(conversationManager);
        }
        return ConversationSearchService.instance;
    }

    public async search(options: SearchOptions): Promise<ConversationSearchResult[]> {
        const allConversations = this.conversationManager.getConversations();
        const results: ConversationSearchResult[] = [];

        for (const conversation of allConversations) {
            const messageMatches = this.findMatchingMessages(conversation, options.query);
            if (messageMatches.length > 0) {
                const score = this.calculateRelevanceScore(messageMatches, options.query);
                results.push({
                    conversation,
                    messageMatches,
                    score
                });
            }
        }

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);
        
        this.lastResults = results;
        this._onSearchResultsChanged.fire(results);
        
        return results;
    }

    public async filter(filters: SearchFilters): Promise<Conversation[]> {
        const allConversations = this.conversationManager.getConversations();
        
        return allConversations.filter(conversation => {
            // Apply date filters
            if (filters.dateFrom && conversation.created < filters.dateFrom) {
                return false;
            }
            if (filters.dateTo && conversation.created > filters.dateTo) {
                return false;
            }

            // Apply message type filters
            if (filters.onlyUserMessages || filters.onlyAssistantMessages) {
                const hasMatchingMessage = conversation.messages.some(message => {
                    if (filters.onlyUserMessages && message.role === 'user') return true;
                    if (filters.onlyAssistantMessages && message.role === 'assistant') return true;
                    return false;
                });
                if (!hasMatchingMessage) return false;
            }

            return true;
        });
    }

    private findMatchingMessages(conversation: Conversation, query: string): ConversationSearchResult['messageMatches'] {
        const matches: ConversationSearchResult['messageMatches'] = [];
        const queryLower = query.toLowerCase();

        conversation.messages.forEach((message, index) => {
            const contentLower = message.content.toLowerCase();
            const position = contentLower.indexOf(queryLower);
            
            if (position !== -1) {
                matches.push({
                    messageIndex: index,
                    content: message.content,
                    highlights: [{
                        start: position,
                        end: position + query.length
                    }]
                });
            }
        });

        return matches;
    }

    private calculateRelevanceScore(matches: ConversationSearchResult['messageMatches'], query: string): number {
        let score = 0;
        
        for (const match of matches) {
            // More recent messages get higher scores
            const recencyBonus = 1 + (match.messageIndex * 0.1);
            
            // More matches in the same message increase the score
            const matchCount = match.highlights.length;
            
            // Exact matches get higher scores
            const exactMatchBonus = match.content.toLowerCase().includes(query.toLowerCase()) ? 1.5 : 1;
            
            score += recencyBonus * matchCount * exactMatchBonus;
        }
        
        return score;
    }

    public getLastResults(): ConversationSearchResult[] {
        return this.lastResults;
    }

    public dispose() {
        this._onSearchResultsChanged.dispose();
    }
}
