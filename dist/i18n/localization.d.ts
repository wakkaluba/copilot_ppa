import * as vscode from 'vscode';
/**
 * Supported languages in the application
 */
export type SupportedLanguage = 'en' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'ja' | 'ko' | 'zh' | 'ru' | 'ar' | 'tr' | 'pl' | 'nl' | 'sv' | 'no' | 'fi' | 'da' | 'cs' | 'uk' | 'hu' | 'th' | 'el';
/**
 * Service for handling localization and language-related functions
 */
export declare class LocalizationService {
    private readonly context;
    private readonly strings;
    private language;
    constructor(context: vscode.ExtensionContext);
    /**
     * Loads the current language settings and string resources
     */
    private loadLanguage;
    /**
     * Loads string resources from the locale file
     */
    private loadStrings;
    /**
     * Gets a localized string by key
     * @param key The key of the string to get
     * @param defaultValue Default value if the key is not found
     * @param params Optional parameters to format the string
     * @returns The localized string
     */
    getString(key: string, defaultValue: string, params?: Record<string, string>): string;
    /**
     * Gets the current language
     * @returns The current language code
     */
    getCurrentLanguage(): SupportedLanguage;
    /**
     * Sets the current language
     * @param language The language to set
     */
    setLanguage(language: SupportedLanguage): void;
    /**
     * Detect the language of a text
     * @param text The text to analyze
     * @returns The detected language or null if detection failed
     */
    detectLanguage(text: string): SupportedLanguage | null;
    /**
     * Normalizes a language code to a supported language
     * @param langCode A language code (e.g., "en-US")
     * @returns A supported language code
     */
    private normalizeLanguage;
}
