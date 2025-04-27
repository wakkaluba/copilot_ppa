"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationMemory = void 0;
class ConversationMemory {
    constructor(context) {
        this._messages = [];
        this._storageKey = 'conversationMemory';
        this._maxHistorySize = 200; // Store up to 200 messages
        this._context = context;
    }
    async initialize() {
        try {
            const storedData = this._context.globalState.get(this._storageKey);
            if (storedData && Array.isArray(storedData)) {
                this._messages = storedData;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to initialize conversation memory:', errorMessage);
            throw new Error(`Failed to initialize conversation memory: ${errorMessage}`);
        }
    }
    addMessage(message) {
        this._messages.push(message);
        // Trim history if it exceeds the maximum size
        if (this._messages.length > this._maxHistorySize) {
            this._messages = this._messages.slice(-this._maxHistorySize);
        }
        // Save to storage
        this.saveToStorage().catch(error => {
            console.error('Failed to save conversation memory:', error);
        });
    }
    getRecentMessages(limit) {
        return this._messages.slice(-limit);
    }
    getAllMessages() {
        return [...this._messages];
    }
    async clearHistory() {
        try {
            this._messages = [];
            await this._context.globalState.update(this._storageKey, []);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear conversation history: ${errorMessage}`);
        }
    }
    searchMessages(term) {
        const lowerTerm = term.toLowerCase();
        return this._messages.filter(msg => msg.content.toLowerCase().includes(lowerTerm));
    }
    getMessagesByDateRange(startTime, endTime) {
        return this._messages.filter(msg => msg.timestamp >= startTime && msg.timestamp <= endTime);
    }
    async saveToStorage() {
        try {
            await this._context.globalState.update(this._storageKey, this._messages);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to save conversation memory: ${errorMessage}`);
        }
    }
}
exports.ConversationMemory = ConversationMemory;
//# sourceMappingURL=ConversationMemory.js.map