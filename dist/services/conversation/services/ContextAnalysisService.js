"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextAnalysisService = void 0;
/**
 * Service for analyzing conversation context
 */
class ContextAnalysisService {
    /**
     * Analyze a message for context and preferences
     * @param message Message content to analyze
     * @param userPrefs User preferences service to update
     * @param filePrefs File preferences service to update
     */
    analyzeMessage(message, userPrefs, filePrefs) {
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
    extractLanguagePreferences(message, userPrefs) {
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
    extractFileTypePreferences(message, filePrefs) {
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
    extractOtherPreferences(message, userPrefs) {
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
        }
        else if (/\bspaces\b/i.test(message) || /\bindentation: space\b/i.test(message)) {
            userPrefs.setPreference('useTabs', false);
        }
    }
}
exports.ContextAnalysisService = ContextAnalysisService;
//# sourceMappingURL=ContextAnalysisService.js.map