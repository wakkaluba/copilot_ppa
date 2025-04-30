"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationService = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Service for handling localization and language-related functions
 */
class LocalizationService {
    context;
    strings = new Map();
    language = 'en';
    constructor(context) {
        this.context = context;
        this.loadLanguage();
    }
    /**
     * Loads the current language settings and string resources
     */
    loadLanguage() {
        // Get language from VS Code or fall back to English
        let vsCodeLang = vscode.env.language;
        this.language = this.normalizeLanguage(vsCodeLang);
        // Load strings from locale files
        this.loadStrings('en'); // Always load English as fallback
        if (this.language !== 'en') {
            this.loadStrings(this.language);
        }
    }
    /**
     * Loads string resources from the locale file
     */
    loadStrings(lang) {
        try {
            const localeFile = path.join(this.context.extensionPath, 'locales', `${lang}.json`);
            if (fs.existsSync(localeFile)) {
                const content = fs.readFileSync(localeFile, 'utf8');
                const strings = JSON.parse(content);
                this.strings.set(lang, strings);
            }
        }
        catch (error) {
            console.error(`Failed to load strings for language ${lang}:`, error);
        }
    }
    /**
     * Gets a localized string by key
     * @param key The key of the string to get
     * @param defaultValue Default value if the key is not found
     * @param params Optional parameters to format the string
     * @returns The localized string
     */
    getString(key, defaultValue, params) {
        let value = defaultValue;
        // Try to find the string in the current language
        const strings = this.strings.get(this.language);
        if (strings && strings[key]) {
            value = strings[key];
        }
        else {
            // Fall back to English
            const englishStrings = this.strings.get('en');
            if (englishStrings && englishStrings[key]) {
                value = englishStrings[key];
            }
        }
        // Replace parameters if any
        if (params) {
            for (const [param, replacement] of Object.entries(params)) {
                value = value.replace(`{${param}}`, replacement);
            }
        }
        return value;
    }
    /**
     * Gets the current language
     * @returns The current language code
     */
    getCurrentLanguage() {
        return this.language;
    }
    /**
     * Sets the current language
     * @param language The language to set
     */
    setLanguage(language) {
        if (this.language !== language) {
            this.language = language;
            this.loadLanguage();
        }
    }
    /**
     * Detect the language of a text
     * @param text The text to analyze
     * @returns The detected language or null if detection failed
     */
    detectLanguage(text) {
        if (!text) {
            return null;
        }
        // Basic heuristic checks for common language patterns
        const lowerText = text.toLowerCase();
        // Check for CJK characters (Chinese, Japanese, Korean)
        if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(text)) {
            // Differentiate between Japanese, Chinese, and Korean
            if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
                return 'ja'; // Japanese-specific kana
            }
            if (/[\uac00-\ud7af]/.test(text)) {
                return 'ko'; // Korean Hangul
            }
            return 'zh'; // Assume Chinese for other CJK
        }
        // Check for Arabic script
        if (/[\u0600-\u06ff]/.test(text)) {
            return 'ar';
        }
        // Check for Cyrillic (Russian/Ukrainian)
        if (/[\u0400-\u04ff]/.test(text)) {
            // Unique Ukrainian characters
            if (/[\u0404\u0406\u0407\u0454\u0456\u0457\u0490\u0491]/.test(text)) {
                return 'uk';
            }
            return 'ru';
        }
        // Check for Greek
        if (/[\u0370-\u03ff]/.test(text)) {
            return 'el';
        }
        // Check for Thai
        if (/[\u0e00-\u0e7f]/.test(text)) {
            return 'th';
        }
        // Simple checks for European languages based on common character combinations
        if (lowerText.match(/[ñáéíóúü]/)) {
            return 'es'; // Spanish
        }
        if (lowerText.match(/[àâçéèêëîïôûùüÿœæ]/)) {
            return 'fr'; // French
        }
        if (lowerText.match(/[äöüß]/)) {
            return 'de'; // German
        }
        // Default to English if no specific patterns are found
        return 'en';
    }
    /**
     * Normalizes a language code to a supported language
     * @param langCode A language code (e.g., "en-US")
     * @returns A supported language code
     */
    normalizeLanguage(langCode) {
        // Extract the base language code (e.g., "en" from "en-US")
        const baseLang = langCode.split('-')[0].toLowerCase();
        // Check if it's a supported language
        const supportedLanguages = [
            'en', 'es', 'de', 'fr', 'it', 'pt', 'ja',
            'ko', 'zh', 'ru', 'ar', 'tr', 'pl', 'nl',
            'sv', 'no', 'fi', 'da', 'cs', 'uk', 'hu',
            'th', 'el'
        ];
        if (supportedLanguages.includes(baseLang)) {
            return baseLang;
        }
        // Fall back to English
        return 'en';
    }
}
exports.LocalizationService = LocalizationService;
//# sourceMappingURL=localization.js.map