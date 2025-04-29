import { UserPreferencesService } from "./UserPreferencesService";
import { FilePreferencesService } from "./FilePreferencesService";
import { ConversationMemoryService } from "./ConversationMemoryService";

/**
 * Service for analyzing conversation context
 */
export class ContextAnalysisService {
    /**
     * Analyze a message for context and preferences
     * @param message Message content to analyze
     * @param userPrefs User preferences service to update
     * @param filePrefs File preferences service to update
     */
    public analyzeMessage(
        message: string, 
        userPrefs: UserPreferencesService, 
        filePrefs: FilePreferencesService
    ): void {
        // Extract language preferences
        this.extractLanguagePreferences(message, userPrefs);
        
        // Extract file type preferences
        this.extractFileTypePreferences(message, filePrefs);
        
        // Extract other preferences (framework, style, etc.)
        this.extractOtherPreferences(message, userPrefs);
    }
    
    /**
     * Extract language preferences from a message
     */
    private extractLanguagePreferences(message: string, userPrefs: UserPreferencesService): void {
        const languagePatterns = [
            { pattern: /typescript|ts\b/i, language: 'typescript' },
            { pattern: /javascript|js\b/i, language: 'javascript' },
            { pattern: /python|py\b/i, language: 'python' },
            { pattern: /java\b/i, language: 'java' },
            { pattern: /c#|csharp|\.cs\b/i, language: 'csharp' },
            { pattern: /go\b|golang/i, language: 'go' },
            { pattern: /rust|rs\b/i, language: 'rust' },
            { pattern: /php\b/i, language: 'php' }
        ];
        
        for (const { pattern, language } of languagePatterns) {
            if (pattern.test(message)) {
                userPrefs.setPreference('preferredLanguage', language);
                break;
            }
        }
    }
    
    /**
     * Extract file type preferences from a message
     */
    private extractFileTypePreferences(message: string, filePrefs: FilePreferencesService): void {
        const fileExtPatterns = [
            { pattern: /\.tsx?\b/i, ext: 'ts' },
            { pattern: /\.jsx?\b/i, ext: 'js' },
            { pattern: /\.py\b/i, ext: 'py' },
            { pattern: /\.java\b/i, ext: 'java' },
            { pattern: /\.cs\b/i, ext: 'cs' },
            { pattern: /\.go\b/i, ext: 'go' },
            { pattern: /\.rs\b/i, ext: 'rs' },
            { pattern: /\.php\b/i, ext: 'php' }
        ];
        
        for (const { pattern, ext } of fileExtPatterns) {
            if (pattern.test(message)) {
                filePrefs.trackFileExtension(ext);
            }
        }
    }
    
    /**
     * Extract other preferences from a message
     */
    private extractOtherPreferences(message: string, userPrefs: UserPreferencesService): void {
        const frameworkPatterns = [
            { pattern: /react/i, framework: 'react' },
            { pattern: /vue/i, framework: 'vue' },
            { pattern: /angular/i, framework: 'angular' },
            { pattern: /express/i, framework: 'express' },
            { pattern: /django/i, framework: 'django' },
            { pattern: /flask/i, framework: 'flask' },
            { pattern: /spring/i, framework: 'spring' },
            { pattern: /asp\.net/i, framework: 'asp.net' }
        ];
        
        for (const { pattern, framework } of frameworkPatterns) {
            if (pattern.test(message)) {
                userPrefs.setPreference('preferredFramework', framework);
                break;
            }
        }
        
        // Code style preferences
        if (/\btabs\b/i.test(message) || /\bindentation: tab\b/i.test(message)) {
            userPrefs.setPreference('useTabs', true);
        } else if (/\bspaces\b/i.test(message) || /\bindentation: space\b/i.test(message)) {
            userPrefs.setPreference('useTabs', false);
        }
    }

    /**
     * Build a context string for prompting
     * @param userPrefs User preferences service
     * @param filePrefs File preferences service
     * @param memoryService Conversation memory service
     * @returns Formatted context string
     */
    public buildContextString(
        userPrefs: UserPreferencesService,
        filePrefs: FilePreferencesService,
        memoryService: ConversationMemoryService
    ): string {
        const contextParts: string[] = [];
        
        // Add language preference
        const preferredLanguage = userPrefs.getPreference<string>('preferredLanguage');
        if (preferredLanguage) {
            contextParts.push(`Preferred Language: ${preferredLanguage.charAt(0).toUpperCase() + preferredLanguage.slice(1)}`);
        }
        
        // Add framework preference
        const preferredFramework = userPrefs.getPreference<string>('preferredFramework');
        if (preferredFramework) {
            contextParts.push(`Framework: ${preferredFramework.charAt(0).toUpperCase() + preferredFramework.slice(1)}`);
        }
        
        // Add code style preferences
        const useTabs = userPrefs.getPreference<boolean>('useTabs');
        if (useTabs !== undefined) {
            contextParts.push(`Indentation: ${useTabs ? 'tabs' : 'spaces'}`);
        }
        
        // Add file type preferences
        const preferredExtensions = filePrefs.getMostFrequentExtensions(3);
        if (preferredExtensions.length > 0) {
            contextParts.push(`Common file types: ${preferredExtensions.join(', ')}`);
        }

        // Add directory preferences that tests are expecting
        const recentDirs = filePrefs.getRecentDirectories(3); 
        if (recentDirs.length > 0) {
            const dirNames = recentDirs.map(dir => {
                const parts = dir.split(/[\/\\]/);
                return parts[parts.length - 1]; // Just the last part of the path
            });
            contextParts.push(`Project Directories: ${dirNames.join(', ')}`);
        }
        
        // Return the formatted context
        return contextParts.length > 0 ? contextParts.join('\n') : '';
    }
}
