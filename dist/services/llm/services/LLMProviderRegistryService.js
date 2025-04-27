"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderRegistryService = void 0;
const events_1 = require("events");
class LLMProviderRegistryService extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.providers = new Map();
        this.descriptors = new Map();
    }
    registerProvider(name, provider) {
        this.providers.set(name, provider);
        provider.on('statusChanged', (status) => {
            this.emit('providerStatusChanged', { name, status });
        });
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    async configureProvider(name, options) {
        const provider = this.getProvider(name);
        if (!provider) {
            throw new Error(`Provider ${name} not found`);
        }
        if (options) {
            await provider.configure(options);
        }
        return provider;
    }
    getProviders() {
        return this.providers;
    }
    registerDescriptor(descriptor) {
        this.descriptors.set(descriptor.name, descriptor);
    }
    getDescriptor(name) {
        return this.descriptors.get(name);
    }
    getAllDescriptors() {
        return Array.from(this.descriptors.values());
    }
}
exports.LLMProviderRegistryService = LLMProviderRegistryService;
//# sourceMappingURL=LLMProviderRegistryService.js.map