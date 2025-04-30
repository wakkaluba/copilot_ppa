import { SupportedLanguage } from '../../i18n';
import { LocalizationService } from '../../i18n/localization';
import { getLanguageName } from '../../i18n/languageUtils';

export class MultilingualManager {
    private localizationService: LocalizationService;

    constructor(context: any) {
        this.localizationService = new LocalizationService(context);
    }

    isResponseInExpectedLanguage(response: string, language: SupportedLanguage): boolean {
        // Skip validation for English as it's our fallback
        if (language === 'en') {
            return true;
        }

        // Check for explicit mentions of language inability
        const lowerResponse = response.toLowerCase();
        if (lowerResponse.includes("i can only respond in english") ||
            lowerResponse.includes("i can't respond in") ||
            lowerResponse.includes("i cannot respond in") ||
            lowerResponse.includes("i am not able to respond in")) {
            return false;
        }

        // Use the enhanced language detection
        const detectedLanguage = this.localizationService.detectLanguage(response);
        return detectedLanguage === language;
    }

    buildLanguageCorrectionPrompt(prompt: string, response: string, language: SupportedLanguage): string {
        const languageName = getLanguageName(language);
        return `Please provide the response to "${prompt}" in ${languageName}. Previous response was: ${response}`;
    }

    enhancePromptWithLanguage(prompt: string, language: SupportedLanguage): string {
        if (language === 'en') {
            return prompt; // No need to enhance for English
        }
        
        const languageName = getLanguageName(language);
        return `${prompt}\n\nPlease respond in ${languageName}.`;
    }
}