import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

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
 * Interface for locale translation records
 */
export interface LocaleStrings {
    [key: string]: string | LocaleStrings;
}

/**
 * Configuration for localization service
 */
interface LocalizationConfig {
    defaultLanguage: SupportedLanguage;
    fallbackLanguage: SupportedLanguage;
    cacheEnabled: boolean;
    cacheTimeout: number;
    loadOnDemand: boolean;
    healthCheckInterval: number;
    detectionThreshold: number;
}

/**
 * Language detection patterns and rules
 */
interface LanguagePatterns {
    commonWords: RegExp[];
    specialCharacters?: RegExp[];
    script?: RegExp;
    minConfidenceScore: number;
}

/**
 * Status of a language detection cache entry
 */
interface DetectionCacheEntry {
    language: SupportedLanguage | null;
    timestamp: number;
    confidence: number;
}

/**
 * Main localization service for the extension
 */
export class LocalizationService extends EventEmitter {
    private translations: Map<SupportedLanguage, LocaleStrings> = new Map();
    private currentLanguage: SupportedLanguage;
    private detectionCache: Map<string, DetectionCacheEntry> = new Map();
    private readonly context: vscode.ExtensionContext;
    private config: LocalizationConfig;
    private readonly languagePatterns: Map<SupportedLanguage, LanguagePatterns>;
    private disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        super();
        this.context = context;
        this.config = this.loadConfig();
        this.currentLanguage = this.config.defaultLanguage;
        this.languagePatterns = this.initializeLanguagePatterns();
        this.initialize();
    }

    /**
     * Initialize the localization service
     */
    private initialize(): void {
        // Load translations and configure settings
        this.loadConfiguredLanguage();
        if (!this.config.loadOnDemand) {
            this.loadAllTranslations();
        }

        // Setup VS Code configuration change listener
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('i18n')) {
                    this.updateConfiguration();
                }
            })
        );

        // Start cleanup interval for detection cache
        if (this.config.cacheEnabled) {
            setInterval(() => this.cleanupDetectionCache(), this.config.cacheTimeout);
        }
    }

    /**
     * Load service configuration
     */
    private loadConfig(): LocalizationConfig {
        const config = vscode.workspace.getConfiguration('i18n');
        return {
            defaultLanguage: SupportedLanguage.English,
            fallbackLanguage: SupportedLanguage.English,
            cacheEnabled: config.get('cache.enabled', true),
            cacheTimeout: config.get('cache.timeout', 3600000), // 1 hour
            loadOnDemand: config.get('loadOnDemand', false),
            healthCheckInterval: config.get('healthCheck.interval', 300000), // 5 minutes
            detectionThreshold: config.get('detection.threshold', 0.6)
        };
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
            this.currentLanguage = this.mapEditorLanguageToSupported(editorLanguage);
        }
    }

    /**
     * Map VS Code editor language to supported language
     */
    private mapEditorLanguageToSupported(editorLanguage: string): SupportedLanguage {
        const languageMap: Record<string, SupportedLanguage> = {
            'de': SupportedLanguage.German,
            'es': SupportedLanguage.Spanish,
            'fr': SupportedLanguage.French,
            'zh-cn': SupportedLanguage.Chinese,
            'zh-tw': SupportedLanguage.ChineseTW,
            'ja': SupportedLanguage.Japanese,
            'ru': SupportedLanguage.Russian,
            'uk': SupportedLanguage.Ukrainian,
            'pl': SupportedLanguage.Polish,
            'da': SupportedLanguage.Danish,
            'no': SupportedLanguage.Norwegian,
            'sv': SupportedLanguage.Swedish,
            'pt': SupportedLanguage.Portuguese,
            'it': SupportedLanguage.Italian,
            'el': SupportedLanguage.Greek,
            'ar': SupportedLanguage.Arabic,
            'he': SupportedLanguage.Hebrew,
            'ko': SupportedLanguage.Korean,
            'th': SupportedLanguage.Thai,
            'tr': SupportedLanguage.Turkish,
            'cs': SupportedLanguage.Czech,
            'sk': SupportedLanguage.Slovak,
            'hu': SupportedLanguage.Hungarian,
            'sr': SupportedLanguage.Serbian,
            'sq': SupportedLanguage.Albanian
        };

        // Find the matching language code
        const languageCode = Object.keys(languageMap).find(code => 
            editorLanguage.toLowerCase().startsWith(code.toLowerCase())
        );

        return (languageCode && languageMap[languageCode]) || this.config.defaultLanguage;
    }

    /**
     * Load all translation files
     */
    private loadAllTranslations(): void {
        const localesPath = this.context.asAbsolutePath('locales');
        
        try {
            if (!fs.existsSync(localesPath)) {
                console.error('Locales directory not found:', localesPath);
                return;
            }
            
            const localeFiles = fs.readdirSync(localesPath).filter(file => file.endsWith('.json'));
            
            for (const file of localeFiles) {
                try {
                    const locale = path.basename(file, '.json');
                    const filePath = path.join(localesPath, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const translations = JSON.parse(content) as LocaleStrings;
                    
                    if (Object.values(SupportedLanguage).includes(locale as SupportedLanguage)) {
                        this.translations.set(locale as SupportedLanguage, translations);
                    }
                } catch (error) {
                    console.error(`Failed to load translation file ${file}:`, error);
                }
            }
        } catch (error) {
            console.error('Failed to load translations:', error);
        }
        
        // Ensure English translation exists as a fallback
        if (!this.translations.has(this.config.fallbackLanguage)) {
            this.translations.set(this.config.fallbackLanguage, {});
        }
    }

    /**
     * Load translations for a specific language
     */
    private loadTranslationsForLanguage(language: SupportedLanguage): void {
        if (this.translations.has(language)) {
            return;
        }

        const localesPath = this.context.asAbsolutePath('locales');
        const filePath = path.join(localesPath, `${language}.json`);

        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const translations = JSON.parse(content) as LocaleStrings;
                this.translations.set(language, translations);
            } else {
                console.warn(`Translation file not found for language: ${language}`);
                this.translations.set(language, {});
            }
        } catch (error) {
            console.error(`Failed to load translations for language ${language}:`, error);
            this.translations.set(language, {});
        }
    }

    /**
     * Get a localized string by key
     */
    public getString(key: string, defaultValue: string, params?: Record<string, string>): string {
        // Load translations on demand if configured
        if (this.config.loadOnDemand && !this.translations.has(this.currentLanguage)) {
            this.loadTranslationsForLanguage(this.currentLanguage);
        }

        // Get translations for current language
        const translations = this.translations.get(this.currentLanguage) || {};
        
        // Try to get value from current language translations
        let value = this.getNestedValue(translations, key);
        
        // Fall back to English if not found
        if (value === undefined && this.currentLanguage !== this.config.fallbackLanguage) {
            const fallbackTranslations = this.translations.get(this.config.fallbackLanguage);
            value = fallbackTranslations ? this.getNestedValue(fallbackTranslations, key) : undefined;
        }
        
        // Use default value if still not found
        value = value?.toString() || defaultValue;
        
        // Replace parameters if provided
        if (params) {
            value = this.interpolateParams(value, params);
        }
        
        return value;
    }

    /**
     * Get a nested value from translations using dot notation
     */
    private getNestedValue(obj: LocaleStrings, key: string): string | undefined {
        const parts = key.split('.');
        let current: any = obj;
        
        for (const part of parts) {
            if (current === undefined || typeof current !== 'object') {
                return undefined;
            }
            current = current[part];
        }
        
        return typeof current === 'string' ? current : undefined;
    }

    /**
     * Replace parameters in a string
     */
    private interpolateParams(value: string, params: Record<string, string>): string {
        return value.replace(/\{(\w+)\}/g, (match, key) => 
            params[key] !== undefined ? params[key] : match
        );
    }

    /**
     * Initialize language detection patterns
     */
    private initializeLanguagePatterns(): Map<SupportedLanguage, LanguagePatterns> {
        const patterns = new Map<SupportedLanguage, LanguagePatterns>();

        patterns.set(SupportedLanguage.English, {
            commonWords: [/\b(the|and|is|in|it|to|of|that|you|for)\b/gi],
            minConfidenceScore: 0.6
        });

        patterns.set(SupportedLanguage.German, {
            commonWords: [/\b(und|ist|der|die|das|ich|zu|mit|für|nicht)\b/gi],
            specialCharacters: [/[äöüß]/g],
            minConfidenceScore: 0.7
        });

        patterns.set(SupportedLanguage.Spanish, {
            commonWords: [/\b(el|la|de|que|y|en|un|una|es|para)\b/gi],
            specialCharacters: [/[áéíóúñ]/g],
            minConfidenceScore: 0.7
        });

        patterns.set(SupportedLanguage.French, {
            commonWords: [/\b(le|la|de|et|un|une|est|pour|dans|ce)\b/gi],
            specialCharacters: [/[éèêëàâîïôùûç]/g],
            minConfidenceScore: 0.7
        });

        patterns.set(SupportedLanguage.Chinese, {
            commonWords: [],
            script: /[\u4e00-\u9fff]/g,
            minConfidenceScore: 0.5
        });

        patterns.set(SupportedLanguage.Japanese, {
            commonWords: [],
            script: /[\u3040-\u309f\u30a0-\u30ff]/g,
            minConfidenceScore: 0.5
        });

        // Add other language patterns...

        return patterns;
    }

    /**
     * Update configuration when settings change
     */
    private updateConfiguration(): void {
        this.config = this.loadConfig();
        
        // Clear cache if cache settings changed
        if (!this.config.cacheEnabled) {
            this.detectionCache.clear();
        }
        
        // Notify listeners of configuration change
        this.emit('configurationChanged', this.config);
    }

    /**
     * Clean up expired cache entries
     */
    private cleanupDetectionCache(): void {
        const now = Date.now();
        for (const [key, entry] of this.detectionCache.entries()) {
            if (now - entry.timestamp > this.config.cacheTimeout) {
                this.detectionCache.delete(key);
            }
        }
    }

    /**
     * Detect the language of a text
     */
    public detectLanguage(text: string): SupportedLanguage | null {
        if (!text || text.length < 5) {
            return null;
        }

        // Check cache first if enabled
        if (this.config.cacheEnabled) {
            const cached = this.detectionCache.get(text);
            if (cached && (Date.now() - cached.timestamp < this.config.cacheTimeout)) {
                return cached.language;
            }
        }

        const scores = new Map<SupportedLanguage, { score: number; confidence: number }>();

        // Calculate scores for each language
        for (const [language, patterns] of this.languagePatterns.entries()) {
            let totalScore = 0;
            let maxPossibleScore = 0;

            // Check script pattern if available
            if (patterns.script) {
                const scriptMatches = (text.match(patterns.script) || []).length;
                totalScore += scriptMatches * 2;
                maxPossibleScore += text.length * 2;
            }

            // Check common words
            if (patterns.commonWords) {
                for (const pattern of patterns.commonWords) {
                    const matches = text.match(pattern) || [];
                    totalScore += matches.length;
                    maxPossibleScore += 1;
                }
            }

            // Check special characters
            if (patterns.specialCharacters) {
                for (const pattern of patterns.specialCharacters) {
                    const matches = text.match(pattern) || [];
                    totalScore += matches.length;
                    maxPossibleScore += 1;
                }
            }

            if (maxPossibleScore > 0) {
                const confidence = totalScore / maxPossibleScore;
                if (confidence >= patterns.minConfidenceScore) {
                    scores.set(language, {
                        score: totalScore,
                        confidence: confidence
                    });
                }
            }
        }

        // Find language with highest score and sufficient confidence
        let bestLanguage: SupportedLanguage | null = null;
        let highestScore = 0;
        let highestConfidence = 0;

        for (const [language, result] of scores.entries()) {
            if (result.score > highestScore && 
                result.confidence >= (this.languagePatterns.get(language)?.minConfidenceScore || 0)) {
                highestScore = result.score;
                highestConfidence = result.confidence;
                bestLanguage = language;
            }
        }

        // Cache the result if enabled
        if (this.config.cacheEnabled) {
            this.detectionCache.set(text, {
                language: bestLanguage,
                timestamp: Date.now(),
                confidence: highestConfidence
            });
        }

        return bestLanguage;
    }

    /**
     * Get the current language
     */
    public getCurrentLanguage(): SupportedLanguage {
        return this.currentLanguage;
    }

    /**
     * Set the current language
     */
    public setLanguage(language: SupportedLanguage): void {
        if (this.currentLanguage !== language) {
            this.currentLanguage = language;
            
            // Load translations if using load-on-demand
            if (this.config.loadOnDemand) {
                this.loadTranslationsForLanguage(language);
            }
            
            // Update VS Code configuration
            void vscode.workspace.getConfiguration('localLlmAgent')
                .update('language', language, vscode.ConfigurationTarget.Global)
                .then(() => {
                    this.emit('languageChanged', language);
                })
                .catch((error: Error) => {
                    console.error('Failed to update language configuration:', error);
                });
        }
    }

    /**
     * Get all supported languages
     */
    public getSupportedLanguages(): SupportedLanguage[] {
        return Object.values(SupportedLanguage);
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.translations.clear();
        this.detectionCache.clear();
        this.removeAllListeners();
    }
}
