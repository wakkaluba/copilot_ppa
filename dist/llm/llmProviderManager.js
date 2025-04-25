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
exports.LLMProviderManager = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class LLMProviderManager {
    providers = new Map();
    defaultProviderId;
    connectionManager;
    hostManager;
    statusService;
    disposables = [];
    eventEmitter = new events_1.EventEmitter();
    constructor(connectionManager, hostManager, statusService) {
        this.connectionManager = connectionManager;
        this.hostManager = hostManager;
        this.statusService = statusService;
        // Load available providers from configuration
        this.loadProviderSettings();
        // Listen for configuration changes
        const configDisposable = vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.models') ||
                e.affectsConfiguration('vscodeLocalLLMAgent')) {
                this.loadProviderSettings();
            }
        });
        this.disposables.push(configDisposable);
    }
    /**
     * Register a new LLM provider
     * @param id Unique provider ID
     * @param name Display name for the provider
     * @param provider Provider implementation
     * @param options Additional registration options
     * @returns True if registration was successful
     */
    registerProvider(id, name, provider, options = {}) {
        if (this.providers.has(id)) {
            return false;
        }
        const registration = {
            id,
            name,
            provider,
            isDefault: options.isDefault || false,
            priority: options.priority || 0
        };
        this.providers.set(id, registration);
        if (registration.isDefault && !this.defaultProviderId) {
            this.defaultProviderId = id;
        }
        this.eventEmitter.emit('providerRegistered', registration);
        return true;
    }
    /**
     * Unregister a provider
     * @param id Provider ID to remove
     * @returns True if the provider was removed
     */
    unregisterProvider(id) {
        if (!this.providers.has(id)) {
            return false;
        }
        const wasDefault = this.providers.get(id).isDefault;
        this.providers.delete(id);
        // If we removed the default provider, find a new one
        if (wasDefault && this.defaultProviderId === id) {
            this.defaultProviderId = this.findNewDefaultProvider();
        }
        this.eventEmitter.emit('providerUnregistered', id);
        return true;
    }
    /**
     * Get a provider by ID
     * @param id Provider ID
     * @returns The provider registration or undefined if not found
     */
    getProvider(id) {
        return this.providers.get(id);
    }
    /**
     * Get all registered providers
     * @returns Array of provider registrations
     */
    getAllProviders() {
        return Array.from(this.providers.values());
    }
    /**
     * Set a provider as the default
     * @param id Provider ID to set as default
     * @returns True if the provider was set as default
     */
    setDefaultProvider(id) {
        if (!this.providers.has(id)) {
            return false;
        }
        // Clear previous default
        if (this.defaultProviderId) {
            const prevDefault = this.providers.get(this.defaultProviderId);
            if (prevDefault) {
                prevDefault.isDefault = false;
            }
        }
        // Set new default
        const provider = this.providers.get(id);
        provider.isDefault = true;
        this.defaultProviderId = id;
        // Try to use this provider with the connection manager
        try {
            this.connectionManager.setProvider(provider.provider);
            this.statusService.updateConnectionStatus();
        }
        catch (error) {
            console.error('Failed to set provider:', error);
        }
        this.eventEmitter.emit('defaultProviderChanged', id);
        return true;
    }
    /**
     * Get the current default provider
     * @returns The default provider registration or undefined if none is set
     */
    getDefaultProvider() {
        if (!this.defaultProviderId) {
            return undefined;
        }
        return this.providers.get(this.defaultProviderId);
    }
    /**
     * Load provider settings from VS Code configuration
     */
    loadProviderSettings() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const models = config.get('models', []);
        // Load provider preferences
        const defaultProvider = config.get('defaultProvider');
        // Register configured providers
        models.forEach((model, index) => {
            // For each model configuration, we would create and register a provider
            // This is placeholder code - in a real implementation you would
            // create a provider instance based on the model settings
            // This is just for testing
            if (model.name && model.provider && !this.providers.has(model.id)) {
                this.registerProvider(model.id || `provider-${index}`, model.name, {}, // Placeholder for actual provider
                {
                    isDefault: model.id === defaultProvider,
                    priority: index
                });
            }
        });
        // If no default provider is set and we have providers, set the first one as default
        if (!this.defaultProviderId && this.providers.size > 0) {
            this.defaultProviderId = this.findNewDefaultProvider();
            const defaultReg = this.providers.get(this.defaultProviderId);
            if (defaultReg) {
                defaultReg.isDefault = true;
            }
        }
    }
    /**
     * Find a new default provider based on priority
     * @returns The ID of the new default provider or undefined if none found
     */
    findNewDefaultProvider() {
        if (this.providers.size === 0) {
            return undefined;
        }
        // Sort by priority and pick the highest
        const sortedProviders = Array.from(this.providers.values())
            .sort((a, b) => b.priority - a.priority);
        return sortedProviders[0]?.id;
    }
    /**
     * Listen for provider events
     * @param event Event name
     * @param listener Event listener function
     */
    on(event, listener) {
        this.eventEmitter.on(event, listener);
    }
    /**
     * Register a one-time listener for provider events
     * @param event Event name
     * @param listener Event listener function
     */
    once(event, listener) {
        this.eventEmitter.once(event, listener);
    }
    /**
     * Remove a listener from provider events
     * @param event Event name
     * @param listener Event listener function
     */
    off(event, listener) {
        this.eventEmitter.off(event, listener);
    }
    dispose() {
        // Dispose all disposables
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        // Remove all event listeners
        this.eventEmitter.removeAllListeners();
    }
}
exports.LLMProviderManager = LLMProviderManager;
//# sourceMappingURL=llmProviderManager.js.map