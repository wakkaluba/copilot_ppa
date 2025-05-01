import * as vscode from 'vscode';

export interface IConversationMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface IConversationMemory {
    initialize(): Promise<void>;
    addMessage(message: IConversationMessage): void;
    getRecentMessages(limit: number): IConversationMessage[];
    getAllMessages(): IConversationMessage[];
    clearHistory(): Promise<void>;
    searchMessages(term: string): IConversationMessage[];
    getMessagesByDateRange(startTime: number, endTime: number): IConversationMessage[];
}

export interface IUserPreferences {
    initialize(): Promise<void>;
    setPreferredLanguage(language: string): void;
    getPreferredLanguage(): string | undefined;
    setPreferredFramework(framework: string): void;
    getPreferredFramework(): string | undefined;
    incrementLanguageUsage(language: string): void;
    getFrequentLanguages(limit: number): { language: string; count: number }[];
    clearPreferences(): Promise<void>;
}

export interface IFilePreferences {
    /**
     * Initialize the file preferences system
     */
    initialize(): Promise<void>;

    /**
     * Add a file extension to recent extensions list
     */
    addRecentExtension(extension: string): void;

    /**
     * Get most recently used file extensions
     * @param limit Maximum number of extensions to return
     */
    getRecentExtensions(limit: number): string[];

    /**
     * Add a directory to recent directories list
     */
    addRecentDirectory(directory: string): void;

    /**
     * Get most recently used directories
     * @param limit Maximum number of directories to return
     */
    getRecentDirectories(limit: number): string[];

    /**
     * Add a new file naming pattern
     */
    addNamingPattern(pattern: string): void;

    /**
     * Get all registered file naming patterns
     */
    getNamingPatterns(): string[];

    /**
     * Clear all stored preferences
     */
    clearPreferences(): Promise<void>;
}

export interface IContextManager extends vscode.Disposable {
    /**
     * Add a message to the conversation history
     */
    addMessage(message: IConversationMessage): void;

    /**
     * Get recent conversation messages
     * @param limit Maximum number of messages to return
     */
    getConversationHistory(limit?: number): IConversationMessage[];

    /**
     * Get the user's preferred programming language
     */
    getPreferredLanguage(): string | undefined;

    /**
     * Get most frequently used programming languages
     * @param limit Maximum number of languages to return
     */
    getFrequentLanguages(limit?: number): { language: string; count: number }[];

    /**
     * Get user's preferred framework if any
     */
    getPreferredFramework(): string | undefined;

    /**
     * Get recent file extensions from workspace
     * @param limit Maximum number of extensions to return
     */
    getRecentFileExtensions(limit?: number): string[];

    /**
     * Get recent directories from workspace
     * @param limit Maximum number of directories to return
     */
    getRecentDirectories(limit?: number): string[];

    /**
     * Get file naming patterns used in workspace
     */
    getFileNamingPatterns(): string[];

    /**
     * Build context string from current state
     */
    buildContextString(): string;

    /**
     * Generate input suggestions based on context
     */
    generateSuggestions(currentInput: string): string[];

    /**
     * Clear all context data
     */
    clearAllContextData(): Promise<void>;
}
