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
exports.ConversationMemoryService = void 0;
const crypto = __importStar(require("crypto"));
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
        this.maxHistory = 100;
        this.context = context;
    }
    /**
     * Initialize service
     */
    async initialize() {
        // Load messages from storage
        const storedMessages = this.context.globalState.get('conversationMemory');
        if (storedMessages) {
            try {
                this.messages = JSON.parse(storedMessages);
            }
            catch (error) {
                console.error('Failed to parse stored messages', error);
                this.messages = [];
            }
        }
    }
    /**
     * Add a message to memory
     * @param message Message to add
     */
    addMessage(message) {
        // Generate ID if not provided
        if (!message.id) {
            message.id = crypto.randomUUID();
        }
        // Add timestamp if not provided
        if (!message.timestamp) {
            message.timestamp = Date.now();
        }
        this.messages.push(message);
        // Limit history size
        if (this.messages.length > this.maxHistory) {
            this.messages = this.messages.slice(-this.maxHistory);
        }
        // Save to storage
        this.saveMessages();
    }
    /**
     * Get all messages
     */
    getMessages() {
        return [...this.messages];
    }
    /**
     * Get recent messages
     * @param limit Maximum number of messages to return
     */
    getRecentMessages(limit = 10) {
        return this.messages.slice(-limit);
    }
    /**
     * Get messages by date range
     * @param startDate Start date timestamp
     * @param endDate End date timestamp
     */
    getMessagesByDateRange(startDate, endDate) {
        return this.messages.filter(msg => (msg.timestamp || 0) >= startDate && (msg.timestamp || 0) <= endDate);
    }
    /**
     * Clear all messages
     */
    async clearMessages() {
        this.messages = [];
        await this.saveMessages();
    }
    /**
     * Clear all history (alias for clearMessages)
     */
    async clearHistory() {
        await this.clearMessages();
    }
    /**
     * Save messages to storage
     */
    async saveMessages() {
        await this.context.globalState.update('conversationMemory', JSON.stringify(this.messages));
    }
}
exports.ConversationMemoryService = ConversationMemoryService;
//# sourceMappingURL=ConversationMemoryService.js.map