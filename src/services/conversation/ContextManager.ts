import * as vscode from 'vscode';
import { ConversationMessage, IContextManager } from './types';
import { ConversationMemory } from './ConversationMemory';
import { UserPreferences } from './UserPreferences';
import { FilePreferences } from './FilePreferences';

export class ContextManager implements IContextManager {
    private readonly _conversationMemory: ConversationMemory;
    private readonly _userPreferences: UserPreferences;
    private readonly _filePreferences: FilePreferences;

    constructor(context: vscode.ExtensionContext) {
        this._conversationMemory = new ConversationMemory(context);
        this._userPreferences = new UserPreferences(context);
        this._filePreferences = new FilePreferences(context);
    }

    async initialize(): Promise<void> {
        try {
            await Promise.all([
                this._conversationMemory.initialize(),
                this._userPreferences.initialize(),
                this._filePreferences.initialize()
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize context manager: ${message}`);
        }
    }

    addMessage(message: ConversationMessage): void {
        this._conversationMemory.addMessage(message);
        
        // Only analyze user messages for preferences
        if (message.role === 'user') {
            this.analyzeMessage(message.content);
        }
    }

    private analyzeMessage(content: string): void {
        this.extractLanguagePreferences(content);
        this.extractFilePreferences(content);
    }

    private extractLanguagePreferences(content: string): void {
        const languagePatterns = [
            { pattern: /\b(javascript|js|node|nodejs)\b/i, language: 'javascript' },
            { pattern: /\b(typescript|ts)\b/i, language: 'typescript' },
            { pattern: /\b(python|py)\b/i, language: 'python' },
            { pattern: /\b(java)\b/i, language: 'java' },
            { pattern: /\b(c#|csharp|\.net)\b/i, language: 'csharp' },
            { pattern: /\b(c\+\+|cpp)\b/i, language: 'cpp' },
            { pattern: /\b(php)\b/i, language: 'php' },
            { pattern: /\b(ruby|rb)\b/i, language: 'ruby' },
            { pattern: /\b(go|golang)\b/i, language: 'go' },
            { pattern: /\b(rust|rs)\b/i, language: 'rust' },
            { pattern: /\b(swift)\b/i, language: 'swift' },
            { pattern: /\b(kotlin|kt)\b/i, language: 'kotlin' },
            { pattern: /\b(dart)\b/i, language: 'dart' }
        ];

        for (const { pattern, language } of languagePatterns) {
            if (pattern.test(content)) {
                this._userPreferences.setPreferredLanguage(language);
                this._userPreferences.incrementLanguageUsage(language);
            }
        }

        const frameworkPatterns = [
            { pattern: /\b(react|reactjs)\b/i, framework: 'react', language: 'javascript' },
            { pattern: /\b(angular)\b/i, framework: 'angular', language: 'typescript' },
            { pattern: /\b(vue|vuejs)\b/i, framework: 'vue', language: 'javascript' },
            { pattern: /\b(django)\b/i, framework: 'django', language: 'python' },
            { pattern: /\b(flask)\b/i, framework: 'flask', language: 'python' },
            { pattern: /\b(spring|spring boot)\b/i, framework: 'spring', language: 'java' },
            { pattern: /\b(express|expressjs)\b/i, framework: 'express', language: 'javascript' },
            { pattern: /\b(next|nextjs)\b/i, framework: 'next', language: 'javascript' }
        ];

        for (const { pattern, framework, language } of frameworkPatterns) {
            if (pattern.test(content)) {
                this._userPreferences.setPreferredFramework(framework);
                this._userPreferences.setPreferredLanguage(language);
            }
        }
    }

    private extractFilePreferences(content: string): void {
        // Extract file extensions
        const fileExtensionMatch = content.match(/\.([a-zA-Z0-9]+)\b/g);
        if (fileExtensionMatch) {
            for (const ext of fileExtensionMatch) {
                this._filePreferences.addRecentExtension(ext.substring(1));
            }
        }

        // Extract directory paths
        const directoryMatch = content.match(/(?:in|to|from|at)\s+(?:the\s+)?(?:directory|folder|path)?\s*['"]?([\/\\a-zA-Z0-9_\-.]+)['"]?/i);
        if (directoryMatch?.[1]) {
            this._filePreferences.addRecentDirectory(directoryMatch[1]);
        }

        // Extract file naming patterns
        const namingPatternMatch = content.match(/name(?:d|ing)?\s+(?:it|files|the\s+file)?\s+(?:like|as)\s+['"]?([a-zA-Z0-9_\-.]+)['"]?/i);
        if (namingPatternMatch?.[1]) {
            this._filePreferences.addNamingPattern(namingPatternMatch[1]);
        }
    }

    getConversationHistory(limit: number = 10): ConversationMessage[] {
        return this._conversationMemory.getRecentMessages(limit);
    }

    getPreferredLanguage(): string | undefined {
        return this._userPreferences.getPreferredLanguage();
    }

    getFrequentLanguages(limit: number = 3): { language: string; count: number }[] {
        return this._userPreferences.getFrequentLanguages(limit);
    }

    getPreferredFramework(): string | undefined {
        return this._userPreferences.getPreferredFramework();
    }

    getRecentFileExtensions(limit: number = 5): string[] {
        return this._filePreferences.getRecentExtensions(limit);
    }

    getRecentDirectories(limit: number = 3): string[] {
        return this._filePreferences.getRecentDirectories(limit);
    }

    getFileNamingPatterns(): string[] {
        return this._filePreferences.getNamingPatterns();
    }

    buildContextString(): string {
        const parts: string[] = [];
        
        // Add language preferences
        const preferredLanguage = this.getPreferredLanguage();
        if (preferredLanguage) {
            parts.push(`User prefers programming in ${preferredLanguage}.`);
        }
        
        // Add framework preferences
        const preferredFramework = this.getPreferredFramework();
        if (preferredFramework) {
            parts.push(`User works with the ${preferredFramework} framework.`);
        }
        
        // Add file preferences
        const recentExtensions = this.getRecentFileExtensions(3);
        if (recentExtensions.length > 0) {
            parts.push(`User frequently works with ${recentExtensions.map(ext => `.${ext}`).join(', ')} files.`);
        }
        
        // Add directory preferences
        const recentDirectories = this.getRecentDirectories(2);
        if (recentDirectories.length > 0) {
            parts.push(`User recently accessed directories: ${recentDirectories.join(', ')}.`);
        }
        
        // Add recent conversation topics
        const recentMessages = this.getConversationHistory(5);
        if (recentMessages.length > 0) {
            const topics = this.extractTopics(recentMessages);
            if (topics.length > 0) {
                parts.push(`Recent conversation topics include: ${topics.join(', ')}.`);
            }
        }
        
        return parts.join(' ');
    }

    private extractTopics(messages: ConversationMessage[]): string[] {
        const allText = messages.map(msg => msg.content).join(' ');
        const words = allText.toLowerCase().split(/\s+/);
        
        const stopWords = new Set([
            'the', 'and', 'a', 'to', 'is', 'in', 'that', 'it', 'with', 
            'for', 'as', 'on', 'was', 'be', 'this', 'are', 'do', 'have'
        ]);
        
        const wordCounts = new Map<string, number>();
        
        for (const word of words) {
            if (word.length > 3 && !stopWords.has(word)) {
                wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
            }
        }
        
        return Array.from(wordCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    generateSuggestions(currentInput: string): string[] {
        const suggestions = new Set<string>();
        
        // Add context-aware suggestions based on current input
        if (currentInput.toLowerCase().includes('test')) {
            suggestions.add("Generate test cases");
            suggestions.add("Set up test fixtures");
        } else if (currentInput.toLowerCase().includes('component')) {
            suggestions.add("Create a new component");
            suggestions.add("Add component styles");
        } else if (currentInput.toLowerCase().includes('api')) {
            suggestions.add("Set up API endpoint");
            suggestions.add("Add API documentation");
        }
        
        // Add language-specific suggestions
        const preferredLanguage = this.getPreferredLanguage();
        if (preferredLanguage) {
            switch (preferredLanguage) {
                case 'javascript':
                case 'typescript':
                    suggestions.add("Create a new React component");
                    suggestions.add("Set up a Node.js server");
                    suggestions.add("Write a Jest test");
                    break;
                case 'python':
                    suggestions.add("Create a new Python class");
                    suggestions.add("Set up a Flask/Django route");
                    suggestions.add("Write a pytest test");
                    break;
                case 'java':
                    suggestions.add("Create a new Java class");
                    suggestions.add("Set up a Spring controller");
                    suggestions.add("Write a JUnit test");
                    break;
            }
        }
        
        // Add file management suggestions based on current input
        const recentDirectories = this.getRecentDirectories();
        if (recentDirectories.length > 0) {
            if (currentInput.toLowerCase().includes('file') || currentInput.toLowerCase().includes('create')) {
                suggestions.add(`Create a file in ${recentDirectories[0]}`);
            }
            if (currentInput.toLowerCase().includes('folder') || currentInput.toLowerCase().includes('directory')) {
                suggestions.add(`Create a new folder in ${recentDirectories[0]}`);
            }
        }
        
        // Add framework-specific suggestions
        const preferredFramework = this.getPreferredFramework();
        if (preferredFramework) {
            switch (preferredFramework) {
                case 'react':
                    if (currentInput.toLowerCase().includes('state')) {
                        suggestions.add("Add state management with Redux/Context");
                        suggestions.add("Create a custom hook for state");
                    } else {
                        suggestions.add("Create a custom React hook");
                        suggestions.add("Set up component routing");
                    }
                    break;
                case 'django':
                    if (currentInput.toLowerCase().includes('model')) {
                        suggestions.add("Create a Django model");
                        suggestions.add("Set up model migrations");
                    } else {
                        suggestions.add("Set up a URL pattern");
                        suggestions.add("Create a Django view");
                    }
                    break;
            }
        }
        
        return Array.from(suggestions);
    }

    async clearAllContextData(): Promise<void> {
        try {
            await Promise.all([
                this._conversationMemory.clearHistory(),
                this._userPreferences.clearPreferences(),
                this._filePreferences.clearPreferences()
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear context data: ${message}`);
        }
    }

    dispose(): void {
        // Currently no resources to dispose
    }
}