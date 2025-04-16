"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationSearchService = void 0;
const vscode = __importStar(require("vscode"));
class ConversationSearchService {
    constructor(conversationManager) {
        this._onSearchResultsChanged = new vscode.EventEmitter();
        this.onSearchResultsChanged = this._onSearchResultsChanged.event;
        this.lastResults = [];
        this.conversationManager = conversationManager;
    }
    static getInstance(conversationManager) {
        if (!ConversationSearchService.instance && conversationManager) {
            ConversationSearchService.instance = new ConversationSearchService(conversationManager);
        }
        return ConversationSearchService.instance;
    }
    getLastResults() {
        return this.lastResults;
    }
    async search(options) {
        // Default options
        const searchOptions = {
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
        const results = [];
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
        let searchPattern;
        try {
            if (searchOptions.useRegex) {
                searchPattern = new RegExp(searchOptions.query, searchOptions.caseSensitive ? 'g' : 'gi');
            }
            else {
                const escapedQuery = this.escapeRegExp(searchOptions.query);
                searchPattern = new RegExp(escapedQuery, searchOptions.caseSensitive ? 'g' : 'gi');
            }
        }
        catch (error) {
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
            const matches = [];
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
                    const messageMatches = [];
                    searchPattern.lastIndex = 0;
                    let match;
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
    async filter(criteria) {
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
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
exports.ConversationSearchService = ConversationSearchService;
//# sourceMappingURL=conversationSearchService.js.map