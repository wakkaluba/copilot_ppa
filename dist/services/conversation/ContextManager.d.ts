import * as vscode from 'vscode';
import { Message } from './models';
/**
 * Manages contextual information for conversations
 */
export declare class ContextManager {
    private static instance;
    private memoryService;
    private userPrefsService;
    private filePrefsService;
    private analysisService;
    private activeFiles;
    private context;
    private disposables;
    /**
     * Get the singleton instance
     */
    static getInstance(context?: vscode.ExtensionContext): ContextManager;
    /**
     * Create a new ContextManager
     */
    private constructor();
    /**
     * Initialize the context manager and its services
     */
    initialize(): Promise<void>;
    /**
     * Track currently open editor files
     */
    private trackActiveEditors;
    /**
     * Track a file being used
     */
    trackFile(filePath: string): void;
    /**
     * Extract file extension from path
     */
    private getFileExtension;
    /**
     * Add a message for context processing
     */
    addMessage(message: Message): void;
    /**
     * Process a user message for context
     */
    processUserMessage(message: Message): void;
    /**
     * Process an assistant message
     */
    processAssistantMessage(message: Message): void;
    /**
     * Get recent conversation history
     * @param inputOrCount - Either the current input text for generating suggestions or the number of messages to retrieve
     * @returns Array of messages or suggestions
     */
    getRecentHistory(inputOrCount?: string | number): Promise<any>;
    /**
     * Get all conversation history
     */
    getAllHistory(): Message[];
    /**
     * Clear conversation history
     */
    clearHistory(): Promise<void>;
    /**
     * Get user preferences
     */
    getUserPreferences<T>(key: string, defaultValue?: T): T;
    /**
     * Set user preference
     */
    setUserPreference(key: string, value: any): Promise<void>;
    /**
     * Get preferred programming language
     */
    getPreferredLanguage(): string | undefined;
    /**
     * Get preferred framework
     */
    getPreferredFramework(): string | undefined;
    /**
     * Get frequently used file extensions
     */
    getPreferredFileExtensions(limit?: number): string[];
    /**
     * Get recent file extensions (alias for getPreferredFileExtensions)
     */
    getRecentFileExtensions(limit?: number): string[];
    /**
     * Get active files
     */
    getActiveFiles(): string[];
    /**
     * Get directories the user is working with
     */
    getRecentDirectories(limit?: number): string[];
    /**
     * Get file naming patterns
     */
    getFileNamingPatterns(): string[];
    /**
     * Build context string for prompting
     */
    buildContextString(): string;
    /**
     * Clear all context data
     */
    clearContext(): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
