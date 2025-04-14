import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Supported languages in the application
 */
export enum SupportedLanguage {
    English = 'en',
    German = 'de',
    Spanish = 'es',
    French = 'fr',
    Chinese = 'zh',
    Japanese = 'ja',
    Russian = 'ru',
    Ukrainian = 'uk',
    Polish = 'pl',
    Danish = 'da',
    Norwegian = 'no',
    Swedish = 'sv',
    Portuguese = 'pt',
    Italian = 'it',
    Greek = 'el',
    Arabic = 'ar',
    Hebrew = 'he',
    Sanskrit = 'sa',
    Esperanto = 'eo',
    Korean = 'ko',
    ChineseTW = 'zh-tw',
    Thai = 'th',
    Malaysian = 'ms',
    Maori = 'mi',
    Mandarin = 'cmn',
    Turkish = 'tr',
    Czech = 'cs',
    Slovak = 'sk',
    Hungarian = 'hu',
    Serbian = 'sr',
    Albanian = 'sq'
}

/**
 * Main localization service for the extension
 */
export class LocalizationService {
    private translations: Map<string, LocaleStrings> = new Map();
    private currentLanguage: SupportedLanguage = SupportedLanguage.English;
    private context: vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initialize();
    }
    
    /**
     * Initialize the localization service
     */
    private initialize(): void {
        // Load the configured language or use editor language
        this.loadConfiguredLanguage();
        
        // Load all translation files
        this.loadTranslations();
        
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('localLlmAgent.language')) {
                this.loadConfiguredLanguage();
                // Notify UI components to update
                vscode.commands.executeCommand('localLlmAgent.languageChanged');
            }
        });
    }
    
    /**
     * Load the configured language from settings
     */
    private loadConfiguredLanguage(): void {
        const config = vscode.workspace.getConfiguration('localLlmAgent');
        const configuredLanguage = config.get<string>('language');
        
        if (configuredLanguage && Object.values(SupportedLanguage).includes(configuredLanguage as SupportedLanguage)) {
            this.currentLanguage = configuredLanguage as SupportedLanguage;
        } else {
            // Use VS Code UI language as fallback
            const editorLanguage = vscode.env.language;
            
            // Map VS Code language to our supported languages
            if (editorLanguage.startsWith('de')) {
                this.currentLanguage = SupportedLanguage.German;
            } else if (editorLanguage.startsWith('es')) {
                this.currentLanguage = SupportedLanguage.Spanish;
            } else if (editorLanguage.startsWith('fr')) {
                this.currentLanguage = SupportedLanguage.French;
            } else if (editorLanguage.startsWith('zh')) {
                this.currentLanguage = SupportedLanguage.Chinese;
            } else if (editorLanguage.startsWith('ja')) {
                this.currentLanguage = SupportedLanguage.Japanese;
            } else if (editorLanguage.startsWith('ru')) {
                this.currentLanguage = SupportedLanguage.Russian;
            } else {
                // Default to English
                this.currentLanguage = SupportedLanguage.English;
            }
        }
    }
    
    /**
     * Load all translation files
     */
    private loadTranslations(): void {
        // Get the locales directory
        const localesPath = this.context.asAbsolutePath('locales');
        
        try {
            // Check if locales directory exists
            if (!fs.existsSync(localesPath)) {
                return;
            }
            
            // Read all locale files
            const localeFiles = fs.readdirSync(localesPath).filter(file => file.endsWith('.json'));
            
            for (const file of localeFiles) {
                try {
                    const locale = path.basename(file, '.json');
                    const filePath = path.join(localesPath, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const translations = JSON.parse(content) as LocaleStrings;
                    
                    this.translations.set(locale, translations);
                } catch (error) {
                    console.error(`Failed to load translation file ${file}:`, error);
                }
            }
        } catch (error) {
            console.error('Failed to load translations:', error);
        }
        
        // Ensure English translation exists as a fallback
        if (!this.translations.has(SupportedLanguage.English)) {
            this.translations.set(SupportedLanguage.English, {});
        }
    }
    
    /**
     * Get a localized string by key
     * @param key The key of the string to get
     * @param defaultValue Default value if the key is not found
     * @param params Optional parameters to format the string
     * @returns The localized string
     */
    public getString(key: string, defaultValue: string, params?: Record<string, string>): string {
        // Get the translations for the current language
        let translations = this.translations.get(this.currentLanguage);
        
        // If not found, fall back to English
        if (!translations) {
            translations = this.translations.get(SupportedLanguage.English);
        }
        
        // Get the string or use default value
        let value = translations?.[key] || defaultValue;
        
        // Replace parameters if provided
        if (params) {
            for (const [param, replacement] of Object.entries(params)) {
                value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), replacement);
            }
        }
        
        return value;
    }
    
    /**
     * Get the current language
     */
    public getCurrentLanguage(): SupportedLanguage {
        return this.currentLanguage;
    }
    
    /**
     * Set the current language
     * @param language The language to set
     */
    public setLanguage(language: SupportedLanguage): void {
        this.currentLanguage = language;
        
        // Update configuration
        const config = vscode.workspace.getConfiguration('localLlmAgent');
        config.update('language', language, vscode.ConfigurationTarget.Global);
        
        // Notify UI components to update
        vscode.commands.executeCommand('localLlmAgent.languageChanged');
    }
    
    /**
     * Get all supported languages
     */
    public getSupportedLanguages(): SupportedLanguage[] {
        return Object.values(SupportedLanguage);
    }
    
    /**
     * Get a map of language codes to language names
     */
    public getLanguageNames(): Map<SupportedLanguage, string> {
        const map = new Map<SupportedLanguage, string>();
        
        map.set(SupportedLanguage.English, 'English');
        map.set(SupportedLanguage.German, 'Deutsch');
        map.set(SupportedLanguage.Spanish, 'Español');
        map.set(SupportedLanguage.French, 'Français');
        map.set(SupportedLanguage.Chinese, '中文');
        map.set(SupportedLanguage.Japanese, '日本語');
        map.set(SupportedLanguage.Russian, 'Русский');
        map.set(SupportedLanguage.Ukrainian, 'Українська');
        map.set(SupportedLanguage.Polish, 'Polski');
        map.set(SupportedLanguage.Danish, 'Dansk');
        map.set(SupportedLanguage.Norwegian, 'Norsk');
        map.set(SupportedLanguage.Swedish, 'Svenska');
        map.set(SupportedLanguage.Portuguese, 'Português');
        map.set(SupportedLanguage.Italian, 'Italiano');
        map.set(SupportedLanguage.Greek, 'Ελληνικά');
        map.set(SupportedLanguage.Arabic, 'العربية');
        map.set(SupportedLanguage.Hebrew, 'עברית');
        map.set(SupportedLanguage.Sanskrit, 'संस्कृत');
        map.set(SupportedLanguage.Esperanto, 'Esperanto');
        map.set(SupportedLanguage.Korean, '한국어');
        map.set(SupportedLanguage.ChineseTW, '繁體中文');
        map.set(SupportedLanguage.Thai, 'ไทย');
        map.set(SupportedLanguage.Malaysian, 'Bahasa Malaysia');
        map.set(SupportedLanguage.Maori, 'Te Reo Māori');
        map.set(SupportedLanguage.Mandarin, '普通话');
        map.set(SupportedLanguage.Turkish, 'Türkçe');
        map.set(SupportedLanguage.Czech, 'Čeština');
        map.set(SupportedLanguage.Slovak, 'Slovenčina');
        map.set(SupportedLanguage.Hungarian, 'Magyar');
        map.set(SupportedLanguage.Serbian, 'Српски');
        map.set(SupportedLanguage.Albanian, 'Shqip');
        
        return map;
    }
    
    /**
     * Detect the language of a text
     * @param text The text to detect
     * @returns The detected language or null if unknown
     */
    public detectLanguage(text: string): SupportedLanguage | null {
        // Simple language detection based on character frequency and common words
        
        // Check if text is too short
        if (!text || text.length < 5) {
            return null;
        }

        // Language detection patterns
        const patterns: Record<SupportedLanguage, RegExp[]> = {
            [SupportedLanguage.English]: [/\b(the|and|is|in|it|to|of|that|you|for)\b/gi],
            [SupportedLanguage.German]: [/\b(und|ist|der|die|das|ich|zu|mit|für|nicht)\b/gi, /[äöüß]/g],
            [SupportedLanguage.Spanish]: [/\b(el|la|de|que|y|en|un|una|es|para)\b/gi, /[áéíóúñ]/g],
            [SupportedLanguage.French]: [/\b(le|la|de|et|un|une|est|pour|dans|ce)\b/gi, /[éèêëàâîïôùûç]/g],
            [SupportedLanguage.Chinese]: [/[\u4e00-\u9fff]/g],
            [SupportedLanguage.Japanese]: [/[\u3040-\u309f\u30a0-\u30ff]/g],
            [SupportedLanguage.Russian]: [/[\u0400-\u04FF]/g],
            [SupportedLanguage.Ukrainian]: [/\b(та|і|в|на|це|що|для|не|я|ви)\b/gi, /[їієґ]/g],
            [SupportedLanguage.Polish]: [/\b(i|w|na|to|jest|nie|się|z|do|że)\b/gi, /[ąćęłńóśźż]/g],
            [SupportedLanguage.Danish]: [/\b(og|er|at|det|en|til|på|med|for|den)\b/gi, /[æøå]/g],
            [SupportedLanguage.Norwegian]: [/\b(og|er|det|i|på|en|å|for|med|som)\b/gi, /[æøå]/g],
            [SupportedLanguage.Swedish]: [/\b(och|är|det|i|på|en|att|för|med|som)\b/gi, /[åäö]/g],
            [SupportedLanguage.Portuguese]: [/\b(e|o|a|de|que|em|um|para|com|não)\b/gi, /[áàâãçéêíóôõú]/g],
            [SupportedLanguage.Italian]: [/\b(e|il|la|di|che|in|un|per|con|non)\b/gi, /[àèéìòù]/g],
            [SupportedLanguage.Greek]: [/[\u0370-\u03FF\u1F00-\u1FFF]/g],
            [SupportedLanguage.Arabic]: [/[\u0600-\u06FF]/g, /[\u0750-\u077F]/g],
            [SupportedLanguage.Hebrew]: [/[\u0590-\u05FF]/g],
            [SupportedLanguage.Sanskrit]: [/[\u0900-\u097F]/g, /[\u0980-\u09FF]/g],
            [SupportedLanguage.Esperanto]: [/\b(kaj|estas|la|en|mi|vi|ili|por|kun|de)\b/gi, /[ĉĝĥĵŝŭ]/g],
            [SupportedLanguage.Korean]: [/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/g],
            [SupportedLanguage.ChineseTW]: [/[\u4e00-\u9fff]/g, /[\u3100-\u312F]/g], // Uses Traditional Chinese characters + bopomofo
            [SupportedLanguage.Thai]: [/[\u0E00-\u0E7F]/g],
            [SupportedLanguage.Malaysian]: [/\b(dan|adalah|yang|di|untuk|dengan|ini|itu|pada|tidak)\b/gi],
            [SupportedLanguage.Maori]: [/\b(te|nga|ki|i|he|kia|ka|me|o|e)\b/gi, /[āēīōū]/g],
            [SupportedLanguage.Mandarin]: [/[\u4e00-\u9fff]/g],
            [SupportedLanguage.Turkish]: [/\b(ve|bir|bu|için|ile|ben|o|de|da|ne)\b/gi, /[ğıİöüçş]/g],
            [SupportedLanguage.Czech]: [/\b(a|je|to|v|na|se|že|s|z|do)\b/gi, /[áčďéěíňóřšťúůýž]/g],
            [SupportedLanguage.Slovak]: [/\b(a|je|to|v|na|sa|že|s|z|do)\b/gi, /[áäčďéíĺľňóôŕšťúýž]/g],
            [SupportedLanguage.Hungarian]: [/\b(a|az|és|van|hogy|nem|egy|ez|is|meg)\b/gi, /[áéíóöőúüű]/g],
            [SupportedLanguage.Serbian]: [/\b(и|у|је|да|се|на|за|од|са|то)\b/gi, /[аберилтргнкшзчсмјдњђжфћуоп]/g],
            [SupportedLanguage.Albanian]: [/\b(dhe|është|për|në|një|të|me|nga|që|ka)\b/gi, /[ëç]/g]
        };
        
        const scores: Record<SupportedLanguage, number> = {
            [SupportedLanguage.English]: 0,
            [SupportedLanguage.German]: 0,
            [SupportedLanguage.Spanish]: 0,
            [SupportedLanguage.French]: 0,
            [SupportedLanguage.Chinese]: 0,
            [SupportedLanguage.Japanese]: 0,
            [SupportedLanguage.Russian]: 0,
            [SupportedLanguage.Ukrainian]: 0,
            [SupportedLanguage.Polish]: 0,
            [SupportedLanguage.Danish]: 0,
            [SupportedLanguage.Norwegian]: 0,
            [SupportedLanguage.Swedish]: 0,
            [SupportedLanguage.Portuguese]: 0,
            [SupportedLanguage.Italian]: 0,
            [SupportedLanguage.Greek]: 0,
            [SupportedLanguage.Arabic]: 0,
            [SupportedLanguage.Hebrew]: 0,
            [SupportedLanguage.Sanskrit]: 0,
            [SupportedLanguage.Esperanto]: 0,
            [SupportedLanguage.Korean]: 0,
            [SupportedLanguage.ChineseTW]: 0,
            [SupportedLanguage.Thai]: 0,
            [SupportedLanguage.Malaysian]: 0,
            [SupportedLanguage.Maori]: 0,
            [SupportedLanguage.Mandarin]: 0,
            [SupportedLanguage.Turkish]: 0,
            [SupportedLanguage.Czech]: 0,
            [SupportedLanguage.Slovak]: 0,
            [SupportedLanguage.Hungarian]: 0,
            [SupportedLanguage.Serbian]: 0,
            [SupportedLanguage.Albanian]: 0
        };
        
        // Check each language pattern
        for (const [language, regexList] of Object.entries(patterns)) {
            for (const regex of regexList) {
                const matches = text.match(regex);
                if (matches) {
                    scores[language as SupportedLanguage] += matches.length;
                }
            }
        }
        
        // Find language with highest score
        let highestScore = 0;
        let detectedLanguage: SupportedLanguage | null = null;
        
        for (const [language, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                detectedLanguage = language as SupportedLanguage;
            }
        }
        
        // Return detected language if score is significant
        return highestScore >= 2 ? detectedLanguage : null;
    }

    /**
     * Gets the name of a language in that language
     * @param language Language code
     * @returns Language name in its own language
     */
    private getLanguageNameInLanguage(language: SupportedLanguage): string {
        switch (language) {
            case SupportedLanguage.English:
                return 'English';
            case SupportedLanguage.German:
                return 'Deutsch';
            case SupportedLanguage.Spanish:
                return 'Español';
            case SupportedLanguage.French:
                return 'Français';
            case SupportedLanguage.Chinese:
                return '中文';
            case SupportedLanguage.Japanese:
                return '日本語';
            case SupportedLanguage.Russian:
                return 'Русский';
            case SupportedLanguage.Ukrainian:
                return 'Українська';
            case SupportedLanguage.Polish:
                return 'Polski';
            case SupportedLanguage.Danish:
                return 'Dansk';
            case SupportedLanguage.Norwegian:
                return 'Norsk';
            case SupportedLanguage.Swedish:
                return 'Svenska';
            case SupportedLanguage.Portuguese:
                return 'Português';
            case SupportedLanguage.Italian:
                return 'Italiano';
            case SupportedLanguage.Greek:
                return 'Ελληνικά';
            case SupportedLanguage.Arabic:
                return 'العربية';
            case SupportedLanguage.Hebrew:
                return 'עברית';
            case SupportedLanguage.Sanskrit:
                return 'संस्कृत';
            case SupportedLanguage.Esperanto:
                return 'Esperanto';
            case SupportedLanguage.Korean:
                return '한국어';
            case SupportedLanguage.ChineseTW:
                return '繁體中文';
            case SupportedLanguage.Thai:
                return 'ไทย';
            case SupportedLanguage.Malaysian:
                return 'Bahasa Malaysia';
            case SupportedLanguage.Maori:
                return 'Te Reo Māori';
            case SupportedLanguage.Mandarin:
                return '普通话';
            case SupportedLanguage.Turkish:
                return 'Türkçe';
            case SupportedLanguage.Czech:
                return 'Čeština';
            case SupportedLanguage.Slovak:
                return 'Slovenčina';
            case SupportedLanguage.Hungarian:
                return 'Magyar';
            case SupportedLanguage.Serbian:
                return 'Српски';
            case SupportedLanguage.Albanian:
                return 'Shqip';
            default:
                return 'English';
        }
    }
}

/**
 * Type for locale string records
 */
export interface LocaleStrings {
    [key: string]: string;
}
