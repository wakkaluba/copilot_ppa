import * as vscode from 'vscode';
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
export declare class SnippetManager {
    private static instance;
    private snippets;
    private storage;
    private _onSnippetAdded;
    private _onSnippetUpdated;
    private _onSnippetDeleted;
    readonly onSnippetAdded: vscode.Event<ConversationSnippet>;
    readonly onSnippetUpdated: vscode.Event<ConversationSnippet>;
    readonly onSnippetDeleted: vscode.Event<string>;
    private constructor();
    static getInstance(context?: vscode.ExtensionContext): SnippetManager;
    /**
     * Create a new snippet from selected messages
     */
    createSnippet(title: string, messages: Message[], tags?: string[], sourceConversationId?: string): Promise<ConversationSnippet>;
    /**
     * Create a new snippet from raw content
     */
    createSnippetFromContent(title: string, content: string, tags?: string[]): Promise<ConversationSnippet>;
    /**
     * Get a snippet by ID
     */
    getSnippet(snippetId: string): ConversationSnippet | undefined;
    /**
     * Get all snippets
     */
    getAllSnippets(): ConversationSnippet[];
    /**
     * Update an existing snippet
     */
    updateSnippet(snippetId: string, updates: Partial<Omit<ConversationSnippet, 'id' | 'createdAt'>>): Promise<ConversationSnippet | undefined>;
    /**
     * Delete a snippet
     */
    deleteSnippet(snippetId: string): Promise<boolean>;
    /**
     * Search snippets by title, content, or tags
     */
    searchSnippets(query: string, searchInTags?: boolean): ConversationSnippet[];
    /**
     * Find snippets by tag
     */
    findSnippetsByTag(tag: string): ConversationSnippet[];
    /**
     * Get all unique tags used across snippets
     */
    getAllTags(): string[];
    /**
     * Format messages as readable content
     */
    private formatMessagesAsContent;
    /**
     * Generate a unique ID for a snippet
     */
    private generateId;
    /**
     * Generate a unique ID for a message
     */
    private generateMessageId;
    /**
     * Save snippets to storage
     */
    private saveSnippets;
    /**
     * Load snippets from storage
     */
    private loadSnippets;
}
