import * as vscode from 'vscode';
import { SupportedLanguage, detectLanguage } from '../i18n';

/**
 * Options for LLM prompts
 */
interface LLMPromptOptions {
    // Add properties as needed
    temperature?: number;
    maxTokens?: number;
}

/**
 * Manager for handling multilingual prompts and responses
 */
export class MultilingualPromptManager {
    /**
     * Wraps a prompt with language directives if needed
     * @param prompt The original prompt text
     * @param targetLanguage The target language for the response
     * @param options LLM prompt options
     * @returns Enhanced prompt with language directives
     */
    public enhancePromptWithLanguage(
        prompt: string,
        targetLanguage?: SupportedLanguage,
        options?: LLMPromptOptions
    ): string {
        // Detect the input language
        const detectedLanguage = detectLanguage(prompt);
        
        // If no target language is specified, use the detected language
        const responseLanguage = targetLanguage || detectedLanguage || SupportedLanguage.English;
        
        // If input and output languages are the same (and not English),
        // add a directive to ensure the model responds in that language
        if (detectedLanguage && 
            detectedLanguage !== SupportedLanguage.English && 
            detectedLanguage === responseLanguage) {
            return this.addLanguageDirective(prompt, responseLanguage);
        }
        
        // If output language is different from input, add translation directive
        if (responseLanguage && 
            ((detectedLanguage && detectedLanguage !== responseLanguage) || 
             (!detectedLanguage && responseLanguage !== SupportedLanguage.English))) {
            return this.addTranslationDirective(prompt, responseLanguage);
        }
        
        // Otherwise, return the original prompt
        return prompt;
    }
    
    /**
     * Adds a language directive to a prompt
     * @param prompt Original prompt text
     * @param language Target language
     * @returns Enhanced prompt with language directive
     */
    private addLanguageDirective(prompt: string, language: SupportedLanguage): string {
        // Get language name in that language
        const languageName = this.getLanguageNameInLanguage(language);
        
        // Add directive at the beginning
        return `[Please respond in ${languageName}]\n\n${prompt}`;
    }
    
    /**
     * Adds a translation directive to a prompt
     * @param prompt Original prompt text
     * @param targetLanguage Target language for translation
     * @returns Enhanced prompt with translation directive
     */
    private addTranslationDirective(prompt: string, targetLanguage: SupportedLanguage): string {
        // Get language name in target language
        const languageName = this.getLanguageNameInLanguage(targetLanguage);
        const englishName = this.getLanguageNameInLanguage(SupportedLanguage.English);
        
        // Add directive at the beginning
        return `[Please respond in ${languageName} (${englishName})]\n\n${prompt}`;
    }
    
    /**
     * Gets the name of a language in that language
     * @param language Language code
     * @returns Language name in its own language
     */
    private getLanguageNameInLanguage(language: SupportedLanguage): string {
        switch (language) {
            case SupportedLanguage.English:
                return 'English';
            case SupportedLanguage.German:
                return 'Deutsch';
            case SupportedLanguage.Spanish:
                return 'Español';
            case SupportedLanguage.French:
                return 'Français';
            case SupportedLanguage.Chinese:
                return '中文';
            case SupportedLanguage.Japanese:
                return '日本語';
            case SupportedLanguage.Russian:
                return 'Русский';
            default:
                return 'English';
        }
    }
    
    /**
     * Detects if the response is in the expected language
     * @param response LLM response text
     * @param expectedLanguage The language we expected
     * @returns Whether the response appears to be in the expected language
     */
    public isResponseInExpectedLanguage(
        response: string,
        expectedLanguage: SupportedLanguage
    ): boolean {
        // Detect language of the response
        const detectedLanguage = detectLanguage(response);
        
        // If no language could be detected, return true (benefit of doubt)
        if (!detectedLanguage) {
            return true;
        }
        
        // Check if detected language matches expected language
        return detectedLanguage === expectedLanguage;
    }
    
    /**
     * Request a correction if response is in the wrong language
     * @param originalPrompt The original prompt
     * @param response The response in the wrong language
     * @param targetLanguage The expected language
     * @returns A new prompt requesting translation
     */
    public buildLanguageCorrectionPrompt(
        originalPrompt: string,
        response: string,
        targetLanguage: SupportedLanguage
    ): string {
        // Get language name in target language
        const languageName = this.getLanguageNameInLanguage(targetLanguage);
        const englishName = this.getLanguageNameInLanguage(SupportedLanguage.English);
        
        return `Your previous response was not in ${languageName} (${englishName}) as requested. Please translate your previous response to ${languageName}. Original prompt was: "${originalPrompt.substring(0, 100)}..."`;
    }
}
