import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { Message } from './conversationManager';

export interface ConversationSnippet {
    id: string;
    title: string;
    content: string;
    messages: Message[];
    tags: string[];
    sourceConversationId?: string;
    createdAt: number;
    updatedAt: number;
}

export class SnippetManager {
    private static instance: SnippetManager;
    private snippets: Map<string, ConversationSnippet> = new Map();
    private storage: vscode.Memento;
    private _onSnippetAdded = new vscode.EventEmitter<ConversationSnippet>();
    private _onSnippetUpdated = new vscode.EventEmitter<ConversationSnippet>();
    private _onSnippetDeleted = new vscode.EventEmitter<string>();

    readonly onSnippetAdded = this._onSnippetAdded.event;
    readonly onSnippetUpdated = this._onSnippetUpdated.event;
    readonly onSnippetDeleted = this._onSnippetDeleted.event;

    private constructor(context: vscode.ExtensionContext) {
        this.storage = context.globalState;
        this.loadSnippets();
    }

    public static getInstance(context?: vscode.ExtensionContext): SnippetManager {
        if (!SnippetManager.instance && context) {
            SnippetManager.instance = new SnippetManager(context);
        }
        return SnippetManager.instance;
    }

    /**
     * Create a new snippet from selected messages
     */
    public async createSnippet(
        title: string,
        messages: Message[],
        tags: string[] = [],
        sourceConversationId?: string
    ): Promise<ConversationSnippet> {
        // Generate content from messages
        const content = this.formatMessagesAsContent(messages);
        
        const snippet: ConversationSnippet = {
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
    public async createSnippetFromContent(
        title: string,
        content: string,
        tags: string[] = []
    ): Promise<ConversationSnippet> {
        const message: Message = {
            id: this.generateMessageId(),
            role: 'assistant',
            content,
            timestamp: Date.now()
        };

        const snippet: ConversationSnippet = {
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
    public getSnippet(snippetId: string): ConversationSnippet | undefined {
        return this.snippets.get(snippetId);
    }

    /**
     * Get all snippets
     */
    public getAllSnippets(): ConversationSnippet[] {
        return Array.from(this.snippets.values());
    }

    /**
     * Update an existing snippet
     */
    public async updateSnippet(
        snippetId: string,
        updates: Partial<Omit<ConversationSnippet, 'id' | 'createdAt'>>
    ): Promise<ConversationSnippet | undefined> {
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
    public async deleteSnippet(snippetId: string): Promise<boolean> {
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
    public searchSnippets(query: string, searchInTags = true): ConversationSnippet[] {
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
    public findSnippetsByTag(tag: string): ConversationSnippet[] {
        const lowerTag = tag.toLowerCase();
        return Array.from(this.snippets.values()).filter(snippet => {
            return snippet.tags.some(t => t.toLowerCase() === lowerTag);
        });
    }

    /**
     * Get all unique tags used across snippets
     */
    public getAllTags(): string[] {
        const tags = new Set<string>();
        for (const snippet of this.snippets.values()) {
            snippet.tags.forEach(tag => tags.add(tag));
        }
        return Array.from(tags);
    }

    /**
     * Format messages as readable content
     */
    private formatMessagesAsContent(messages: Message[]): string {
        return messages.map(msg => {
            const roleLabel = msg.role === 'user' ? 'User' : 
                             msg.role === 'assistant' ? 'Assistant' : 'System';
            return `${roleLabel}: ${msg.content}`;
        }).join('\n\n');
    }

    /**
     * Generate a unique ID for a snippet
     */
    private generateId(): string {
        return `snippet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Generate a unique ID for a message
     */
    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Save snippets to storage
     */
    private async saveSnippets(): Promise<void> {
        const snippetsArray = Array.from(this.snippets.values());
        await this.storage.update('snippets', snippetsArray);
    }

    /**
     * Load snippets from storage
     */
    private loadSnippets(): void {
        const snippetsArray = this.storage.get<ConversationSnippet[]>('snippets') || [];
        for (const snippet of snippetsArray) {
            this.snippets.set(snippet.id, snippet);
        }
    }
}
