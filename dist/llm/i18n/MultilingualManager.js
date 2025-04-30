"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultilingualManager = void 0;
const localization_1 = require("../../i18n/localization");
const languageUtils_1 = require("../../i18n/languageUtils");
class MultilingualManager {
    localizationService;
    constructor(context) {
        this.localizationService = new localization_1.LocalizationService(context);
    }
    isResponseInExpectedLanguage(response, language) {
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
    buildLanguageCorrectionPrompt(prompt, response, language) {
        const languageName = (0, languageUtils_1.getLanguageName)(language);
        return `Please provide the response to "${prompt}" in ${languageName}. Previous response was: ${response}`;
    }
    enhancePromptWithLanguage(prompt, language) {
        if (language === 'en') {
            return prompt; // No need to enhance for English
        }
        const languageName = (0, languageUtils_1.getLanguageName)(language);
        return `${prompt}\n\nPlease respond in ${languageName}.`;
    }
}
exports.MultilingualManager = MultilingualManager;
//# sourceMappingURL=MultilingualManager.js.map