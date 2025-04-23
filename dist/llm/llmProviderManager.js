"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderManager = void 0;
const events_1 = require("events");
const llm_1 = require("../types/llm");
const LLMConnectionManager_1 = require("../services/llm/LLMConnectionManager");
const llm_provider_1 = require("./llm-provider");
const multilingualPromptManager_1 = require("./multilingualPromptManager");
const i18n_1 = require("../i18n");
/**
 * Manages LLM providers and their lifecycle, integrated with the connection management system
 */
class LLMProviderManager extends events_1.EventEmitter {
    static instance;
    providers = new Map();
    connectionManager;
    multilingualManager;
    activeProvider = null;
    constructor() {
        super();
        this.connectionManager = LLMConnectionManager_1.LLMConnectionManager.getInstance();
        this.multilingualManager = new multilingualPromptManager_1.MultilingualPromptManager();
        this.connectionManager.on('stateChanged', this.handleConnectionStateChange.bind(this));
        this.connectionManager.on('hostStateChanged', this.handleHostStateChange.bind(this));
    }
    static getInstance() {
        if (!LLMProviderManager.instance) {
            LLMProviderManager.instance = new LLMProviderManager();
        }
        return LLMProviderManager.instance;
    }
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
        this.connectionManager.registerProvider(provider.name, provider);
        provider.on('stateChanged', (status) => {
            this.emit('providerStateChanged', {
                provider: provider.name,
                status
            });
        });
    }
    async setActiveProvider(name) {
        if (!this.providers.has(name)) {
            throw new llm_provider_1.LLMProviderError('PROVIDER_NOT_FOUND', `Provider ${name} not found`);
        }
        await this.connectionManager.setActiveProvider(name);
        this.activeProvider = name;
        this.emit('activeProviderChanged', name);
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    getActiveProvider() {
        return this.activeProvider ? this.providers.get(this.activeProvider) : undefined;
    }
    getProviders() {
        return new Map(this.providers);
    }
    async connect() {
        if (!this.activeProvider) {
            throw new llm_provider_1.LLMProviderError('NO_ACTIVE_PROVIDER', 'No active provider set');
        }
        return this.connectionManager.connectToLLM();
    }
    async disconnect() {
        await this.connectionManager.disconnect();
    }
    /**
     * Sends a prompt to the current LLM provider with language support
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @param targetLanguage Target language for the response, defaults to UI language
     * @returns Promise that resolves with the LLM response
     */
    async sendPromptWithLanguage(prompt, options, targetLanguage) {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new llm_provider_1.LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }
        const language = targetLanguage || (0, i18n_1.getCurrentLanguage)();
        const enhancedPrompt = this.multilingualManager.enhancePromptWithLanguage(prompt, language);
        const response = await provider.generateCompletion(provider.getStatus().activeModel || '', enhancedPrompt, undefined, options);
        if (!this.multilingualManager.isResponseInExpectedLanguage(response.content, language)) {
            const correctionPrompt = this.multilingualManager.buildLanguageCorrectionPrompt(prompt, response.content, language);
            const correctedResponse = await provider.generateCompletion(provider.getStatus().activeModel || '', correctionPrompt, undefined, options);
            return correctedResponse.content;
        }
        return response.content;
    }
    /**
     * Sends a streaming prompt to the current LLM provider
     * @param prompt The prompt to send
     * @param callback Callback function to receive streaming chunks
     * @param options Optional settings for the request
     * @returns Promise that resolves when streaming is complete
     */
    async streamPrompt(prompt, callback, options) {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new llm_provider_1.LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }
        await provider.streamCompletion(provider.getStatus().activeModel || '', prompt, undefined, options, callback);
    }
    /**
     * Sends a streaming chat prompt to the current LLM provider
     * @param messages Array of chat messages
     * @param callback Callback function to receive streaming chunks
     * @param options Optional settings for the request
     * @returns Promise that resolves when streaming is complete
     */
    async streamChat(messages, callback, options) {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new llm_provider_1.LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }
        await provider.streamChatCompletion(provider.getStatus().activeModel || '', messages, options, callback);
    }
    /**
     * Streams a prompt with language support
     * @param prompt The prompt to send
     * @param callback Callback function to receive streaming chunks
     * @param options Optional settings for the request
     * @param targetLanguage Target language for the response
     * @returns Promise that resolves when streaming is complete
     */
    async streamPromptWithLanguage(prompt, callback, options, targetLanguage) {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new llm_provider_1.LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }
        const language = targetLanguage || (0, i18n_1.getCurrentLanguage)();
        const enhancedPrompt = this.multilingualManager.enhancePromptWithLanguage(prompt, language);
        let isCorrectLanguage = true;
        let fullResponse = '';
        await provider.streamCompletion(provider.getStatus().activeModel || '', enhancedPrompt, undefined, options, (event) => {
            fullResponse += event.content;
            if (event.isComplete) {
                isCorrectLanguage = this.multilingualManager.isResponseInExpectedLanguage(fullResponse, language);
            }
            callback(event);
        });
        // If response wasn't in correct language, send correction prompt
        if (!isCorrectLanguage) {
            const correctionPrompt = this.multilingualManager.buildLanguageCorrectionPrompt(prompt, fullResponse, language);
            await provider.streamCompletion(provider.getStatus().activeModel || '', correctionPrompt, undefined, options, callback);
        }
    }
    async getAvailableModels() {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new llm_provider_1.LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }
        return provider.getAvailableModels();
    }
    async continueIteration() {
        if (!this.activeProvider) {
            throw new llm_provider_1.LLMProviderError('NO_ACTIVE_PROVIDER', 'No active provider set');
        }
        const provider = this.getActiveProvider();
        if (!provider) {
            return false;
        }
        const currentState = await this.connectionManager.getCurrentState();
        if (currentState !== llm_1.ConnectionState.CONNECTED) {
            return this.connect();
        }
        return true;
    }
    handleConnectionStateChange(state) {
        this.emit('connectionStateChanged', state);
    }
    handleHostStateChange(state) {
        this.emit('hostStateChanged', state);
    }
    dispose() {
        this.providers.clear();
        this.connectionManager.dispose();
        this.removeAllListeners();
    }
}
exports.LLMProviderManager = LLMProviderManager;
//# sourceMappingURL=llmProviderManager.js.map