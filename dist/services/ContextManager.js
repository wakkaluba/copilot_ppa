"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const ConversationManager_1 = require("./ConversationManager");
const PromptManager_1 = require("./PromptManager");
class ContextManager {
    constructor(history) {
        this.contexts = new Map();
        this.maxWindowSize = 10;
        this.relevanceThreshold = 0.5;
        this.history = history;
        this.contextWindows = new Map();
    }
    static getInstance(history) {
        if (!ContextManager.instance) {
            ContextManager.instance = new ContextManager(history);
        }
        return ContextManager.instance;
    }
    createContext(conversationId) {
        const context = {
            conversationId,
            relevantFiles: [],
            systemPrompt: this.getDefaultSystemPrompt()
        };
        this.contexts.set(conversationId, context);
        return context;
    }
    updateContext(conversationId, updates) {
        const context = this.contexts.get(conversationId);
        if (!context) {
            throw new Error(`Context not found for conversation: ${conversationId}`);
        }
        Object.assign(context, updates);
    }
    getContext(conversationId) {
        const context = this.contexts.get(conversationId);
        if (!context) {
            return this.createContext(conversationId);
        }
        return context;
    }
    async buildPrompt(conversationId, userInput) {
        const context = this.getContext(conversationId);
        const conversation = this.history.getConversation(conversationId);
        let prompt = context.systemPrompt + '\n\n';
        if (context.activeFile) {
            prompt += `Current file: ${context.activeFile}\n`;
        }
        if (context.selectedCode) {
            prompt += `Selected code:\n\`\`\`${context.codeLanguage || ''}\n${context.selectedCode}\n\`\`\`\n`;
        }
        // Add recent conversation history
        if (conversation) {
            const recentMessages = conversation.messages.slice(-5);
            for (const msg of recentMessages) {
                prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            }
        }
        prompt += `User: ${userInput}\nAssistant: `;
        return prompt;
    }
    getDefaultSystemPrompt() {
        return `You are a helpful VS Code extension assistant.
You can help with coding tasks, explain code, and suggest improvements.
You have access to the current file and workspace context.
Always provide clear and concise responses.`;
    }
    async buildContext(conversationId, currentPrompt) {
        const conversationManager = ConversationManager_1.ConversationManager.getInstance();
        const promptManager = PromptManager_1.PromptManager.getInstance();
        const context = await this.getRelevantContext(conversationId, currentPrompt);
        // Combine conversation history with relevant context
        const history = conversationManager.getCurrentContext(this.maxWindowSize);
        return [...context, ...history.map(msg => msg.content)];
    }
    async updateContext(conversationId, message, relevance) {
        const window = this.contextWindows.get(conversationId) || {
            messages: [],
            relevance: 0,
            timestamp: Date.now()
        };
        // Add new message to context window
        window.messages.push(message);
        if (window.messages.length > this.maxWindowSize) {
            window.messages.shift();
        }
        // Update relevance score
        window.relevance = (window.relevance + relevance) / 2;
        window.timestamp = Date.now();
        this.contextWindows.set(conversationId, window);
        await this.pruneOldContexts();
    }
    async getRelevantContext(conversationId, currentPrompt) {
        const window = this.contextWindows.get(conversationId);
        if (!window || window.relevance < this.relevanceThreshold) {
            return [];
        }
        // Filter context by semantic similarity to current prompt
        const relevantMessages = await this.filterByRelevance(window.messages, currentPrompt);
        return relevantMessages;
    }
    async filterByRelevance(messages, prompt) {
        // Simple relevance filtering based on time for now
        // TODO: Implement semantic similarity checking
        const recentMessages = messages.slice(-5);
        return recentMessages;
    }
    async pruneOldContexts() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        for (const [id, window] of this.contextWindows.entries()) {
            if (now - window.timestamp > maxAge) {
                this.contextWindows.delete(id);
            }
        }
    }
    setMaxWindowSize(size) {
        this.maxWindowSize = size;
    }
    setRelevanceThreshold(threshold) {
        this.relevanceThreshold = threshold;
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map