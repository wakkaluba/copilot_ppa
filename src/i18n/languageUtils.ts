import { SupportedLanguage } from './';

export const languageNames: Map<SupportedLanguage, string> = new Map([
    ['en', 'English'], ['es', 'Spanish'], ['de', 'German'],
    ['fr', 'French'], ['it', 'Italian'], ['pt', 'Portuguese'],
    ['ja', 'Japanese'], ['ko', 'Korean'], ['zh', 'Chinese'],
    ['ru', 'Russian'], ['ar', 'Arabic'], ['tr', 'Turkish'],
    ['pl', 'Polish'], ['nl', 'Dutch'], ['sv', 'Swedish'],
    ['no', 'Norwegian'], ['fi', 'Finnish'], ['da', 'Danish'],
    ['cs', 'Czech'], ['uk', 'Ukrainian'], ['hu', 'Hungarian'],
    ['th', 'Thai'], ['el', 'Greek']
]);

export function getLanguageName(language: SupportedLanguage): string {
    return languageNames.get(language) || language;
}

export function getLanguageByName(name: string): SupportedLanguage | null {
    for (const [code, langName] of languageNames) {
        if (langName.toLowerCase() === name.toLowerCase()) {
            return code;
        }
    }
    return null;
}

export function isKnownLanguage(language: string): language is SupportedLanguage {
    return languageNames.has(language as SupportedLanguage);
}