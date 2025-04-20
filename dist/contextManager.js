"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
/**
 * Manages the context for the local LLM agent to provide better context-aware responses
 */
class ContextManager {
    context;
    conversationMemory;
    userPreferences;
    filePreferences;
    constructor(context) {
        this.context = context;
        // Initialize components
        this.conversationMemory = new ConversationMemory(context);
        this.userPreferences = new UserPreferences(context);
        this.filePreferences = new FilePreferences(context);
        // Load initial data
        this.initializeContext();
    }
    /**
     * Initialize the context with stored data
     */
    async initializeContext() {
        await Promise.all([
            this.conversationMemory.initialize(),
            this.userPreferences.initialize(),
            this.filePreferences.initialize()
        ]);
    }
    /**
     * Add a message to the conversation memory
     */
    addMessage(message) {
        this.conversationMemory.addMessage(message);
        // Analyze message for preferences
        this.analyzeMessage(message);
    }
    /**
     * Analyze a message to extract preferences
     */
    analyzeMessage(message) {
        // Only analyze user messages
        if (message.role !== 'user') {
            return;
        }
        // Extract programming language preferences
        this.extractLanguagePreferences(message.content);
        // Extract file management preferences
        this.extractFilePreferences(message.content);
    }
    /**
     * Extract programming language preferences from a message
     */
    extractLanguagePreferences(content) {
        // Common programming language keywords
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
            { pattern: /\b(dart)\b/i, language: 'dart' },
            { pattern: /\b(html)\b/i, language: 'html' },
            { pattern: /\b(css|scss|sass)\b/i, language: 'css' },
            { pattern: /\b(sql)\b/i, language: 'sql' },
        ];
        // Check if content mentions any programming languages
        for (const { pattern, language } of languagePatterns) {
            if (pattern.test(content)) {
                this.userPreferences.setPreferredLanguage(language);
                // Update frequency counter for this language
                this.userPreferences.incrementLanguageUsage(language);
            }
        }
        // Check for explicit framework mentions
        const frameworkPatterns = [
            { pattern: /\b(react|reactjs)\b/i, framework: 'react', language: 'javascript' },
            { pattern: /\b(angular)\b/i, framework: 'angular', language: 'typescript' },
            { pattern: /\b(vue|vuejs)\b/i, framework: 'vue', language: 'javascript' },
            { pattern: /\b(django)\b/i, framework: 'django', language: 'python' },
            { pattern: /\b(flask)\b/i, framework: 'flask', language: 'python' },
            { pattern: /\b(spring|spring boot)\b/i, framework: 'spring', language: 'java' },
            { pattern: /\b(express|expressjs)\b/i, framework: 'express', language: 'javascript' },
            { pattern: /\b(next|nextjs)\b/i, framework: 'next', language: 'javascript' },
            { pattern: /\b(laravel)\b/i, framework: 'laravel', language: 'php' },
            { pattern: /\b(rails|ruby on rails)\b/i, framework: 'rails', language: 'ruby' },
            { pattern: /\b(flutter)\b/i, framework: 'flutter', language: 'dart' },
        ];
        for (const { pattern, framework, language } of frameworkPatterns) {
            if (pattern.test(content)) {
                this.userPreferences.setPreferredFramework(framework);
                this.userPreferences.setPreferredLanguage(language);
            }
        }
    }
    /**
     * Extract file management preferences from a message
     */
    extractFilePreferences(content) {
        // Check for file extension preferences
        const fileExtensionMatch = content.match(/\.([a-zA-Z0-9]+)\b/g);
        if (fileExtensionMatch) {
            for (const ext of fileExtensionMatch) {
                const extension = ext.substring(1); // Remove the dot
                this.filePreferences.addRecentExtension(extension);
            }
        }
        // Check for directory preferences
        const directoryMatch = content.match(/(?:in|to|from|at)\s+(?:the\s+)?(?:directory|folder|path)?\s*['"]?([\/\\a-zA-Z0-9_\-.]+)['"]?/i);
        if (directoryMatch && directoryMatch[1]) {
            this.filePreferences.addRecentDirectory(directoryMatch[1]);
        }
        // Check for file naming pattern preferences
        const namingPatternMatch = content.match(/name(?:d|ing)?\s+(?:it|files|the\s+file)?\s+(?:like|as)\s+['"]?([a-zA-Z0-9_\-.]+)['"]?/i);
        if (namingPatternMatch && namingPatternMatch[1]) {
            this.filePreferences.addNamingPattern(namingPatternMatch[1]);
        }
    }
    /**
     * Get the conversation history as an array of messages
     */
    getConversationHistory(limit = 10) {
        return this.conversationMemory.getRecentMessages(limit);
    }
    /**
     * Get the user's preferred programming language
     */
    getPreferredLanguage() {
        return this.userPreferences.getPreferredLanguage();
    }
    /**
     * Get the user's most frequently used languages
     */
    getFrequentLanguages(limit = 3) {
        return this.userPreferences.getFrequentLanguages(limit);
    }
    /**
     * Get the user's preferred framework
     */
    getPreferredFramework() {
        return this.userPreferences.getPreferredFramework();
    }
    /**
     * Get recently used file extensions
     */
    getRecentFileExtensions(limit = 5) {
        return this.filePreferences.getRecentExtensions(limit);
    }
    /**
     * Get recently used directories
     */
    getRecentDirectories(limit = 3) {
        return this.filePreferences.getRecentDirectories(limit);
    }
    /**
     * Get preferred file naming patterns
     */
    getFileNamingPatterns() {
        return this.filePreferences.getNamingPatterns();
    }
    /**
     * Build a rich context string for the AI based on the conversation history and user preferences
     */
    buildContextString() {
        const parts = [];
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
        // Add recent conversation context
        const recentMessages = this.getConversationHistory(5);
        if (recentMessages.length > 0) {
            parts.push(`Recent conversation topics include: ${this.extractTopics(recentMessages).join(', ')}.`);
        }
        return parts.join(' ');
    }
    /**
     * Extract topics from recent messages
     */
    extractTopics(messages) {
        // Simple topic extraction logic - could be enhanced with NLP in a real implementation
        const allText = messages.map(msg => msg.content).join(' ');
        const words = allText.toLowerCase().split(/\s+/);
        // Filter out common words and count frequencies
        const stopWords = ['the', 'and', 'a', 'to', 'is', 'in', 'that', 'it', 'with', 'for', 'as', 'on', 'was', 'be'];
        const wordCounts = {};
        for (const word of words) {
            if (word.length > 3 && !stopWords.includes(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        }
        // Get the top 5 most frequent relevant words as topics
        return Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }
    /**
     * Generate context-aware suggestions based on user history and preferences
     */
    generateSuggestions(currentInput) {
        const suggestions = [];
        // Language-specific suggestions
        const preferredLanguage = this.getPreferredLanguage();
        if (preferredLanguage) {
            switch (preferredLanguage) {
                case 'javascript':
                case 'typescript':
                    suggestions.push("Create a new React component");
                    suggestions.push("Set up a Node.js server");
                    suggestions.push("Write a Jest test");
                    break;
                case 'python':
                    suggestions.push("Create a new Python class");
                    suggestions.push("Set up a Flask/Django route");
                    suggestions.push("Write a pytest test");
                    break;
                case 'java':
                    suggestions.push("Create a new Java class");
                    suggestions.push("Set up a Spring controller");
                    suggestions.push("Write a JUnit test");
                    break;
                // Add other languages as needed
            }
        }
        // File management suggestions
        const recentDirectories = this.getRecentDirectories();
        if (recentDirectories.length > 0) {
            suggestions.push(`Create a file in ${recentDirectories[0]}`);
        }
        // Framework-specific suggestions
        const preferredFramework = this.getPreferredFramework();
        if (preferredFramework) {
            switch (preferredFramework) {
                case 'react':
                    suggestions.push("Create a custom React hook");
                    suggestions.push("Add state management with Redux/Context");
                    break;
                case 'django':
                    suggestions.push("Create a Django model");
                    suggestions.push("Set up a URL pattern");
                    break;
                // Add other frameworks as needed
            }
        }
        // Return unique suggestions
        return [...new Set(suggestions)];
    }
    /**
     * Clear all context data (for testing or user request)
     */
    async clearAllContextData() {
        await Promise.all([
            this.conversationMemory.clearHistory(),
            this.userPreferences.clearPreferences(),
            this.filePreferences.clearPreferences()
        ]);
    }
}
exports.ContextManager = ContextManager;
/**
 * Manages conversation memory and history
 */
class ConversationMemory {
    context;
    messages = [];
    storageKey = 'conversationMemory';
    maxHistorySize = 200; // Store up to 200 messages
    constructor(context) {
        this.context = context;
    }
    /**
     * Initialize conversation memory from storage
     */
    async initialize() {
        try {
            const storedData = this.context.globalState.get(this.storageKey);
            if (storedData && Array.isArray(storedData)) {
                this.messages = storedData;
            }
        }
        catch (error) {
            console.error('Failed to initialize conversation memory:', error);
        }
    }
    /**
     * Add a message to the memory
     */
    addMessage(message) {
        this.messages.push(message);
        // Trim history if it exceeds the maximum size
        if (this.messages.length > this.maxHistorySize) {
            this.messages = this.messages.slice(-this.maxHistorySize);
        }
        // Save to storage
        this.saveToStorage();
    }
    /**
     * Get recent messages from memory
     */
    getRecentMessages(limit) {
        return this.messages.slice(-limit);
    }
    /**
     * Get all messages from memory
     */
    getAllMessages() {
        return [...this.messages];
    }
    /**
     * Clear the conversation history
     */
    async clearHistory() {
        this.messages = [];
        await this.context.globalState.update(this.storageKey, []);
    }
    /**
     * Save the current state to storage
     */
    async saveToStorage() {
        await this.context.globalState.update(this.storageKey, this.messages);
    }
    /**
     * Find messages containing a specific term
     */
    searchMessages(term) {
        const lowerTerm = term.toLowerCase();
        return this.messages.filter(msg => msg.content.toLowerCase().includes(lowerTerm));
    }
    /**
     * Get conversation by date range
     */
    getMessagesByDateRange(startTime, endTime) {
        return this.messages.filter(msg => msg.timestamp >= startTime && msg.timestamp <= endTime);
    }
}
/**
 * Manages user preferences for programming languages and frameworks
 */
class UserPreferences {
    context;
    preferredLanguage;
    preferredFramework;
    languageUsage = {};
    storageKey = 'userProgrammingPreferences';
    constructor(context) {
        this.context = context;
    }
    /**
     * Initialize user preferences from storage
     */
    async initialize() {
        try {
            const storedData = this.context.globalState.get(this.storageKey);
            if (storedData) {
                this.preferredLanguage = storedData.preferredLanguage;
                this.preferredFramework = storedData.preferredFramework;
                this.languageUsage = storedData.languageUsage || {};
            }
        }
        catch (error) {
            console.error('Failed to initialize user preferences:', error);
        }
    }
    /**
     * Set the preferred programming language
     */
    setPreferredLanguage(language) {
        this.preferredLanguage = language;
        this.saveToStorage();
    }
    /**
     * Get the preferred programming language
     */
    getPreferredLanguage() {
        return this.preferredLanguage;
    }
    /**
     * Set the preferred framework
     */
    setPreferredFramework(framework) {
        this.preferredFramework = framework;
        this.saveToStorage();
    }
    /**
     * Get the preferred framework
     */
    getPreferredFramework() {
        return this.preferredFramework;
    }
    /**
     * Increment usage count for a language
     */
    incrementLanguageUsage(language) {
        this.languageUsage[language] = (this.languageUsage[language] || 0) + 1;
        this.saveToStorage();
    }
    /**
     * Get the most frequently used languages
     */
    getFrequentLanguages(limit) {
        return Object.entries(this.languageUsage)
            .map(([language, count]) => ({ language, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    /**
     * Clear all user preferences
     */
    async clearPreferences() {
        this.preferredLanguage = undefined;
        this.preferredFramework = undefined;
        this.languageUsage = {};
        await this.context.globalState.update(this.storageKey, undefined);
    }
    /**
     * Save the current state to storage
     */
    async saveToStorage() {
        await this.context.globalState.update(this.storageKey, {
            preferredLanguage: this.preferredLanguage,
            preferredFramework: this.preferredFramework,
            languageUsage: this.languageUsage
        });
    }
}
/**
 * Manages user preferences for file operations
 */
class FilePreferences {
    context;
    recentExtensions = [];
    recentDirectories = [];
    namingPatterns = [];
    storageKey = 'fileManagementPreferences';
    constructor(context) {
        this.context = context;
    }
    /**
     * Initialize file preferences from storage
     */
    async initialize() {
        try {
            const storedData = this.context.globalState.get(this.storageKey);
            if (storedData) {
                this.recentExtensions = storedData.recentExtensions || [];
                this.recentDirectories = storedData.recentDirectories || [];
                this.namingPatterns = storedData.namingPatterns || [];
            }
        }
        catch (error) {
            console.error('Failed to initialize file preferences:', error);
        }
    }
    /**
     * Add a recently used file extension
     */
    addRecentExtension(extension) {
        // Move to front if exists, otherwise add to front
        this.recentExtensions = [
            extension,
            ...this.recentExtensions.filter(ext => ext !== extension)
        ];
        // Keep the list reasonably sized
        if (this.recentExtensions.length > 10) {
            this.recentExtensions = this.recentExtensions.slice(0, 10);
        }
        this.saveToStorage();
    }
    /**
     * Get recently used file extensions
     */
    getRecentExtensions(limit) {
        return this.recentExtensions.slice(0, limit);
    }
    /**
     * Add a recently used directory
     */
    addRecentDirectory(directory) {
        // Move to front if exists, otherwise add to front
        this.recentDirectories = [
            directory,
            ...this.recentDirectories.filter(dir => dir !== directory)
        ];
        // Keep the list reasonably sized
        if (this.recentDirectories.length > 5) {
            this.recentDirectories = this.recentDirectories.slice(0, 5);
        }
        this.saveToStorage();
    }
    /**
     * Get recently used directories
     */
    getRecentDirectories(limit) {
        return this.recentDirectories.slice(0, limit);
    }
    /**
     * Add a file naming pattern
     */
    addNamingPattern(pattern) {
        if (!this.namingPatterns.includes(pattern)) {
            this.namingPatterns.push(pattern);
            // Keep the list reasonably sized
            if (this.namingPatterns.length > 5) {
                this.namingPatterns = this.namingPatterns.slice(-5);
            }
            this.saveToStorage();
        }
    }
    /**
     * Get file naming patterns
     */
    getNamingPatterns() {
        return [...this.namingPatterns];
    }
    /**
     * Clear all file preferences
     */
    async clearPreferences() {
        this.recentExtensions = [];
        this.recentDirectories = [];
        this.namingPatterns = [];
        await this.context.globalState.update(this.storageKey, undefined);
    }
    /**
     * Save the current state to storage
     */
    async saveToStorage() {
        await this.context.globalState.update(this.storageKey, {
            recentExtensions: this.recentExtensions,
            recentDirectories: this.recentDirectories,
            namingPatterns: this.namingPatterns
        });
    }
}
//# sourceMappingURL=contextManager.js.map