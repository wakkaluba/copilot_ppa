import { SupportedLanguage } from '../i18n';
/**
 * Manages multilingual prompts and language detection for LLM responses
 */
export declare class MultilingualPromptManager {
    private languageNames;
    /**
     * Creates a prompt that enhances the original prompt with language instructions
     * @param prompt Original prompt
     * @param language Target language
     * @returns Enhanced prompt with language instructions
     */
    enhancePromptWithLanguage(prompt: string, language: SupportedLanguage): string;
    /**
     * Checks if the response is in the expected language
     * @param response The LLM response to check
     * @param language The expected language
     * @returns True if the response is likely in the expected language
     */
    isResponseInExpectedLanguage(response: string, language: SupportedLanguage): boolean;
    /**
     * Builds a correction prompt to fix a response in the wrong language
     * @param originalPrompt The original prompt
     * @param originalResponse The response in the wrong language
     * @param targetLanguage The language we want
     * @returns A new prompt asking for a translation
     */
    buildLanguageCorrectionPrompt(originalPrompt: string, originalResponse: string, targetLanguage: SupportedLanguage): string;
    /**
     * Gets the full language name from its code
     * @param language Language code
     * @returns Full language name
     */
    private getLanguageName;
}
