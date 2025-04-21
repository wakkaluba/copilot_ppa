import * as vscode from 'vscode';
import { ChatMessage } from '../types/conversation';
import { Context, ContextWindow, LanguageUsage, FilePreference, UserPreferences } from '../types/context';

/**
 * Manages conversation context and relevant file tracking
 */
export class ContextManager implements vscode.Disposable {
    private contexts: Map<string, Context> = new Map();
    private contextWindows: Map<string, ContextWindow> = new Map();
    private userPreferences: UserPreferences;
    private maxWindowSize: number = 10;
    private relevanceThreshold: number = 0.5;
    private storageKey = 'contextManager.preferences';

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly promptManager: PromptManager
    ) {
        this.userPreferences = this.loadPreferences();
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
            systemPrompt: this.promptManager.getDefaultSystemPrompt()
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
        this.contexts.set(conversationId, context);
    }

    async buildContext(input: string): Promise<Context> {
        const conversationId = crypto.randomUUID();
        const context = this.createContext(conversationId);

        // Find relevant files based on input
        const relevantFiles = await this.findRelevantFiles(input);
        context.relevantFiles = relevantFiles;

        // Update system prompt based on context
        context.systemPrompt = await this.buildContextualSystemPrompt(input, relevantFiles);

        return context;
    }

    private async findRelevantFiles(input: string): Promise<string[]> {
        // Implementation details...
        return [];
    }

    private async buildContextualSystemPrompt(input: string, relevantFiles: string[]): Promise<string> {
        return this.promptManager.buildContextualPrompt(input, relevantFiles);
    }

    updateUserPreferences(preferences: Partial<UserPreferences>): void {
        this.userPreferences = {
            ...this.userPreferences,
            ...preferences
        };
        this.savePreferences().catch(console.error);
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

    dispose(): void {
        this.contexts.clear();
        this.contextWindows.clear();
    }
}
