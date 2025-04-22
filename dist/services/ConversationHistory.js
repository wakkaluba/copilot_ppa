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
exports.ConversationHistory = exports.ConversationError = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const logger_1 = require("./logger");
const events_1 = require("events");
const uuid_1 = require("uuid");
class ConversationError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'ConversationError';
    }
}
exports.ConversationError = ConversationError;
class ConversationHistory extends events_1.EventEmitter {
    static instance;
    conversations = new Map();
    storageDir;
    logger = new logger_1.Logger('ConversationHistory');
    initialized = false;
    constructor(context) {
        super();
        this.storageDir = path.join(context.globalStorageUri.fsPath, 'conversations');
    }
    static getInstance(context) {
        if (!ConversationHistory.instance) {
            ConversationHistory.instance = new ConversationHistory(context);
        }
        return ConversationHistory.instance;
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            await fs.mkdir(this.storageDir, { recursive: true });
            await this.loadConversations();
            this.initialized = true;
            this.logger.info('Conversation history initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize conversation history:', error);
            throw new ConversationError('init_failed', `Failed to initialize: ${error.message}`);
        }
    }
    async createConversation(title, metadata) {
        if (!this.initialized) {
            throw new ConversationError('not_initialized', 'ConversationHistory not initialized');
        }
        this.validateTitle(title);
        const conversation = {
            id: this.generateId(),
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now(),
            metadata
        };
        this.conversations.set(conversation.id, conversation);
        await this.saveConversation(conversation);
        this.emit('conversation:created', conversation);
        this.logger.info(`Created conversation ${conversation.id}: ${title}`);
        return conversation;
    }
    async addMessage(conversationId, message) {
        if (!this.initialized) {
            throw new ConversationError('not_initialized', 'ConversationHistory not initialized');
        }
        const conversation = this.getConversationOrThrow(conversationId);
        this.validateMessage(message);
        conversation.messages.push(message);
        conversation.updated = Date.now();
        await this.saveConversation(conversation);
        this.emit('message:added', conversationId, message);
        this.emit('conversation:updated', conversation);
        this.logger.info(`Added message to conversation ${conversationId}`);
    }
    getConversation(id) {
        return this.conversations.get(id);
    }
    getAllConversations() {
        return Array.from(this.conversations.values())
            .sort((a, b) => b.updated - a.updated);
    }
    async deleteConversation(id) {
        if (!this.initialized) {
            throw new ConversationError('not_initialized', 'ConversationHistory not initialized');
        }
        const conversation = this.getConversationOrThrow(id);
        try {
            const filePath = this.getConversationPath(id);
            await fs.unlink(filePath);
            this.conversations.delete(id);
            this.emit('conversation:deleted', id);
            this.logger.info(`Deleted conversation ${id}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete conversation ${id}:`, error);
            throw new ConversationError('delete_failed', `Failed to delete conversation: ${error.message}`);
        }
    }
    async searchConversations(query) {
        const normalizedQuery = query.toLowerCase();
        return this.getAllConversations()
            .filter(conv => {
            const titleMatch = conv.title.toLowerCase().includes(normalizedQuery);
            const contentMatch = conv.messages.some(msg => msg.content.toLowerCase().includes(normalizedQuery));
            const tagMatch = conv.metadata?.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery));
            return titleMatch || contentMatch || tagMatch;
        });
    }
    async exportConversation(id, format = 'json') {
        const conversation = this.getConversationOrThrow(id);
        if (format === 'markdown') {
            return this.convertToMarkdown(conversation);
        }
        return JSON.stringify(conversation, null, 2);
    }
    async importConversation(data, format = 'json') {
        try {
            let conversation;
            if (format === 'json') {
                conversation = this.validateConversation(JSON.parse(data));
            }
            else {
                conversation = this.parseMarkdown(data);
            }
            // Ensure unique ID
            conversation.id = this.generateId();
            this.conversations.set(conversation.id, conversation);
            await this.saveConversation(conversation);
            this.emit('conversation:created', conversation);
            return conversation;
        }
        catch (error) {
            throw new ConversationError('import_failed', `Failed to import conversation: ${error.message}`);
        }
    }
    async loadConversations() {
        try {
            const files = await fs.readdir(this.storageDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const content = await fs.readFile(path.join(this.storageDir, file), 'utf-8');
                    const conversation = this.validateConversation(JSON.parse(content));
                    this.conversations.set(conversation.id, conversation);
                }
            }
            this.logger.info(`Loaded ${this.conversations.size} conversations`);
        }
        catch (error) {
            this.logger.error('Failed to load conversations:', error);
            throw new ConversationError('load_failed', `Failed to load conversations: ${error.message}`);
        }
    }
    async saveConversation(conversation) {
        try {
            const filePath = this.getConversationPath(conversation.id);
            await fs.writeFile(filePath, JSON.stringify(conversation, null, 2), 'utf-8');
        }
        catch (error) {
            this.logger.error(`Failed to save conversation ${conversation.id}:`, error);
            throw new ConversationError('save_failed', `Failed to save conversation: ${error.message}`);
        }
    }
    getConversationPath(id) {
        return path.join(this.storageDir, `${id}.json`);
    }
    getConversationOrThrow(id) {
        const conversation = this.conversations.get(id);
        if (!conversation) {
            throw new ConversationError('not_found', `Conversation not found: ${id}`);
        }
        return conversation;
    }
    validateTitle(title) {
        if (!title || title.trim().length === 0) {
            throw new ConversationError('invalid_title', 'Title cannot be empty');
        }
        if (title.length > 100) {
            throw new ConversationError('invalid_title', 'Title cannot be longer than 100 characters');
        }
    }
    validateMessage(message) {
        if (!message.content || message.content.trim().length === 0) {
            throw new ConversationError('invalid_message', 'Message content cannot be empty');
        }
        if (!['user', 'assistant', 'system'].includes(message.role)) {
            throw new ConversationError('invalid_message', 'Invalid message role');
        }
        if (!message.timestamp || typeof message.timestamp !== 'number') {
            throw new ConversationError('invalid_message', 'Invalid message timestamp');
        }
    }
    validateConversation(data) {
        const conv = data;
        if (!conv || typeof conv !== 'object') {
            throw new ConversationError('invalid_format', 'Invalid conversation format');
        }
        if (!conv.id || typeof conv.id !== 'string' || !(0, uuid_1.validate)(conv.id)) {
            throw new ConversationError('invalid_id', 'Invalid conversation ID');
        }
        this.validateTitle(conv.title);
        if (!Array.isArray(conv.messages)) {
            throw new ConversationError('invalid_messages', 'Messages must be an array');
        }
        conv.messages.forEach(this.validateMessage.bind(this));
        if (!conv.created || !conv.updated ||
            typeof conv.created !== 'number' ||
            typeof conv.updated !== 'number') {
            throw new ConversationError('invalid_timestamps', 'Invalid timestamps');
        }
        return conv;
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    convertToMarkdown(conversation) {
        let md = `# ${conversation.title}\n\n`;
        if (conversation.metadata?.tags?.length) {
            md += `Tags: ${conversation.metadata.tags.join(', ')}\n\n`;
        }
        md += `Created: ${new Date(conversation.created).toISOString()}\n`;
        md += `Updated: ${new Date(conversation.updated).toISOString()}\n\n`;
        conversation.messages.forEach(msg => {
            md += `## ${msg.role}\n`;
            md += `${msg.content}\n\n`;
        });
        return md;
    }
    parseMarkdown(markdown) {
        const lines = markdown.split('\n');
        const title = lines[0].replace('# ', '');
        const messages = [];
        let currentMessage = null;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('## ')) {
                if (currentMessage?.role && currentMessage.content) {
                    messages.push({
                        role: currentMessage.role,
                        content: currentMessage.content.trim(),
                        timestamp: Date.now()
                    });
                }
                currentMessage = {
                    role: line.replace('## ', '').trim(),
                    content: ''
                };
            }
            else if (currentMessage) {
                currentMessage.content = (currentMessage.content || '') + line + '\n';
            }
        }
        if (currentMessage?.role && currentMessage.content) {
            messages.push({
                role: currentMessage.role,
                content: currentMessage.content.trim(),
                timestamp: Date.now()
            });
        }
        return {
            id: this.generateId(),
            title,
            messages,
            created: Date.now(),
            updated: Date.now()
        };
    }
}
exports.ConversationHistory = ConversationHistory;
//# sourceMappingURL=ConversationHistory.js.map