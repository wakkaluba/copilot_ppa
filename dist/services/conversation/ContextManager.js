"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const ConversationMemoryService_1 = require("./services/ConversationMemoryService");
const models_1 = require("./models");
/**
 * Manages conversation context and state
 */
class ContextManager {
    /**
     * Create a new ContextManager
     * @param context Extension context for state persistence
     */
    constructor(context) {
        this.languagePreferences = new Map();
        this.fileTypePreferences = new Map();
        this.directoryPreferences = new Map();
        this.filePatternPreferences = new Map();
        this.conversationService = new ConversationMemoryService_1.ConversationMemoryService(context);
    }
    /**
     * Get singleton instance of ContextManager
     * @param context Extension context
     */
    static getInstance(context) {
        if (!ContextManager.instance) {
            ContextManager.instance = new ContextManager(context);
        }
        return ContextManager.instance;
    }
    /**
     * Initialize the context manager
     */
    async initialize() {
        try {
            await this.conversationService.initialize();
        }
        catch (error) {
            throw new Error(`Failed to initialize context manager: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Add a message and extract relevant context
     * @param message Message to add
     */
    async addMessage(message) {
        this.conversationService.addMessage(message);
        // Only analyze user messages for context
        if (message.type === models_1.MessageType.USER) {
            this.analyzeMessageForContext(message);
        }
    }
    /**
     * Analyze message content for context clues
     * @param message Message to analyze
     */
    analyzeMessageForContext(message) {
        this.extractLanguagePreferences(message.content);
        this.extractFilePreferences(message.content);
    }
    /**
     * Extract language preferences from message content
     * @param content Message content
     */
    extractLanguagePreferences(content) {
        // Look for programming language mentions
        const languageRegex = /\b(javascript|typescript|python|java|c#|ruby|go|rust|php|swift|kotlin)\b/gi;
        let match;
        while ((match = languageRegex.exec(content)) !== null) {
            const lang = match[1].toLowerCase();
            this.addLanguagePreference(lang);
        }
        // Look for framework mentions
        const frameworkRegex = /\b(react|angular|vue|express|django|flask|spring|dotnet|laravel)\b/gi;
        while ((match = frameworkRegex.exec(content)) !== null) {
            const framework = match[1].toLowerCase();
            this.addFrameworkPreference(framework);
        }
    }
    /**
     * Add language preference
     * @param language Language to add
     */
    addLanguagePreference(language) {
        const count = this.languagePreferences.get(language) || 0;
        this.languagePreferences.set(language, count + 1);
    }
    /**
     * Add framework preference
     * @param framework Framework to add
     */
    addFrameworkPreference(framework) {
        const count = this.languagePreferences.get(`framework:${framework}`) || 0;
        this.languagePreferences.set(`framework:${framework}`, count + 1);
    }
    /**
     * Extract file preferences from message content
     * @param content Message content
     */
    extractFilePreferences(content) {
        // Extract file extensions
        const extensionRegex = /\.(js|ts|py|java|cs|rb|go|rs|php|swift|kt|jsx|tsx|html|css|scss)\b/gi;
        let match;
        while ((match = extensionRegex.exec(content)) !== null) {
            const ext = match[1].toLowerCase();
            const count = this.fileTypePreferences.get(ext) || 0;
            this.fileTypePreferences.set(ext, count + 1);
        }
        // Extract directory paths
        const dirRegex = /\b(src|lib|app|components|utils|helpers|services|models|controllers)\b/gi;
        while ((match = dirRegex.exec(content)) !== null) {
            const dir = match[1].toLowerCase();
            const count = this.directoryPreferences.get(dir) || 0;
            this.directoryPreferences.set(dir, count + 1);
        }
        // Extract file naming patterns
        const patternRegex = /\b([a-zA-Z]+)(Controller|Service|Component|Model|Manager|Helper|Util)\b/g;
        while ((match = patternRegex.exec(content)) !== null) {
            const pattern = match[2].toLowerCase();
            const count = this.filePatternPreferences.get(pattern) || 0;
            this.filePatternPreferences.set(pattern, count + 1);
        }
    }
    /**
     * Get preferred language based on context
     * @returns Most commonly used language
     */
    getPreferredLanguage() {
        let maxCount = 0;
        let preferred = undefined;
        for (const [lang, count] of this.languagePreferences.entries()) {
            if (!lang.startsWith('framework:') && count > maxCount) {
                maxCount = count;
                preferred = lang;
            }
        }
        return preferred;
    }
    /**
     * Get most frequently used programming languages
     * @param limit Number of languages to return
     * @returns Array of language names
     */
    getFrequentLanguages(limit = 3) {
        return Array.from(this.languagePreferences.entries())
            .filter(([lang]) => !lang.startsWith('framework:'))
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    /**
     * Get preferred framework
     */
    getPreferredFramework() {
        let maxCount = 0;
        let preferred = undefined;
        for (const [key, count] of this.languagePreferences.entries()) {
            if (key.startsWith('framework:') && count > maxCount) {
                maxCount = count;
                preferred = key.substring('framework:'.length);
            }
        }
        return preferred;
    }
    /**
     * Get recent file extensions
     * @param limit Number of extensions to return
     * @returns Array of file extensions
     */
    getRecentFileExtensions(limit = 3) {
        return Array.from(this.fileTypePreferences.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    /**
     * Get recently referenced directories
     * @param limit Number of directories to return
     * @returns Array of directory names
     */
    getRecentDirectories(limit = 3) {
        return Array.from(this.directoryPreferences.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    /**
     * Get file naming patterns
     * @param limit Number of patterns to return
     * @returns Array of naming patterns
     */
    getFileNamingPatterns(limit = 3) {
        return Array.from(this.filePatternPreferences.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    /**
     * Generate context-aware suggestions
     * @param limit Number of suggestions to generate
     * @returns Array of suggestion strings
     */
    generateSuggestions(limit = 3) {
        const suggestions = [];
        const preferredLanguages = this.getFrequentLanguages(2);
        // Language-based suggestions
        if (preferredLanguages.length > 0) {
            suggestions.push(`Would you like to see ${preferredLanguages[0]} code examples?`);
        }
        // Framework suggestions
        const framework = this.getPreferredFramework();
        if (framework) {
            suggestions.push(`Consider using ${framework} best practices for this task.`);
        }
        // File structure suggestions
        const topDirs = this.getRecentDirectories(1);
        if (topDirs.length > 0) {
            suggestions.push(`I notice you're working with ${topDirs[0]} directories. Need help organizing your files?`);
        }
        // Add some default suggestions if we don't have enough
        if (suggestions.length < limit) {
            suggestions.push("Create a new component");
            suggestions.push("Add state management with Redux/Context");
            suggestions.push("Set up unit testing for your code");
        }
        return suggestions.slice(0, limit);
    }
    /**
     * Build context string for LLM prompt
     * @returns Context string
     */
    buildContextString() {
        const parts = [];
        // Add language context
        if (this.languagePreferences.size > 0) {
            const languages = this.getFrequentLanguages(3);
            if (languages.length > 0) {
                parts.push(`Languages: ${languages.join(', ')}`);
            }
        }
        // Add framework context
        const framework = this.getPreferredFramework();
        if (framework) {
            parts.push(`Framework: ${framework}`);
        }
        // Add file types context
        if (this.fileTypePreferences.size > 0) {
            const fileTypes = this.getRecentFileExtensions(3);
            if (fileTypes.length > 0) {
                parts.push(`File types: ${fileTypes.join(', ')}`);
            }
        }
        // Add directory context
        if (this.directoryPreferences.size > 0) {
            const dirs = this.getRecentDirectories(3);
            if (dirs.length > 0) {
                parts.push(`Directories: ${dirs.join(', ')}`);
            }
        }
        return parts.join('\n');
    }
    /**
     * Clear all context data
     */
    async clearAllContextData() {
        try {
            // Clear conversation history
            await this.conversationService.clearHistory();
            // Clear context preferences
            this.languagePreferences.clear();
            this.fileTypePreferences.clear();
            this.directoryPreferences.clear();
            this.filePatternPreferences.clear();
        }
        catch (error) {
            throw new Error(`Failed to clear context data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=contextManager.js.map