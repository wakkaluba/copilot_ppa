import { SupportedLanguage } from '../../i18n';
export declare class MultilingualManager {
    private localizationService;
    constructor(context: any);
    isResponseInExpectedLanguage(response: string, language: SupportedLanguage): boolean;
    buildLanguageCorrectionPrompt(prompt: string, response: string, language: SupportedLanguage): string;
    enhancePromptWithLanguage(prompt: string, language: SupportedLanguage): string;
}
