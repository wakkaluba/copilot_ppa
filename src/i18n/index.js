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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeLocalization = initializeLocalization;
exports.localize = localize;
exports.getCurrentLanguage = getCurrentLanguage;
exports.detectLanguage = detectLanguage;
var localization_1 = require("./localization");
// Export types and classes
__exportStar(require("./localization"), exports);
// Global instance of the localization service
var localizationService = null;
/**
 * Initialize the localization module
 * @param context The extension context
 * @returns The localization service instance
 */
function initializeLocalization(context) {
    if (!localizationService) {
        localizationService = new localization_1.LocalizationService(context);
    }
    return localizationService;
}
/**
 * Get localized string by key
 * @param key The key of the string to get
 * @param defaultValue Default value if the key is not found
 * @param params Optional parameters to format the string
 * @returns The localized string
 */
function localize(key, defaultValue, params) {
    if (!localizationService) {
        return defaultValue;
    }
    return localizationService.getString(key, defaultValue, params);
}
/**
 * Gets the current UI language
 * @returns Current language code
 */
function getCurrentLanguage() {
    // In a real implementation, this would get the language from VSCode settings
    // or from the user's OS settings
    return 'en';
}
/**
 * Detect language of text
 * @param text Text to analyze
 * @returns Detected language or null
 */
function detectLanguage(text) {
    if (!localizationService) {
        return null;
    }
    return localizationService.detectLanguage(text);
}
