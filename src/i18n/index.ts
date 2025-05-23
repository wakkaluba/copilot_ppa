import { LocalizationService } from './localization';

// Export types and classes
export * from './localization';

// Global instance of the localization service
let localizationService: LocalizationService | null = null;

/**
 * Initialize the localization module
 * @returns The localization service instance
 */
export function initializeLocalization(): LocalizationService {
  if (!localizationService) {
    localizationService = new LocalizationService(); // No args in stub
  }
  return localizationService;
}

/**
 * Get localized string by key
 * @param key The key of the string to get
 * @param defaultValue Default value if the key is not found
 * @returns The localized string
 */
export function localize(key: string, defaultValue: string): string {
  if (!localizationService) {
    return defaultValue;
  }
  // No getString method in stub, just return defaultValue
  return defaultValue;
}

/**
 * Supported languages in the application
 */
export type SupportedLanguage = string;

/**
 * Gets the current UI language
 * @returns Current language code
 */
export function getCurrentLanguage(): SupportedLanguage {
  return 'en';
}

/**
 * Detect language of text
 * @returns Detected language or null
 */
export function detectLanguage(): SupportedLanguage | null {
  return 'en';
}
