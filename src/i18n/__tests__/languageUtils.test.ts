// filepath: d:\___coding\tools\copilot_ppa\src\i18n\__tests__\languageUtils.test.ts
import { SupportedLanguage } from '../';
import {
    getLanguageByName,
    getLanguageName,
    isKnownLanguage,
    languageNames
} from '../languageUtils';

describe('languageUtils', () => {
    describe('languageNames', () => {
        it('should contain all supported languages', () => {
            const expectedLanguages: SupportedLanguage[] = [
                'en', 'es', 'de', 'fr', 'it', 'pt', 'ja',
                'ko', 'zh', 'ru', 'ar', 'tr', 'pl', 'nl',
                'sv', 'no', 'fi', 'da', 'cs', 'uk', 'hu',
                'th', 'el'
            ];

            // Check that all expected languages are in the map
            for (const lang of expectedLanguages) {
                expect(languageNames.has(lang)).toBe(true);
            }

            // Check the total count matches
            expect(languageNames.size).toBe(expectedLanguages.length);
        });

        it('should map language codes to correct language names', () => {
            const expectedMappings = {
                'en': 'English',
                'es': 'Spanish',
                'de': 'German',
                'fr': 'French',
                'it': 'Italian',
                'zh': 'Chinese',
                'ja': 'Japanese',
                'ru': 'Russian',
                'ar': 'Arabic'
            };

            for (const [code, name] of Object.entries(expectedMappings)) {
                expect(languageNames.get(code as SupportedLanguage)).toBe(name);
            }
        });
    });

    describe('getLanguageName', () => {
        it('should return the correct language name for valid codes', () => {
            expect(getLanguageName('en')).toBe('English');
            expect(getLanguageName('es')).toBe('Spanish');
            expect(getLanguageName('de')).toBe('German');
            expect(getLanguageName('fr')).toBe('French');
            expect(getLanguageName('zh')).toBe('Chinese');
        });

        it('should return the language code itself for invalid codes', () => {
            const invalidCode = 'invalid' as SupportedLanguage;
            expect(getLanguageName(invalidCode)).toBe(invalidCode);
        });
    });

    describe('getLanguageByName', () => {
        it('should return the correct language code for valid names', () => {
            expect(getLanguageByName('English')).toBe('en');
            expect(getLanguageByName('Spanish')).toBe('es');
            expect(getLanguageByName('German')).toBe('de');
            expect(getLanguageByName('French')).toBe('fr');
            expect(getLanguageByName('Chinese')).toBe('zh');
        });

        it('should be case-insensitive', () => {
            expect(getLanguageByName('ENGLISH')).toBe('en');
            expect(getLanguageByName('english')).toBe('en');
            expect(getLanguageByName('Spanish')).toBe('es');
            expect(getLanguageByName('spanish')).toBe('es');
            expect(getLanguageByName('sPaNiSh')).toBe('es');
        });

        it('should return null for unknown language names', () => {
            expect(getLanguageByName('Unknown')).toBeNull();
            expect(getLanguageByName('NotALanguage')).toBeNull();
            expect(getLanguageByName('')).toBeNull();
        });
    });

    describe('isKnownLanguage', () => {
        it('should return true for supported languages', () => {
            expect(isKnownLanguage('en')).toBe(true);
            expect(isKnownLanguage('es')).toBe(true);
            expect(isKnownLanguage('de')).toBe(true);
            expect(isKnownLanguage('fr')).toBe(true);
            expect(isKnownLanguage('zh')).toBe(true);
        });

        it('should return false for unsupported languages', () => {
            expect(isKnownLanguage('xx')).toBe(false);
            expect(isKnownLanguage('invalid')).toBe(false);
            expect(isKnownLanguage('')).toBe(false);
        });

        // This test verifies TypeScript's type guard functionality indirectly
        it('should function as a TypeScript type guard', () => {
            const someLanguage = 'en';
            if (isKnownLanguage(someLanguage)) {
                // If this compiles, the type guard is working
                const name: string = getLanguageName(someLanguage);
                expect(name).toBe('English');
            }

            const unknownLanguage = 'xyz';
            expect(isKnownLanguage(unknownLanguage)).toBe(false);
        });
    });
});
