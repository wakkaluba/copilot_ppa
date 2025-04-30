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
    static instance;
    conversationManager;
    lastResults = [];
    _onSearchResultsChanged = new vscode.EventEmitter();
    onSearchResultsChanged = this._onSearchResultsChanged.event;
    constructor(conversationManager) {
        this.conversationManager = conversationManager;
    }
    static getInstance(conversationManager) {
        if (!ConversationSearchService.instance) {
            ConversationSearchService.instance = new ConversationSearchService(conversationManager);
        }
        return ConversationSearchService.instance;
    }
    async search(options) {
        const allConversations = this.conversationManager.getConversations();
        const results = [];
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
    async filter(filters) {
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
                    if (filters.onlyUserMessages && message.role === 'user') {
                        return true;
                    }
                    if (filters.onlyAssistantMessages && message.role === 'assistant') {
                        return true;
                    }
                    return false;
                });
                if (!hasMatchingMessage) {
                    return false;
                }
            }
            return true;
        });
    }
    findMatchingMessages(conversation, query) {
        const matches = [];
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
    calculateRelevanceScore(matches, query) {
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
    getLastResults() {
        return this.lastResults;
    }
    dispose() {
        this._onSearchResultsChanged.dispose();
    }
}
exports.ConversationSearchService = ConversationSearchService;
//# sourceMappingURL=conversationSearchService.js.map