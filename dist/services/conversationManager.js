"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationManager = void 0;
const WorkspaceManager_1 = require("./WorkspaceManager");
class ConversationManager {
    constructor() {
        this.currentConversation = null;
        this.historyPath = 'conversations';
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ConversationManager();
        }
        return this.instance;
    }
    async startNewConversation(title) {
        await this.saveCurrentConversation();
        this.currentConversation = {
            id: this.generateId(),
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
    }
    async addMessage(role, content) {
        if (!this.currentConversation) {
            await this.startNewConversation('New Conversation');
        }
        const message = {
            role,
            content,
            timestamp: Date.now()
        };
        this.currentConversation.messages.push(message);
        this.currentConversation.updated = Date.now();
        await this.autoSave();
    }
    async loadConversation(id) {
        try {
            const filePath = `${this.historyPath}/${id}.json`;
            const content = await this.workspaceManager.readFile(filePath);
            this.currentConversation = JSON.parse(content);
            return true;
        }
        catch {
            return false;
        }
    }
    async listConversations() {
        try {
            const files = await this.workspaceManager.listFiles(this.historyPath);
            const conversations = await Promise.all(files.map(async (file) => {
                const content = await this.workspaceManager.readFile(file);
                const conv = JSON.parse(content);
                return {
                    id: conv.id,
                    title: conv.title,
                    updated: conv.updated
                };
            }));
            return conversations.sort((a, b) => b.updated - a.updated);
        }
        catch {
            return [];
        }
    }
    getCurrentContext(maxMessages = 10) {
        if (!this.currentConversation)
            return [];
        return this.currentConversation.messages.slice(-maxMessages);
    }
    async autoSave() {
        if (this.currentConversation) {
            await this.saveCurrentConversation();
        }
    }
    async saveCurrentConversation() {
        if (!this.currentConversation)
            return;
        const filePath = `${this.historyPath}/${this.currentConversation.id}.json`;
        await this.workspaceManager.createDirectory(this.historyPath);
        await this.workspaceManager.writeFile(filePath, JSON.stringify(this.currentConversation, null, 2));
    }
    generateId() {
        return `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
}
exports.ConversationManager = ConversationManager;
//# sourceMappingURL=conversationManager.js.map