import { ChatMessage } from './conversation';

export interface Context {
    conversationId: string;
    activeFile?: string;
    selectedCode?: string;
    codeLanguage?: string;
    lastCommand?: string;
    relevantFiles: string[];
    systemPrompt: string;
}

export interface ContextWindow {
    messages: string[];
    relevance: number;
    timestamp: number;
}

export interface LanguageUsage {
    language: string;
    count: number;
}

export interface FilePreference {
    path: string;
    lastUsed: number;
    useCount: number;
}

export interface UserPreferences {
    preferredLanguage?: string;
    languageUsage: Map<string, number>;
    preferredFramework?: string;
    recentFiles: FilePreference[];
}