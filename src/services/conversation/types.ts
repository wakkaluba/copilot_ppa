import * as vscode from 'vscode';

export interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface IConversationMemory {
    initialize(): Promise<void>;
    addMessage(message: ConversationMessage): void;
    getRecentMessages(limit: number): ConversationMessage[];
    getAllMessages(): ConversationMessage[];
    clearHistory(): Promise<void>;
    searchMessages(term: string): ConversationMessage[];
    getMessagesByDateRange(startTime: number, endTime: number): ConversationMessage[];
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
    initialize(): Promise<void>;
    addRecentExtension(extension: string): void;
    getRecentExtensions(limit: number): string[];
    addRecentDirectory(directory: string): void;
    getRecentDirectories(limit: number): string[];
    addNamingPattern(pattern: string): void;
    getNamingPatterns(): string[];
    clearPreferences(): Promise<void>;
}

export interface IContextManager extends vscode.Disposable {
    addMessage(message: ConversationMessage): void;
    getConversationHistory(limit?: number): ConversationMessage[];
    getPreferredLanguage(): string | undefined;
    getFrequentLanguages(limit?: number): { language: string; count: number }[];
    getPreferredFramework(): string | undefined;
    getRecentFileExtensions(limit?: number): string[];
    getRecentDirectories(limit?: number): string[];
    getFileNamingPatterns(): string[];
    buildContextString(): string;
    generateSuggestions(currentInput: string): string[];
    clearAllContextData(): Promise<void>;
}