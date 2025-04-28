import * as vscode from 'vscode';
import { ConversationMemoryService } from './services/ConversationMemoryService';
import { Message, MessageType } from './models';

/**
 * Manages conversation context and state
 */
export class ContextManager {
    private static instance: ContextManager;
    private conversationService: ConversationMemoryService;
    private languagePreferences: Map<string, number> = new Map();
    private fileTypePreferences: Map<string, number> = new Map();
    private directoryPreferences: Map<string, number> = new Map();
    private filePatternPreferences: Map<string, number> = new Map();

    /**
     * Create a new ContextManager
     * @param context Extension context for state persistence
     */
    private constructor(context: vscode.ExtensionContext) {
        this.conversationService = new ConversationMemoryService(context);
    }
    
    /**
     * Get singleton instance of ContextManager
     * @param context Extension context
     */
    public static getInstance(context: vscode.ExtensionContext): ContextManager {
        if (!this.instance) {
            this.instance = new ContextManager(context);
        }
        return this.instance;
    }

    /**
     * Process user input and extract useful context
     * @param input User input text
     * @returns Response with context
     */
    public async processInput(input: string): Promise<{ text: string; context: any }> {
        const message: Message = {
            id: Date.now().toString(),
            role: MessageType.User,
            content: input,
            timestamp: Date.now()
        };

        await this.conversationService.addMessage(message);
        this.extractLanguagePreferences(input);
        this.extractFilePreferences(input);

        return {
            text: "Processed input and updated context",
            context: this.buildContext()
        };
    }

    /**
     * Get suggestions based on current context
     * @param input Current input text
     * @returns List of suggestions
     */
    public async getSuggestions(input: string): Promise<string[]> {
        const preferredLang = this.getPreferredLanguage();
        const preferredFramework = this.getPreferredFramework();
        
        const suggestions: string[] = [];
        
        // Add language-specific suggestions
        if (preferredLang) {
            if (preferredLang === 'typescript' || preferredLang === 'javascript') {
                suggestions.push('Create a new component');
                suggestions.push('Write a utility function');
                suggestions.push('Add error handling to the current code');
            } else if (preferredLang === 'python') {
                suggestions.push('Create a new class');
                suggestions.push('Add unit tests');
                suggestions.push('Optimize current function');
            }
        }
        
        // Add framework-specific suggestions
        if (preferredFramework) {
            if (preferredFramework === 'react') {
                suggestions.push('Add state management with Redux/Context');
                suggestions.push('Create a custom hook');
            } else if (preferredFramework === 'angular') {
                suggestions.push('Generate a new service');
                suggestions.push('Add a route guard');
            }
        }
        
        // Add generic suggestions if no specific context
        if (suggestions.length === 0) {
            suggestions.push('Help me optimize my code');
            suggestions.push('Explain this code to me');
            suggestions.push('Generate documentation');
        }
        
        return suggestions;
    }

    /**
     * Extract language preferences from user input
     * @param content User input text
     */
    private extractLanguagePreferences(content: string): void {
        // Extract programming language mentions
        const langRegex = /\b(javascript|typescript|python|java|c\+\+|ruby|go|rust|php|c#|swift)\b/gi;
        let match;
        
        while ((match = langRegex.exec(content)) !== null) {
            const lang = match[1].toLowerCase();
            const count = this.languagePreferences.get(lang) || 0;
            this.languagePreferences.set(lang, count + 1);
        }
        
        // Extract framework mentions
        const frameworkRegex = /\b(react|angular|vue|svelte|express|django|flask|spring|laravel)\b/gi;
        
        while ((match = frameworkRegex.exec(content)) !== null) {
            const framework = match[1].toLowerCase();
            const frameworkKey = `framework:${framework}`;
            const count = this.languagePreferences.get(frameworkKey) || 0;
            this.languagePreferences.set(frameworkKey, count + 1);
        }
    }

    /**
     * Extract file type preferences from user input
     * @param content User input text
     */
    private extractFilePreferences(content: string): void {
        // Extract file extensions
        const extensionRegex = /\.(js|ts|py|java|cpp|rb|go|rs|php|cs|swift|html|css|json|md|yml|yaml|xml)\b/gi;
        let match;
        
        while ((match = extensionRegex.exec(content)) !== null) {
            const ext = match[1].toLowerCase();
            const count = this.fileTypePreferences.get(ext) || 0;
            this.fileTypePreferences.set(ext, count + 1);
        }
        
        // Extract directory names
        const dirRegex = /\b(src|components|services|utils|helpers|models|controllers|views|tests|config)\b/gi;
        
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
    public getPreferredLanguage(): string | undefined {
        let maxCount = 0;
        let preferred: string | undefined = undefined;
        
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
    public getFrequentLanguages(limit: number = 3): string[] {
        return Array.from(this.languagePreferences.entries())
            .filter(([lang]) => !lang.startsWith('framework:'))
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    
    /**
     * Get preferred framework
     */
    public getPreferredFramework(): string | undefined {
        let maxCount = 0;
        let preferred: string | undefined = undefined;
        
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
    public getRecentFileExtensions(limit: number = 3): string[] {
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
    public getRecentDirectories(limit: number = 3): string[] {
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
    public getFileNamingPatterns(limit: number = 3): string[] {
        return Array.from(this.filePatternPreferences.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    
    /**
     * Build context string from current state
     * @returns Context string
     */
    private buildContext(): string {
        const preferredLang = this.getPreferredLanguage();
        const preferredFramework = this.getPreferredFramework();
        const fileExtensions = this.getRecentFileExtensions();
        const directories = this.getRecentDirectories();
        
        let contextString = '';
        
        if (preferredLang) {
            contextString += `Preferred Language: ${preferredLang.charAt(0).toUpperCase() + preferredLang.slice(1)}\n`;
        }
        
        if (preferredFramework) {
            contextString += `Framework: ${preferredFramework.charAt(0).toUpperCase() + preferredFramework.slice(1)}\n`;
        }
        
        if (fileExtensions.length > 0) {
            contextString += `Common File Types: ${fileExtensions.join(', ')}\n`;
        }
        
        if (directories.length > 0) {
            contextString += `Project Directories: ${directories.join(', ')}\n`;
        }
        
        return contextString;
    }
    
    /**
     * Clear all context data
     */
    public async clearContext(): Promise<void> {
        this.languagePreferences.clear();
        this.fileTypePreferences.clear();
        this.directoryPreferences.clear();
        this.filePatternPreferences.clear();
        await this.conversationService.clearMessages();
    }
    
    /**
     * Clean up resources
     */
    public dispose(): void {
        // Cleanup code
    }
}