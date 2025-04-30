import { SupportedLanguage } from '.';
export declare class MultilingualManager {
    isResponseInExpectedLanguage(response: string, language: SupportedLanguage): boolean;
    buildLanguageCorrectionPrompt(prompt: string, response: string, language: SupportedLanguage): string;
    enhancePromptWithLanguage(prompt: string, language: SupportedLanguage): string;
}
