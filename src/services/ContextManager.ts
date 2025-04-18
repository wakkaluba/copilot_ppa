import * as vscode from 'vscode';
import { ChatMessage } from '../types/conversation';
import { Context, ContextWindow, LanguageUsage, FilePreference, UserPreferences } from '../types/context';

export class ContextManager {
    private static instance: ContextManager;
    private contexts: Map<string, Context> = new Map();
    private contextWindows: Map<string, ContextWindow> = new Map();
    private userPreferences: UserPreferences;
    private maxWindowSize: number = 10;
    private relevanceThreshold: number = 0.5;
    private storageKey = 'contextManager.preferences';
    private context: vscode.ExtensionContext;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.userPreferences = this.loadPreferences();
    }

    static getInstance(context?: vscode.ExtensionContext): ContextManager {
        if (!ContextManager.instance && context) {
            ContextManager.instance = new ContextManager(context);
        }
        return ContextManager.instance;
    }

    private loadPreferences(): UserPreferences {
        const stored = this.context.globalState.get<UserPreferences>(this.storageKey);
        return stored || {
            languageUsage: new Map(),
            recentFiles: []
        };
    }

    private async savePreferences(): Promise<void> {
        await this.context.globalState.update(this.storageKey, this.userPreferences);
    }

    createContext(conversationId: string): Context {
        const context: Context = {
            conversationId,
            relevantFiles: [],
            systemPrompt: this.getDefaultSystemPrompt()
        };
        this.contexts.set(conversationId, context);
        return context;
    }

    getContext(conversationId: string): Context {
        const context = this.contexts.get(conversationId);
        if (!context) {
            return this.createContext(conversationId);
        }
        return context;
    }

    updateContext(conversationId: string, updates: Partial<Context>): void {
        const context = this.getContext(conversationId);
        Object.assign(context, updates);
    }

    async updateContextWindow(conversationId: string, message: string, relevance: number): Promise<void> {
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

    setPreferredLanguage(language: string): void {
        this.userPreferences.preferredLanguage = language;
        this.incrementLanguageUsage(language);
        this.savePreferences();
    }

    getPreferredLanguage(): string | undefined {
        return this.userPreferences.preferredLanguage;
    }

    incrementLanguageUsage(language: string): void {
        const count = this.userPreferences.languageUsage.get(language) || 0;
        this.userPreferences.languageUsage.set(language, count + 1);
        this.savePreferences();
    }

    getFrequentLanguages(limit: number = 3): LanguageUsage[] {
        return Array.from(this.userPreferences.languageUsage.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([language, count]) => ({ language, count }));
    }

    setPreferredFramework(framework: string): void {
        this.userPreferences.preferredFramework = framework;
        this.savePreferences();
    }

    getPreferredFramework(): string | undefined {
        return this.userPreferences.preferredFramework;
    }

    addRecentFile(filePath: string): void {
        const now = Date.now();
        const existing = this.userPreferences.recentFiles.find(f => f.path === filePath);

        if (existing) {
            existing.lastUsed = now;
            existing.useCount++;
        } else {
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

    getRecentFiles(limit: number = 10): FilePreference[] {
        return this.userPreferences.recentFiles
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .slice(0, limit);
    }

    getMostUsedFiles(limit: number = 10): FilePreference[] {
        return this.userPreferences.recentFiles
            .sort((a, b) => b.useCount - a.useCount)
            .slice(0, limit);
    }

    private async pruneOldContexts(): Promise<void> {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [id, window] of this.contextWindows.entries()) {
            if (now - window.timestamp > maxAge) {
                this.contextWindows.delete(id);
            }
        }
    }

    private getDefaultSystemPrompt(): string {
        return `You are a helpful VS Code extension assistant.
You can help with coding tasks, explain code, and suggest improvements.
You have access to the current file and workspace context.
Always provide clear and concise responses.`;
    }

    async buildPrompt(conversationId: string, userInput: string): Promise<string> {
        const context = this.getContext(conversationId);
        let prompt = context.systemPrompt + '\n\n';

        if (context.activeFile) {
            prompt += `Current file: ${context.activeFile}\n`;
        }
        if (context.selectedCode) {
            prompt += `Selected code:\n\`\`\`${context.codeLanguage || ''}\n${context.selectedCode}\n\`\`\`\n`;
        }

        // Add relevant context from window
        const relevantContext = await this.getRelevantContext(conversationId, userInput);
        for (const ctx of relevantContext) {
            prompt += ctx + '\n';
        }

        // Add language and framework preferences if set
        if (this.userPreferences.preferredLanguage) {
            prompt += `Preferred programming language: ${this.userPreferences.preferredLanguage}\n`;
        }
        if (this.userPreferences.preferredFramework) {
            prompt += `Preferred framework: ${this.userPreferences.preferredFramework}\n`;
        }

        prompt += `User: ${userInput}\nAssistant: `;
        return prompt;
    }

    private async getRelevantContext(conversationId: string, currentPrompt: string): Promise<string[]> {
        const window = this.contextWindows.get(conversationId);
        if (!window || window.relevance < this.relevanceThreshold) {
            return [];
        }

        return this.filterByRelevance(window.messages, currentPrompt);
    }

    private async filterByRelevance(messages: string[], prompt: string): Promise<string[]> {
        // Simple relevance filtering based on time for now
        // TODO: Implement semantic similarity checking
        return messages.slice(-5);
    }

    setMaxWindowSize(size: number): void {
        this.maxWindowSize = size;
    }

    setRelevanceThreshold(threshold: number): void {
        this.relevanceThreshold = threshold;
    }

    async clearAllContextData(): Promise<void> {
        this.contexts.clear();
        this.contextWindows.clear();
        this.userPreferences = {
            languageUsage: new Map(),
            recentFiles: []
        };
        await this.savePreferences();
    }
}
