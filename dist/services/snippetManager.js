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
exports.SnippetManager = void 0;
const vscode = __importStar(require("vscode"));
class SnippetManager {
    static instance;
    snippets = new Map();
    storage;
    _onSnippetAdded = new vscode.EventEmitter();
    _onSnippetUpdated = new vscode.EventEmitter();
    _onSnippetDeleted = new vscode.EventEmitter();
    onSnippetAdded = this._onSnippetAdded.event;
    onSnippetUpdated = this._onSnippetUpdated.event;
    onSnippetDeleted = this._onSnippetDeleted.event;
    constructor(context) {
        this.storage = context.globalState;
        this.loadSnippets();
    }
    static getInstance(context) {
        if (!SnippetManager.instance && context) {
            SnippetManager.instance = new SnippetManager(context);
        }
        return SnippetManager.instance;
    }
    /**
     * Create a new snippet from selected messages
     */
    async createSnippet(title, messages, tags = [], sourceConversationId) {
        // Generate content from messages
        const content = this.formatMessagesAsContent(messages);
        const snippet = {
            id: this.generateId(),
            title,
            content,
            messages,
            tags,
            sourceConversationId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.snippets.set(snippet.id, snippet);
        await this.saveSnippets();
        this._onSnippetAdded.fire(snippet);
        return snippet;
    }
    /**
     * Create a new snippet from raw content
     */
    async createSnippetFromContent(title, content, tags = []) {
        const message = {
            id: this.generateMessageId(),
            role: 'assistant',
            content,
            timestamp: new Date()
        };
        const snippet = {
            id: this.generateId(),
            title,
            content,
            messages: [message],
            tags,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.snippets.set(snippet.id, snippet);
        await this.saveSnippets();
        this._onSnippetAdded.fire(snippet);
        return snippet;
    }
    /**
     * Get a snippet by ID
     */
    getSnippet(snippetId) {
        return this.snippets.get(snippetId);
    }
    /**
     * Get all snippets
     */
    getAllSnippets() {
        return Array.from(this.snippets.values());
    }
    /**
     * Update an existing snippet
     */
    async updateSnippet(snippetId, updates) {
        const snippet = this.snippets.get(snippetId);
        if (!snippet) {
            return undefined;
        }
        // Apply updates
        Object.assign(snippet, {
            ...updates,
            updatedAt: Date.now()
        });
        // If messages were updated, regenerate content
        if (updates.messages) {
            snippet.content = this.formatMessagesAsContent(snippet.messages);
        }
        await this.saveSnippets();
        this._onSnippetUpdated.fire(snippet);
        return snippet;
    }
    /**
     * Delete a snippet
     */
    async deleteSnippet(snippetId) {
        if (!this.snippets.has(snippetId)) {
            return false;
        }
        this.snippets.delete(snippetId);
        await this.saveSnippets();
        this._onSnippetDeleted.fire(snippetId);
        return true;
    }
    /**
     * Search snippets by title, content, or tags
     */
    searchSnippets(query, searchInTags = true) {
        if (!query.trim()) {
            return this.getAllSnippets();
        }
        const lowerQuery = query.toLowerCase();
        return Array.from(this.snippets.values()).filter(snippet => {
            return snippet.title.toLowerCase().includes(lowerQuery) ||
                snippet.content.toLowerCase().includes(lowerQuery) ||
                (searchInTags && snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
        });
    }
    /**
     * Find snippets by tag
     */
    findSnippetsByTag(tag) {
        const lowerTag = tag.toLowerCase();
        return Array.from(this.snippets.values()).filter(snippet => {
            return snippet.tags.some(t => t.toLowerCase() === lowerTag);
        });
    }
    /**
     * Get all unique tags used across snippets
     */
    getAllTags() {
        const tags = new Set();
        for (const snippet of this.snippets.values()) {
            snippet.tags.forEach(tag => tags.add(tag));
        }
        return Array.from(tags);
    }
    /**
     * Format messages as readable content
     */
    formatMessagesAsContent(messages) {
        return messages.map(msg => {
            const roleLabel = msg.role === 'user' ? 'User' :
                msg.role === 'assistant' ? 'Assistant' : 'System';
            return `${roleLabel}: ${msg.content}`;
        }).join('\n\n');
    }
    /**
     * Generate a unique ID for a snippet
     */
    generateId() {
        return `snippet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
     * Generate a unique ID for a message
     */
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
     * Save snippets to storage
     */
    async saveSnippets() {
        const snippetsArray = Array.from(this.snippets.values());
        await this.storage.update('snippets', snippetsArray);
    }
    /**
     * Load snippets from storage
     */
    loadSnippets() {
        const snippetsArray = this.storage.get('snippets') || [];
        for (const snippet of snippetsArray) {
            this.snippets.set(snippet.id, snippet);
        }
    }
}
exports.SnippetManager = SnippetManager;
//# sourceMappingURL=snippetManager.js.map