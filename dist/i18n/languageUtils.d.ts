import { SupportedLanguage } from './';
export declare const languageNames: Map<SupportedLanguage, string>;
export declare function getLanguageName(language: SupportedLanguage): string;
export declare function getLanguageByName(name: string): SupportedLanguage | null;
export declare function isKnownLanguage(language: string): language is SupportedLanguage;
