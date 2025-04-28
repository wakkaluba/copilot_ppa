"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationMemoryService = void 0;
/**
 * Service for managing conversation memory
 */
class ConversationMemoryService {
    /**
     * Create a new ConversationMemoryService
     * @param context Extension context for state persistence
     */
    constructor(context) {
        this.messages = [];
        this.memoryLimit = 50;
        this.storageKey = 'conversation.history';
        this.context = context;
    }
    /**
     * Initialize the conversation memory from persistent storage
     */
    async initialize() {
        try {
            const storedMessages = this.context.globalState.get(this.storageKey);
            if (storedMessages) {
                this.messages = storedMessages;
            }
        }
        catch (error) {
            throw new Error(`Storage error`);
        }
    }
    /**
     * Add a message to the conversation memory
     * @param message The message to add
     */
    addMessage(message) {
        this.messages.push(message);
        // Trim to memory limit
        if (this.messages.length > this.memoryLimit) {
            this.messages = this.messages.slice(-this.memoryLimit);
        }
        // Persist changes
        this.persist();
    }
    /**
     * Get recent messages from conversation memory
     * @param limit Optional limit of messages to retrieve
     * @returns Array of recent messages
     */
    getRecentMessages(limit) {
        if (!limit || limit >= this.messages.length) {
            return [...this.messages];
        }
        return this.messages.slice(-limit);
    }
    /**
     * Clear all messages from conversation memory
     */
    async clearHistory() {
        try {
            this.messages = [];
            await this.persist();
        }
        catch (error) {
            throw new Error(`Clear error`);
        }
    }
    /**
     * Set the memory limit
     * @param limit New memory limit
     */
    setMemoryLimit(limit) {
        if (limit < 1) {
            throw new Error('Memory limit must be at least 1');
        }
        this.memoryLimit = limit;
        // Trim if necessary
        if (this.messages.length > this.memoryLimit) {
            this.messages = this.messages.slice(-this.memoryLimit);
            this.persist();
        }
    }
    /**
     * Get the total number of messages
     */
    getMessageCount() {
        return this.messages.length;
    }
    /**
     * Persist conversation memory to storage
     */
    async persist() {
        await this.context.globalState.update(this.storageKey, this.messages);
    }
    /**
     * Search messages for specific content
     * @param query Text to search for
     * @returns Messages that match the query
     */
    searchMessages(query) {
        const lowerQuery = query.toLowerCase();
        return this.messages.filter(message => message.content.toLowerCase().includes(lowerQuery));
    }
    /**
     * Group messages by type
     * @returns Object with arrays of messages by type
     */
    groupMessagesByType() {
        const result = {};
        for (const message of this.messages) {
            if (!result[message.type]) {
                result[message.type] = [];
            }
            result[message.type].push(message);
        }
        return result;
    }
}
exports.ConversationMemoryService = ConversationMemoryService;
//# sourceMappingURL=ConversationMemoryService.js.map