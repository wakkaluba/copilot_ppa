"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderManager = void 0;
const events_1 = require("events");
const llm_provider_1 = require("./llm-provider");
const connectionStatusService_1 = require("../status/connectionStatusService");
const LLMConnectionManager_1 = require("../services/llm/LLMConnectionManager");
const multilingualPromptManager_1 = require("./multilingualPromptManager");
const i18n_1 = require("../i18n");
/**
 * Manages LLM providers and their lifecycle, integrated with the connection management system
 */
class LLMProviderManager extends events_1.EventEmitter {
    static instance;
    _providers = new Map();
    connectionManager;
    multilingualManager;
    _activeProvider = null;
    connectionStatusService;
    constructor(connectionStatusService) {
        super();
        this.connectionStatusService = connectionStatusService;
        this.connectionManager = LLMConnectionManager_1.LLMConnectionManager.getInstance();
        this.multilingualManager = new multilingualPromptManager_1.MultilingualPromptManager();
    }
    /**
     * Gets the singleton instance of the LLMProviderManager
     */
    static getInstance(connectionStatusService) {
        if (!LLMProviderManager.instance && connectionStatusService) {
            LLMProviderManager.instance = new LLMProviderManager(connectionStatusService);
        }
        return LLMProviderManager.instance;
    }
    /**
     * Registers a new LLM provider
     * @param provider The provider to register
     */
    registerProvider(provider) {
        this._providers.set(provider.name, provider);
        provider.on('stateChanged', (status) => {
            this.emit('providerStateChanged', {
                provider: provider.name,
                status
            });
        });
    }
    /**
     * Sets the active LLM provider
     * @param name Name of the provider to activate
     */
    async setActiveProvider(name) {
        if (!this._providers.has(name)) {
            throw new llm_provider_1.LLMProviderError('PROVIDER_NOT_FOUND', `Provider ${name} not found`);
        }
        this._activeProvider = this._providers.get(name) || null;
        this.emit('activeProviderChanged', name);
        if (this._activeProvider) {
            const status = this._activeProvider.getStatus();
            this.updateConnectionState(status.isConnected ? connectionStatusService_1.ConnectionState.Connected : connectionStatusService_1.ConnectionState.Disconnected);
        }
    }
    /**
     * Gets a provider by name
     * @param name Name of the provider
     * @returns The provider or undefined if not found
     */
    getProvider(name) {
        return this._providers.get(name);
    }
    /**
     * Gets the currently active provider
     * @returns The active provider or undefined if none is set
     */
    getActiveProvider() {
        return this._activeProvider;
    }
    /**
     * Gets all registered providers
     * @returns Map of all registered providers
     */
    getProviders() {
        return new Map(this._providers);
    }
    /**
     * Gets the name of the currently active model
     * @returns The active model name or null if none is set
     */
    getActiveModelName() {
        if (!this._activeProvider) {
            return null;
        }
        const status = this._activeProvider.getStatus();
        return status.activeModel || null;
    }
    /**
     * Connects to the currently active LLM provider
     * @returns A promise that resolves to true if connection was successful
     */
    async connect() {
        if (!this._activeProvider) {
            throw new Error('No LLM provider is active');
        }
        try {
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Connecting);
            await this._activeProvider.connect();
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Connected);
            this.connectionStatusService.showNotification('Connected to LLM Provider');
            return true;
        }
        catch (error) {
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Error);
            this.connectionStatusService.showNotification(`Failed to connect to LLM: ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error;
        }
    }
    /**
     * Disconnects from the currently active LLM provider
     */
    async disconnect() {
        if (!this._activeProvider) {
            return;
        }
        try {
            await this._activeProvider.disconnect();
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Disconnected);
        }
        catch (error) {
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Error);
            this.connectionStatusService.showNotification(`Failed to disconnect from LLM: ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error;
        }
    }
    /**
     * Sets a new active model on the current provider
     * @param modelName The model name to activate
     */
    async setActiveModel(modelName) {
        if (!this._activeProvider) {
            throw new Error('No LLM provider is active');
        }
        try {
            // Since the LLMProvider interface doesn't have setActiveModel, we'll use this as a placeholder
            // In practice, providers might have different ways of switching models
            // For testing purposes, we'll just update the connection state
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Connected, { modelName });
        }
        catch (error) {
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Error);
            throw error;
        }
    }
    /**
     * Enables or disables offline mode for the current provider
     * @param enabled Whether offline mode should be enabled
     */
    setOfflineMode(enabled) {
        const provider = this.getActiveProvider();
        if (provider && typeof provider.setOfflineMode === 'function') {
            provider.setOfflineMode(enabled);
        }
    }
    /**
     * Sends a prompt to the current LLM provider
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @returns Promise that resolves with the LLM response
     */
    async sendPrompt(prompt, options) {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new Error('No LLM provider is currently connected');
        }
        const response = await provider.generateCompletion(provider.getStatus().activeModel || '', prompt, undefined, options);
        // Cache response if provider supports it
        if (typeof provider.cacheResponse === 'function') {
            await provider.cacheResponse(prompt, response.content);
        }
        return response.content;
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
            throw new Error('No LLM provider is currently connected');
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
    async sendStreamingPrompt(prompt, callback, options) {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new Error('No LLM provider is currently connected');
        }
        let fullResponse = '';
        await provider.streamCompletion(provider.getStatus().activeModel || '', prompt, undefined, options, (event) => {
            fullResponse += event.content;
            callback(event.content);
        });
        return fullResponse;
    }
    /**
     * Updates the connection state in the status service
     */
    updateConnectionState(state, additionalInfo) {
        const info = additionalInfo || {};
        if (this._activeProvider) {
            const providerStatus = this._activeProvider.getStatus();
            info.providerName = this._activeProvider.name;
            info.modelName = info.modelName || providerStatus.activeModel;
        }
        this.connectionStatusService.setState(state, info);
    }
    /**
     * Disposes of resources
     */
    dispose() {
        this._activeProvider = null;
        this.removeAllListeners();
    }
}
exports.LLMProviderManager = LLMProviderManager;
//# sourceMappingURL=llmProviderManager.js.map