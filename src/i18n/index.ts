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
export function localize(
  key: string,
  defaultValue: string,
  params?: Record<string, string>,
): string {
  if (!localizationService) {
    return defaultValue;
  }
  return localizationService.getString(key, defaultValue, params);
}

/**
 * Supported languages in the application
 */
export type SupportedLanguage =
  | 'en'
  | 'es'
  | 'de'
  | 'fr'
  | 'it'
  | 'pt'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'ru'
  | 'ar'
  | 'tr'
  | 'pl'
  | 'nl'
  | 'sv'
  | 'no'
  | 'fi'
  | 'da'
  | 'cs'
  | 'uk'
  | 'hu'
  | 'th'
  | 'el';

/**
 * Gets the current UI language
 * @returns Current language code
 */
export function getCurrentLanguage(): SupportedLanguage {
  // In a real implementation, this would get the language from VSCode settings
  // or from the user's OS settings
  return 'en';
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
