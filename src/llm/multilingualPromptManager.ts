import { SupportedLanguage } from '../i18n';

/**
 * Manages multilingual prompts and language detection for LLM responses
 */
export class MultilingualPromptManager {
    // Language names mapping (ISO code to full name)
    private languageNames: Map<SupportedLanguage, string> = new Map([
        ['en', 'English'],
        ['es', 'Spanish'],
        ['de', 'German'],
        ['fr', 'French'],
        ['it', 'Italian'],
        ['pt', 'Portuguese'],
        ['ja', 'Japanese'],
        ['ko', 'Korean'],
        ['zh', 'Chinese'],
        ['ru', 'Russian'],
        ['ar', 'Arabic'],
        ['tr', 'Turkish'],
        ['pl', 'Polish'],
        ['nl', 'Dutch'],
        ['sv', 'Swedish'],
        ['no', 'Norwegian'],
        ['fi', 'Finnish'],
        ['da', 'Danish'],
        ['cs', 'Czech'],
        ['uk', 'Ukrainian'],
        ['hu', 'Hungarian'],
        ['th', 'Thai'],
        ['el', 'Greek']
    ]);

    /**
     * Creates a prompt that enhances the original prompt with language instructions
     * @param prompt Original prompt
     * @param language Target language 
     * @returns Enhanced prompt with language instructions
     */
    public enhancePromptWithLanguage(prompt: string, language: SupportedLanguage): string {
        if (language === 'en') {
            return prompt; // No need to enhance for English
        }

        const languageName = this.getLanguageName(language);
        return `${prompt}\n\nRespond in ${languageName}.`;
    }

    /**
     * Checks if the response is in the expected language
     * @param response The LLM response to check
     * @param language The expected language
     * @returns True if the response is likely in the expected language
     */
    public isResponseInExpectedLanguage(response: string, language: SupportedLanguage): boolean {
        // This is a simple implementation - in a real system, you might use a language detection library
        // For now, we'll assume all responses are correctly in the requested language
        
        // Implement basic heuristics for very obvious cases like responses explicitly saying they can't respond in that language
        const lowerResponse = response.toLowerCase();
        const languageName = this.getLanguageName(language);
        
        if (language !== 'en' && lowerResponse.includes("i can only respond in english") || 
            lowerResponse.includes("i can't respond in") ||
            lowerResponse.includes("i cannot respond in")) {
            return false;
        }
        
        return true;
    }

    /**
     * Builds a correction prompt to fix a response in the wrong language
     * @param originalPrompt The original prompt
     * @param originalResponse The response in the wrong language
     * @param targetLanguage The language we want
     * @returns A new prompt asking for a translation
     */
    public buildLanguageCorrectionPrompt(
        originalPrompt: string,
        originalResponse: string,
        targetLanguage: SupportedLanguage
    ): string {
        const languageName = this.getLanguageName(targetLanguage);
        
        return `
I need this response translated to ${languageName}:

Original prompt: ${originalPrompt}

Response to translate: ${originalResponse}

Provide only the translated response in ${languageName}, no explanations.`;
    }

    /**
     * Gets the full language name from its code
     * @param language Language code
     * @returns Full language name
     */
    private getLanguageName(language: SupportedLanguage): string {
        return this.languageNames.get(language) || 'English';
    }
}
