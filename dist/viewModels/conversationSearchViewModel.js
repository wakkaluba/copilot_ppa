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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationSearchViewModel = void 0;
const vscode = __importStar(require("vscode"));
const conversationManager_1 = require("../services/conversationManager");
const conversationSearchService_1 = require("../services/conversationSearchService");
class ConversationSearchViewModel {
    constructor(context) {
        this._onConversationsChanged = new vscode.EventEmitter();
        this.onConversationsChanged = this._onConversationsChanged.event;
        this.conversationManager = conversationManager_1.ConversationManager.getInstance();
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
            return this.conversationManager.listConversations();
        }
        const searchOptions = {
            query: query.trim()
        };
        const results = await this.searchService.search(searchOptions);
        return results.map(result => result.conversation);
    }
    /**
     * Apply filters to conversations
     */
    async filterConversations(filters) {
        const results = await this.searchService.filter(filters);
        this._onConversationsChanged.fire(results);
        return results;
    }
    /**
     * Reset filters and show all conversations
     */
    resetFilters() {
        const conversations = this.conversationManager.listConversations();
        this._onConversationsChanged.fire(conversations);
        return conversations;
    }
    /**
     * Get detailed search results including message matches
     */
    getDetailedSearchResults() {
        return this.searchService.getLastResults();
    }
    dispose() {
        this._onConversationsChanged.dispose();
    }
}
exports.ConversationSearchViewModel = ConversationSearchViewModel;
//# sourceMappingURL=conversationSearchViewModel.js.map