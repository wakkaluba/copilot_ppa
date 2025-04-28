import * as vscode from 'vscode';
import { ConversationMemoryService } from './services/ConversationMemoryService';
import { UserPreferencesService } from './services/UserPreferencesService';
import { FilePreferencesService } from './services/FilePreferencesService';
import { ContextAnalysisService } from './services/ContextAnalysisService';
import { Message, MessageType } from './models';

/**
 * Manages conversation context and state
 */
export class ContextManager {
    private static instance: ContextManager;
    private conversationService: ConversationMemoryService;
    private userPreferencesService: UserPreferencesService;
    private filePreferencesService: FilePreferencesService;
    private analysisService: ContextAnalysisService;
    private languagePreferences: Map<string, number> = new Map();
    private fileTypePreferences: Map<string, number> = new Map();
    private directoryPreferences: Map<string, number> = new Map();
    private filePatternPreferences: Map<string, number> = new Map();
    private maxWindowSize: number = 10;
    private disposables: vscode.Disposable[] = [];

    /**
     * Create a new ContextManager
     * @param context Extension context for state persistence
     */
    private constructor(context: vscode.ExtensionContext) {
        this.conversationService = new ConversationMemoryService(context);
        this.userPreferencesService = new UserPreferencesService(context);
        this.filePreferencesService = new FilePreferencesService(context);
        this.analysisService = new ContextAnalysisService();
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
     * Initialize services
     */
    public async initialize(): Promise<void> {
        try {
            await Promise.all([
                this.conversationService.initialize(),
                this.userPreferencesService.initialize(),
                this.filePreferencesService.initialize()
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize context manager: ${message}`);
        }
    }

    /**
     * Add a message to the conversation
     */
    public addMessage(message: Message): void {
        this.conversationService.addMessage(message);
        if (message.role === MessageType.User) {
            this.analysisService.analyzeMessage(
                message.content,
                this.userPreferencesService,
                this.filePreferencesService
            );
            this.extractLanguagePreferences(message.content);
            this.extractFilePreferences(message.content);
        }
    }

    /**
     * Extract language preferences from user input
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
     * Extract file preferences from user input
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
     * Get most frequent languages
     */
    public getFrequentLanguages(limit: number = 3): string[] {
        return Array.from(this.languagePreferences.entries())
            .filter(([key]) => !key.startsWith('framework:'))
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }

    /**
     * Get preferred language
     */
    public getPreferredLanguage(): string | undefined {
        const languages = this.getFrequentLanguages(1);
        return languages.length > 0 ? languages[0] : undefined;
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
     */
    public getRecentFileExtensions(limit: number = 3): string[] {
        return Array.from(this.fileTypePreferences.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    
    /**
     * Get recently referenced directories
     */
    public getRecentDirectories(limit: number = 3): string[] {
        return Array.from(this.directoryPreferences.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    
    /**
     * Get file naming patterns
     */
    public getFileNamingPatterns(limit: number = 3): string[] {
        return Array.from(this.filePatternPreferences.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }

    /**
     * Build context string from current state
     */
    public buildContextString(): string {
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
        await this.userPreferencesService.clearPreferences();
        await this.filePreferencesService.clearPreferences();
    }

    /**
     * Set maximum window size for conversation history
     */
    public setMaxWindowSize(size: number): void {
        this.maxWindowSize = size;
    }
    
    /**
     * Clean up resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}