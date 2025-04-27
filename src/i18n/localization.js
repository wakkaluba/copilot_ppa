"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationService = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
/**
 * Service for handling localization and language-related functions
 */
var LocalizationService = /** @class */ (function () {
    function LocalizationService(context) {
        this.context = context;
        this.strings = new Map();
        this.language = 'en';
        this.loadLanguage();
    }
    /**
     * Loads the current language settings and string resources
     */
    LocalizationService.prototype.loadLanguage = function () {
        // Get language from VS Code or fall back to English
        var vsCodeLang = vscode.env.language;
        this.language = this.normalizeLanguage(vsCodeLang);
        // Load strings from locale files
        this.loadStrings('en'); // Always load English as fallback
        if (this.language !== 'en') {
            this.loadStrings(this.language);
        }
    };
    /**
     * Loads string resources from the locale file
     */
    LocalizationService.prototype.loadStrings = function (lang) {
        try {
            var localeFile = path.join(this.context.extensionPath, 'locales', "".concat(lang, ".json"));
            if (fs.existsSync(localeFile)) {
                var content = fs.readFileSync(localeFile, 'utf8');
                var strings = JSON.parse(content);
                this.strings.set(lang, strings);
            }
        }
        catch (error) {
            console.error("Failed to load strings for language ".concat(lang, ":"), error);
        }
    };
    /**
     * Gets a localized string by key
     * @param key The key of the string to get
     * @param defaultValue Default value if the key is not found
     * @param params Optional parameters to format the string
     * @returns The localized string
     */
    LocalizationService.prototype.getString = function (key, defaultValue, params) {
        var value = defaultValue;
        // Try to find the string in the current language
        var strings = this.strings.get(this.language);
        if (strings && strings[key]) {
            value = strings[key];
        }
        else {
            // Fall back to English
            var englishStrings = this.strings.get('en');
            if (englishStrings && englishStrings[key]) {
                value = englishStrings[key];
            }
        }
        // Replace parameters if any
        if (params) {
            for (var _i = 0, _a = Object.entries(params); _i < _a.length; _i++) {
                var _b = _a[_i], param = _b[0], replacement = _b[1];
                value = value.replace("{".concat(param, "}"), replacement);
            }
        }
        return value;
    };
    /**
     * Gets the current language
     * @returns The current language code
     */
    LocalizationService.prototype.getCurrentLanguage = function () {
        return this.language;
    };
    /**
     * Sets the current language
     * @param language The language to set
     */
    LocalizationService.prototype.setLanguage = function (language) {
        if (this.language !== language) {
            this.language = language;
            this.loadLanguage();
        }
    };
    /**
     * Detect the language of a text
     * @param text The text to analyze
     * @returns The detected language or null if detection failed
     */
    LocalizationService.prototype.detectLanguage = function (text) {
        // This is a simple mock implementation
        // In a real app, you would use a proper language detection library
        // For now, we'll assume English
        return 'en';
    };
    /**
     * Normalizes a language code to a supported language
     * @param langCode A language code (e.g., "en-US")
     * @returns A supported language code
     */
    LocalizationService.prototype.normalizeLanguage = function (langCode) {
        // Extract the base language code (e.g., "en" from "en-US")
        var baseLang = langCode.split('-')[0].toLowerCase();
        // Check if it's a supported language
        var supportedLanguages = [
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
    };
    return LocalizationService;
}());
exports.LocalizationService = LocalizationService;
