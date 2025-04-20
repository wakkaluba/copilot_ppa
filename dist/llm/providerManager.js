"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderManager = void 0;
const i18n_1 = require("../i18n");
const multilingualPromptManager_1 = require("./multilingualPromptManager");
/**
 * Manages LLM providers and connections
 */
class LLMProviderManager {
    currentProvider = null;
    multilingualManager;
    constructor(context) {
        this.multilingualManager = new multilingualPromptManager_1.MultilingualPromptManager();
    }
    /**
     * Sends a prompt to the current LLM provider with language support
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @param targetLanguage Target language for the response, defaults to UI language
     * @returns Promise that resolves with the LLM response
     */
    async sendPromptWithLanguage(prompt, options, targetLanguage) {
        if (!this.currentProvider) {
            throw new Error('No LLM provider is currently connected');
        }
        // Use UI language if no target language specified
        const language = targetLanguage || (0, i18n_1.getCurrentLanguage)();
        // Enhance prompt with language directives
        const enhancedPrompt = this.multilingualManager.enhancePromptWithLanguage(prompt, language, options);
        // Send to LLM
        let response = await this.currentProvider.sendPrompt(enhancedPrompt, options);
        // Check if response is in expected language
        if (!this.multilingualManager.isResponseInExpectedLanguage(response, language)) {
            // Request translation
            const correctionPrompt = this.multilingualManager.buildLanguageCorrectionPrompt(prompt, response, language);
            // Send correction prompt
            response = await this.currentProvider.sendPrompt(correctionPrompt, options);
        }
        return response;
    }
    getCurrentProvider() {
        const provider = this.providers[this.currentProvider];
        if (!provider) {
            throw new Error('No LLM provider is currently active');
        }
        return provider;
    }
    getCurrentModelId() {
        const provider = this.getCurrentProvider();
        return provider.getModelId();
    }
    // Fix the sendPrompt methods to use the proper method from the provider
    async sendPrompt(prompt, options) {
        return this.getCurrentProvider().sendPrompt(prompt, options);
    }
    async sendStreamingPrompt(prompt, callback, options) {
        const provider = this.getCurrentProvider();
        return provider.sendPrompt(prompt, options);
    }
}
exports.LLMProviderManager = LLMProviderManager;
//# sourceMappingURL=providerManager.js.map