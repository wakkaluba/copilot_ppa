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
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
class ConversationHistory {
    constructor(context) {
        this.conversations = new Map();
        this.storageDir = path.join(context.globalStorageUri.fsPath, 'conversations');
    }
    static getInstance(context) {
        if (!ConversationHistory.instance) {
            ConversationHistory.instance = new ConversationHistory(context);
        }
        return ConversationHistory.instance;
    }
    async initialize() {
        try {
            await fs.mkdir(this.storageDir, { recursive: true });
            await this.loadConversations();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize conversation history: ${error}`);
        }
    }
    async createConversation(title) {
        const conversation = {
            id: Date.now().toString(),
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
        this.conversations.set(conversation.id, conversation);
        await this.saveConversation(conversation);
        return conversation;
    }
    async addMessage(conversationId, message) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation not found: ${conversationId}`);
        }
        conversation.messages.push(message);
        conversation.updated = Date.now();
        await this.saveConversation(conversation);
    }
    getConversation(id) {
        return this.conversations.get(id);
    }
    getAllConversations() {
        return Array.from(this.conversations.values());
    }
    async loadConversations() {
        try {
            const files = await fs.readdir(this.storageDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const content = await fs.readFile(path.join(this.storageDir, file), 'utf-8');
                    const conversation = JSON.parse(content);
                    this.conversations.set(conversation.id, conversation);
                }
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to load conversations: ${error}`);
        }
    }
    async saveConversation(conversation) {
        try {
            const filePath = path.join(this.storageDir, `${conversation.id}.json`);
            await fs.writeFile(filePath, JSON.stringify(conversation, null, 2), 'utf-8');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to save conversation: ${error}`);
        }
    }
}
exports.ConversationHistory = ConversationHistory;
//# sourceMappingURL=ConversationHistory.js.map