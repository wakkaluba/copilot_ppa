"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderManager = void 0;
const connectionStatusService_1 = require("../status/connectionStatusService");
const MultilingualManager_1 = require("./i18n/MultilingualManager");
class LLMProviderManager {
    constructor(connectionStatusService) {
        this._providers = new Map();
        this._activeProvider = null;
        this.connectionStatusService = connectionStatusService;
        this.multilingualManager = new MultilingualManager_1.MultilingualManager();
    }
    registerProvider(id, provider) {
        this._providers.set(id, provider);
    }
    setActiveProvider(id) {
        const provider = this._providers.get(id);
        if (provider) {
            this._activeProvider = provider;
            return true;
        }
        return false;
    }
    async connect() {
        if (!this._activeProvider) {
            throw new Error('No LLM provider is active');
        }
        try {
            await this._activeProvider.connect();
            this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Connected, {
                modelName: this._activeProvider.getActiveModel(),
                providerName: this._activeProvider.getName()
            });
            this.connectionStatusService.showNotification('Connected to LLM provider');
            return true;
        }
        catch (error) {
            this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Error, { error: error instanceof Error ? error.message : String(error) });
            this.connectionStatusService.showNotification(`Failed to connect to LLM: ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error;
        }
    }
    async disconnect() {
        if (!this._activeProvider) {
            return;
        }
        try {
            await this._activeProvider.disconnect();
            this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Disconnected);
        }
        catch (error) {
            this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Error);
            this.connectionStatusService.showNotification(`Failed to disconnect from LLM: ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error;
        }
    }
    async setActiveModel(modelId) {
        if (!this._activeProvider) {
            throw new Error('No LLM provider is active');
        }
        this._activeProvider.setActiveModel(modelId);
        this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Connected, {
            modelName: modelId,
            providerName: this._activeProvider.getName()
        });
    }
    async sendPromptWithLanguage(prompt, options, targetLanguage) {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new Error('No LLM provider is currently connected');
        }
        const language = targetLanguage || 'en';
        const enhancedPrompt = this.multilingualManager.enhancePromptWithLanguage(prompt, language);
        const response = await provider.generateCompletion(provider.getActiveModel(), enhancedPrompt, undefined, options);
        if (!this.multilingualManager.isResponseInExpectedLanguage(response.content, language)) {
            const correctionPrompt = this.multilingualManager.buildLanguageCorrectionPrompt(prompt, response.content, language);
            const correctedResponse = await provider.generateCompletion(provider.getActiveModel(), correctionPrompt, undefined, options);
            return correctedResponse.content;
        }
        return response.content;
    }
    async sendStreamingPrompt(prompt, callback) {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new Error('No LLM provider is currently connected');
        }
        await provider.streamCompletion(provider.getActiveModel(), prompt, undefined, undefined, event => callback(event.content));
    }
    getActiveProvider() {
        return this._activeProvider;
    }
    getActiveModelName() {
        return this._activeProvider?.getActiveModel() || null;
    }
    setOfflineMode(enabled) {
        const provider = this._activeProvider;
        if (provider?.setOfflineMode) {
            provider.setOfflineMode(enabled);
        }
    }
    async sendPrompt(prompt) {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new Error('No LLM provider is currently connected');
        }
        const response = await provider.generateCompletion(provider.getActiveModel(), prompt, undefined, undefined);
        if (provider.cacheResponse) {
            await provider.cacheResponse(prompt, response);
        }
        return response.content;
    }
    dispose() {
        // Clean up any resources
    }
}
exports.LLMProviderManager = LLMProviderManager;
//# sourceMappingURL=llmProviderManager.js.map