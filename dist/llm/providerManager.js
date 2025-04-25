"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderManager = void 0;
const multilingualPromptManager_1 = require("./multilingualPromptManager");
const llmProviderManager_1 = require("./llmProviderManager");
const connectionStatusService_1 = require("../status/connectionStatusService");
/**
 * Legacy LLM Provider Manager - acts as a wrapper to the main implementation
 * @deprecated Use LLMProviderManager from llmProviderManager.ts instead
 */
class LLMProviderManager {
    mainProviderManager;
    multilingualManager;
    constructor(context) {
        this.multilingualManager = new multilingualPromptManager_1.MultilingualPromptManager();
        // Create a ConnectionStatusService stub if not provided
        const statusService = new connectionStatusService_1.ConnectionStatusService();
        this.mainProviderManager = llmProviderManager_1.LLMProviderManager.getInstance(statusService);
    }
    /**
     * Sends a prompt to the current LLM provider with language support
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @param targetLanguage Target language for the response, defaults to UI language
     * @returns Promise that resolves with the LLM response
     */
    async sendPromptWithLanguage(prompt, options, targetLanguage) {
        return this.mainProviderManager.sendPromptWithLanguage(prompt, options, targetLanguage);
    }
    getCurrentProvider() {
        const provider = this.mainProviderManager.getActiveProvider();
        if (!provider) {
            throw new Error('No LLM provider is currently active');
        }
        return provider;
    }
    getCurrentModelId() {
        const provider = this.getCurrentProvider();
        return provider.getStatus().activeModel || '';
    }
    /**
     * Sends a prompt to the current LLM provider
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @returns Promise that resolves with the LLM response
     */
    async sendPrompt(prompt, options) {
        return this.mainProviderManager.sendPrompt(prompt, options);
    }
    /**
     * Sends a streaming prompt to the current LLM provider
     * @param prompt The prompt to send
     * @param callback Callback function to receive streaming chunks
     * @param options Optional settings for the request
     * @returns Promise that resolves with the full response
     */
    async sendStreamingPrompt(prompt, callback, options) {
        return this.mainProviderManager.sendStreamingPrompt(prompt, callback, options);
    }
}
exports.LLMProviderManager = LLMProviderManager;
//# sourceMappingURL=providerManager.js.map