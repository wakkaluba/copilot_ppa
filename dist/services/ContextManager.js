"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
/**
 * Manages conversation context and relevant file tracking
 */
class ContextManager {
    context;
    promptManager;
    contexts = new Map();
    contextWindows = new Map();
    userPreferences;
    maxWindowSize = 10;
    relevanceThreshold = 0.5;
    storageKey = 'contextManager.preferences';
    constructor(context, promptManager) {
        this.context = context;
        this.promptManager = promptManager;
        this.userPreferences = this.loadPreferences();
    }
    loadPreferences() {
        const stored = this.context.globalState.get(this.storageKey);
        return stored || {
            languageUsage: new Map(),
            recentFiles: []
        };
    }
    async savePreferences() {
        await this.context.globalState.update(this.storageKey, this.userPreferences);
    }
    createContext(conversationId) {
        const context = {
            conversationId,
            relevantFiles: [],
            systemPrompt: this.promptManager.getDefaultSystemPrompt()
        };
        this.contexts.set(conversationId, context);
        return context;
    }
    getContext(conversationId) {
        const context = this.contexts.get(conversationId);
        if (!context) {
            return this.createContext(conversationId);
        }
        return context;
    }
    updateContext(conversationId, updates) {
        const context = this.getContext(conversationId);
        Object.assign(context, updates);
        this.contexts.set(conversationId, context);
    }
    async buildContext(input) {
        const conversationId = crypto.randomUUID();
        const context = this.createContext(conversationId);
        // Find relevant files based on input
        const relevantFiles = await this.findRelevantFiles(input);
        context.relevantFiles = relevantFiles;
        // Update system prompt based on context
        context.systemPrompt = await this.buildContextualSystemPrompt(input, relevantFiles);
        return context;
    }
    async findRelevantFiles(input) {
        // Implementation details...
        return [];
    }
    async buildContextualSystemPrompt(input, relevantFiles) {
        return this.promptManager.buildContextualPrompt(input, relevantFiles);
    }
    updateUserPreferences(preferences) {
        this.userPreferences = {
            ...this.userPreferences,
            ...preferences
        };
        this.savePreferences().catch(console.error);
    }
    async updateContextWindow(conversationId, message, relevance) {
        const window = this.contextWindows.get(conversationId) || {
            messages: [],
            relevance: 0,
            timestamp: Date.now()
        };
        window.messages.push(message);
        if (window.messages.length > this.maxWindowSize) {
            window.messages.shift();
        }
        window.relevance = (window.relevance + relevance) / 2;
        window.timestamp = Date.now();
        this.contextWindows.set(conversationId, window);
        await this.pruneOldContexts();
    }
    setPreferredLanguage(language) {
        this.userPreferences.preferredLanguage = language;
        this.incrementLanguageUsage(language);
        this.savePreferences();
    }
    getPreferredLanguage() {
        return this.userPreferences.preferredLanguage;
    }
    incrementLanguageUsage(language) {
        const count = this.userPreferences.languageUsage.get(language) || 0;
        this.userPreferences.languageUsage.set(language, count + 1);
        this.savePreferences();
    }
    getFrequentLanguages(limit = 3) {
        return Array.from(this.userPreferences.languageUsage.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([language, count]) => ({ language, count }));
    }
    setPreferredFramework(framework) {
        this.userPreferences.preferredFramework = framework;
        this.savePreferences();
    }
    getPreferredFramework() {
        return this.userPreferences.preferredFramework;
    }
    addRecentFile(filePath) {
        const now = Date.now();
        const existing = this.userPreferences.recentFiles.find(f => f.path === filePath);
        if (existing) {
            existing.lastUsed = now;
            existing.useCount++;
        }
        else {
            this.userPreferences.recentFiles.push({
                path: filePath,
                lastUsed: now,
                useCount: 1
            });
        }
        // Keep only most recent files
        this.userPreferences.recentFiles = this.userPreferences.recentFiles
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .slice(0, 50); // Keep last 50 files
        this.savePreferences();
    }
    getRecentFiles(limit = 10) {
        return this.userPreferences.recentFiles
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .slice(0, limit);
    }
    getMostUsedFiles(limit = 10) {
        return this.userPreferences.recentFiles
            .sort((a, b) => b.useCount - a.useCount)
            .slice(0, limit);
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
    dispose() {
        this.contexts.clear();
        this.contextWindows.clear();
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map