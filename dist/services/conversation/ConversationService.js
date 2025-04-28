"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const ConversationMemoryService_1 = require("./services/ConversationMemoryService");
/**
 * Service for managing conversation history and state
 */
class ConversationService {
    /**
     * Create a new ConversationService
     * @param context Extension context for state persistence
     */
    constructor(context) {
        this.conversationMemoryService = new ConversationMemoryService_1.ConversationMemoryService(context);
    }
    /**
     * Initialize the conversation service
     */
    async initialize() {
        await this.conversationMemoryService.initialize();
    }
    /**
     * Add a message to the conversation history
     * @param message Message to add
     */
    addMessage(message) {
        this.conversationMemoryService.addMessage(message);
    }
    /**
     * Get recent messages from conversation history
     * @param limit Optional limit for number of messages
     * @returns Array of recent messages
     */
    getRecentMessages(limit) {
        return this.conversationMemoryService.getRecentMessages(limit);
    }
    /**
     * Clear conversation history
     */
    async clearHistory() {
        await this.conversationMemoryService.clearHistory();
    }
}
exports.ConversationService = ConversationService;
//# sourceMappingURL=ConversationService.js.map