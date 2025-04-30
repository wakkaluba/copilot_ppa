import * as vscode from 'vscode';
import { LocalizationService, SupportedLanguage } from './localization';
export * from './localization';
/**
 * Initialize the localization module
 * @param context The extension context
 * @returns The localization service instance
 */
export declare function initializeLocalization(context: vscode.ExtensionContext): LocalizationService;
/**
 * Get localized string by key
 * @param key The key of the string to get
 * @param defaultValue Default value if the key is not found
 * @param params Optional parameters to format the string
 * @returns The localized string
 */
export declare function localize(key: string, defaultValue: string, params?: Record<string, string>): string;
/**
 * Supported languages in the application
 */
export type SupportedLanguage = 'en' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'ja' | 'ko' | 'zh' | 'ru' | 'ar' | 'tr' | 'pl' | 'nl' | 'sv' | 'no' | 'fi' | 'da' | 'cs' | 'uk' | 'hu' | 'th' | 'el';
/**
 * Gets the current UI language
 * @returns Current language code
 */
export declare function getCurrentLanguage(): SupportedLanguage;
/**
 * Detect language of text
 * @param text Text to analyze
 * @returns Detected language or null
 */
export declare function detectLanguage(text: string): SupportedLanguage | null;
