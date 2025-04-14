import * as vscode from 'vscode';
import { LocalizationService, SupportedLanguage } from './localization';

// Export types and classes
export * from './localization';

// Global instance of the localization service
let localizationService: LocalizationService | null = null;

/**
 * Initialize the localization module
 * @param context The extension context
 * @returns The localization service instance
 */
export function initializeLocalization(context: vscode.ExtensionContext): LocalizationService {
    if (!localizationService) {
        localizationService = new LocalizationService(context);
    }
    return localizationService;
}

/**
 * Get localized string by key
 * @param key The key of the string to get
 * @param defaultValue Default value if the key is not found
 * @param params Optional parameters to format the string
 * @returns The localized string
 */
export function localize(key: string, defaultValue: string, params?: Record<string, string>): string {
    if (!localizationService) {
        return defaultValue;
    }
    return localizationService.getString(key, defaultValue, params);
}

/**
 * Get the current language
 * @returns The current language code
 */
export function getCurrentLanguage(): SupportedLanguage {
    if (!localizationService) {
        return SupportedLanguage.English;
    }
    return localizationService.getCurrentLanguage();
}

/**
 * Detect language of text
 * @param text Text to analyze
 * @returns Detected language or null
 */
export function detectLanguage(text: string): SupportedLanguage | null {
    if (!localizationService) {
        return null;
    }
    return localizationService.detectLanguage(text);
}
