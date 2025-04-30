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
exports.ConversationHistory = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConversationHistory extends events_1.EventEmitter {
    conversations = new Map();
    chapters = new Map();
    context;
    mainObjectivesFile = 'project-objectives.json';
    storageDir;
    constructor(context) {
        super();
        this.context = context;
        this.storageDir = path.join(context.globalStorageUri.fsPath, 'conversations');
        this.ensureStorageDirectory();
        this.loadFromStorage();
    }
    ensureStorageDirectory() {
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }
    getConversationFilePath(id) {
        return path.join(this.storageDir, `${id}.json`);
    }
    async loadFromStorage() {
        // Load chapters from global state
        const storedChapters = this.context.globalState.get('conversationChapters', []);
        storedChapters.forEach(chapter => {
            this.chapters.set(chapter.id, chapter);
        });
        // Load conversations from files
        try {
            const files = fs.readdirSync(this.storageDir);
            for (const file of files) {
                if (file.endsWith('.json') && !file.includes('objectives')) {
                    const filePath = path.join(this.storageDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const conversation = JSON.parse(content);
                    this.conversations.set(conversation.id, conversation);
                }
            }
        }
        catch (error) {
            console.error('Error loading conversations:', error);
        }
    }
    async saveConversationToFile(conversation) {
        const filePath = this.getConversationFilePath(conversation.id);
        try {
            fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2));
        }
        catch (error) {
            console.error(`Error saving conversation ${conversation.id}:`, error);
            throw new Error(`Failed to save conversation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async deleteConversationFile(conversationId) {
        const filePath = this.getConversationFilePath(conversationId);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error(`Error deleting conversation ${conversationId}:`, error);
            throw new Error(`Failed to delete conversation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async createChapter(title, description) {
        const id = `chapter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const chapter = {
            id,
            title,
            description,
            created: Date.now(),
            updated: Date.now(),
            conversationIds: []
        };
        this.chapters.set(id, chapter);
        await this.saveToStorage();
        this.emit('chapterCreated', chapter);
        return chapter;
    }
    async addConversationToChapter(conversationId, chapterId) {
        const chapter = this.chapters.get(chapterId);
        if (!chapter) {
            throw new Error(`Chapter with ID ${chapterId} not found`);
        }
        if (!this.conversations.has(conversationId)) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        if (!chapter.conversationIds.includes(conversationId)) {
            chapter.conversationIds.push(conversationId);
            chapter.updated = Date.now();
            await this.saveToStorage();
            this.emit('conversationAddedToChapter', { conversationId, chapterId });
        }
    }
    async createConversation(title) {
        const id = `conversation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const conversation = {
            id,
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
        this.conversations.set(id, conversation);
        await this.saveConversationToFile(conversation);
        this.emit('conversationCreated', conversation);
        return conversation;
    }
    getConversation(id) {
        return this.conversations.get(id);
    }
    getAllConversations() {
        return Array.from(this.conversations.values());
    }
    async addMessage(conversationId, message) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        conversation.messages.push(message);
        conversation.updated = Date.now();
        await this.saveConversationToFile(conversation);
        this.emit('messageAdded', conversationId, message);
    }
    async updateConversationTitle(conversationId, title) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        conversation.title = title;
        conversation.updated = Date.now();
        await this.saveConversationToFile(conversation);
        this.emit('conversationUpdated', conversation);
    }
    async deleteConversation(conversationId) {
        if (!this.conversations.has(conversationId)) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        await this.deleteConversationFile(conversationId);
        this.conversations.delete(conversationId);
        this.emit('conversationDeleted', conversationId);
    }
    async clearAllConversations() {
        for (const conversation of this.conversations.values()) {
            await this.deleteConversationFile(conversation.id);
        }
        this.conversations.clear();
        this.emit('historyCleared');
    }
    async searchConversations(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.conversations.values()).filter(conversation => {
            // Search in title
            if (conversation.title.toLowerCase().includes(lowerQuery)) {
                return true;
            }
            // Search in messages
            return conversation.messages.some(message => message.content.toLowerCase().includes(lowerQuery));
        });
    }
    async exportConversation(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        return JSON.stringify(conversation, null, 2);
    }
    async importConversation(jsonData) {
        try {
            const conversation = JSON.parse(jsonData);
            // Validate required fields
            if (!conversation.id || !conversation.title) {
                throw new Error('Invalid conversation data: missing required fields');
            }
            // Generate a new ID to avoid conflicts
            const newId = `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            conversation.id = newId;
            // Set timestamps if missing
            if (!conversation.created) {
                conversation.created = Date.now();
            }
            if (!conversation.updated) {
                conversation.updated = Date.now();
            }
            // Ensure messages array exists
            if (!Array.isArray(conversation.messages)) {
                conversation.messages = [];
            }
            this.conversations.set(newId, conversation);
            await this.saveConversationToFile(conversation);
            this.emit('conversationImported', conversation);
            return conversation;
        }
        catch (error) {
            throw new Error(`Failed to import conversation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async forgetMessage(conversationId, messageId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        const index = conversation.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            conversation.messages.splice(index, 1);
            conversation.updated = Date.now();
            await this.saveConversationToFile(conversation);
            this.emit('messageRemoved', { conversationId, messageId });
        }
    }
    async updateProjectObjectives(objectives) {
        await this.context.globalState.update(this.mainObjectivesFile, objectives);
        this.emit('projectObjectivesUpdated', objectives);
    }
    async getProjectObjectives() {
        return this.context.globalState.get(this.mainObjectivesFile, []);
    }
    async addMessageReference(messageId, referenceMessageId) {
        let found = false;
        for (const conversation of this.conversations.values()) {
            const message = conversation.messages.find(m => m.id === messageId);
            if (message) {
                if (!message.references) {
                    message.references = [];
                }
                if (!message.references.includes(referenceMessageId)) {
                    message.references.push(referenceMessageId);
                    conversation.updated = Date.now();
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            throw new Error(`Message with ID ${messageId} not found`);
        }
        await this.saveToStorage();
        this.emit('messageReferenceAdded', { messageId, referenceMessageId });
    }
    getAllChapters() {
        return Array.from(this.chapters.values());
    }
    getChapter(id) {
        return this.chapters.get(id);
    }
    async deleteChapter(chapterId) {
        if (!this.chapters.has(chapterId)) {
            throw new Error(`Chapter with ID ${chapterId} not found`);
        }
        this.chapters.delete(chapterId);
        await this.saveToStorage();
        this.emit('chapterDeleted', chapterId);
    }
    dispose() {
        this.removeAllListeners();
    }
}
exports.ConversationHistory = ConversationHistory;
//# sourceMappingURL=ConversationHistory.js.map