"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const OllamaProvider_1 = require("./OllamaProvider");
const errors_1 = require("../errors");
class ProviderFactory {
    static instance;
    providerConstructors = new Map();
    constructor() {
        this.registerBuiltInProviders();
    }
    static getInstance() {
        if (!ProviderFactory.instance) {
            ProviderFactory.instance = new ProviderFactory();
        }
        return ProviderFactory.instance;
    }
    registerBuiltInProviders() {
        // Register built-in providers
        this.providerConstructors.set('ollama', (config) => new OllamaProvider_1.OllamaProvider(config));
    }
    registerProvider(type, constructor) {
        if (this.providerConstructors.has(type)) {
            throw new Error(`Provider type '${type}' is already registered`);
        }
        this.providerConstructors.set(type, constructor);
    }
    async createProvider(type, config) {
        const constructor = this.providerConstructors.get(type);
        if (!constructor) {
            throw new errors_1.ConfigurationError(`Provider type '${type}' is not registered`, type, 'type');
        }
        // Create and initialize the provider
        const provider = constructor(config);
        try {
            // Initialize the provider
            await provider.connect();
            return provider;
        }
        catch (error) {
            // Clean up on initialization failure
            await provider.dispose();
            throw error;
        }
    }
    getSupportedProviderTypes() {
        return Array.from(this.providerConstructors.keys());
    }
    isProviderTypeSupported(type) {
        return this.providerConstructors.has(type);
    }
}
exports.ProviderFactory = ProviderFactory;
//# sourceMappingURL=ProviderFactory.js.map