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
exports.ConversationSearchViewModel = void 0;
const vscode = __importStar(require("vscode"));
const conversationManager_1 = require("../services/conversationManager");
const conversationSearchService_1 = require("../services/conversationSearchService");
class ConversationSearchViewModel {
    constructor(context) {
        this._onConversationsChanged = new vscode.EventEmitter();
        this.onConversationsChanged = this._onConversationsChanged.event;
        this.conversationManager = conversationManager_1.ConversationManager.getInstance(context);
        this.searchService = conversationSearchService_1.ConversationSearchService.getInstance(this.conversationManager);
        // Listen for search results changes
        this.searchService.onSearchResultsChanged(results => {
            const conversations = results.map(result => result.conversation);
            this._onConversationsChanged.fire(conversations);
        });
    }
    /**
     * Search conversations with a simple text query
     */
    async quickSearch(query) {
        if (!query.trim()) {
            // If no query, show all conversations
            const conversations = this.conversationManager.getAllConversations()
                .sort((a, b) => b.updatedAt - a.updatedAt);
            this._onConversationsChanged.fire(conversations);
            return conversations;
        }
        const searchOptions = {
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
    async filterConversations(filters) {
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
        const criteria = {};
        // Date filters
        if (filters.today) {
            criteria.dateFrom = startOfDay.getTime();
        }
        else if (filters.week) {
            criteria.dateFrom = startOfWeek.getTime();
        }
        else if (filters.month) {
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
    resetFilters() {
        const conversations = this.conversationManager.getAllConversations()
            .sort((a, b) => b.updatedAt - a.updatedAt);
        this._onConversationsChanged.fire(conversations);
        return conversations;
    }
    /**
     * Get detailed search results including message matches
     */
    getDetailedSearchResults() {
        return this.searchService.getLastResults();
    }
    /**
     * Open the conversation panel with the search results highlighted
     */
    async openConversationWithHighlights(conversationId) {
        // Find the conversation in search results
        const searchResults = this.searchService.getLastResults();
        const result = searchResults.find(r => r.conversation.id === conversationId);
        if (!result) {
            // Just open the conversation normally if not found in search results
            await vscode.commands.executeCommand('copilotPPA.openConversation', conversationId);
            return;
        }
        // Open the conversation with highlights
        await vscode.commands.executeCommand('copilotPPA.openConversationWithHighlights', conversationId, result.matches);
    }
}
exports.ConversationSearchViewModel = ConversationSearchViewModel;
//# sourceMappingURL=conversationSearchViewModel.js.map