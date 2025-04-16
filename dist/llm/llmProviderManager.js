"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderManager = void 0;
const connectionStatusService_1 = require("../status/connectionStatusService");
class LLMProviderManager {
    constructor(connectionStatusService) {
        this._providers = new Map();
        this._activeProvider = null;
        this._connectionStatusService = connectionStatusService;
        // Initialize providers and settings
    }
    async connect() {
        try {
            const provider = this.getActiveProvider();
            if (!provider) {
                throw new Error('No LLM provider is active');
            }
            this._connectionStatusService.setState(connectionStatusService_1.ConnectionState.Connecting, {
                modelName: this.getActiveModelName() || '',
                providerName: provider.getProviderType()
            });
            await provider.connect();
            this._connectionStatusService.setState(connectionStatusService_1.ConnectionState.Connected, {
                modelName: this.getActiveModelName() || '',
                providerName: provider.getProviderType()
            });
            this._connectionStatusService.showNotification(`Connected to ${provider.getProviderType()} with model ${this.getActiveModelName()}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this._connectionStatusService.setState(connectionStatusService_1.ConnectionState.Error, { providerName: this.getActiveProvider()?.getProviderType() || '' });
            this._connectionStatusService.showNotification(`Failed to connect to LLM: ${errorMessage}`, 'error');
            throw error;
        }
    }
    async disconnect() {
        try {
            const provider = this.getActiveProvider();
            if (!provider) {
                return;
            }
            await provider.disconnect();
            this._connectionStatusService.setState(connectionStatusService_1.ConnectionState.Disconnected, {
                providerName: provider.getProviderType()
            });
            this._connectionStatusService.showNotification(`Disconnected from ${provider.getProviderType()}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this._connectionStatusService.setState(connectionStatusService_1.ConnectionState.Error);
            this._connectionStatusService.showNotification(`Failed to disconnect from LLM: ${errorMessage}`, 'error');
            throw error;
        }
    }
    async setActiveModel(modelName) {
        // ...existing code...
        // After setting model:
        const provider = this.getActiveProvider();
        if (provider) {
            this._connectionStatusService.setState(provider.isConnected() ? connectionStatusService_1.ConnectionState.Connected : connectionStatusService_1.ConnectionState.Disconnected, {
                modelName: modelName,
                providerName: provider.getProviderType()
            });
        }
    }
    getActiveProvider() {
        return this._activeProvider;
    }
    getActiveModelName() {
        return this._activeProvider ? this._activeProvider.getModelName() : null;
    }
    dispose() {
        // Dispose resources
    }
}
exports.LLMProviderManager = LLMProviderManager;
//# sourceMappingURL=llmProviderManager.js.map