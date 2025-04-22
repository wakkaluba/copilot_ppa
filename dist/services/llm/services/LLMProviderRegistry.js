"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderRegistry = void 0;
const events_1 = require("events");
const types_1 = require("../types");
class LLMProviderRegistry extends events_1.EventEmitter {
    providers = new Map();
    priorityQueue = [];
    static instance;
    constructor() {
        super();
    }
    static getInstance() {
        if (!LLMProviderRegistry.instance) {
            LLMProviderRegistry.instance = new LLMProviderRegistry();
        }
        return LLMProviderRegistry.instance;
    }
    async registerProvider(provider, config) {
        if (this.providers.has(provider.id)) {
            throw new types_1.ProviderError('Provider already registered', provider.id);
        }
        // Register the provider
        this.providers.set(provider.id, {
            provider,
            config,
            state: types_1.ProviderState.Registered,
            registeredAt: Date.now()
        });
        // Add to priority queue
        this.priorityQueue.push(provider.id);
        this.sortPriorityQueue();
        this.emit(types_1.ProviderEvent.Registered, {
            providerId: provider.id,
            timestamp: Date.now()
        });
    }
    async unregisterProvider(providerId) {
        const registration = this.providers.get(providerId);
        if (!registration) {
            throw new types_1.ProviderError('Provider not found', providerId);
        }
        // Remove from collections
        this.providers.delete(providerId);
        this.priorityQueue = this.priorityQueue.filter(id => id !== providerId);
        this.emit(types_1.ProviderEvent.Unregistered, {
            providerId,
            timestamp: Date.now()
        });
    }
    getProvider(providerId) {
        return this.providers.get(providerId)?.provider;
    }
    getProviderConfig(providerId) {
        return this.providers.get(providerId)?.config;
    }
    getAllProviders() {
        return Array.from(this.providers.entries()).map(([id, reg]) => ({
            id,
            provider: reg.provider
        }));
    }
    getNextAvailableProvider() {
        for (const providerId of this.priorityQueue) {
            const registration = this.providers.get(providerId);
            if (registration?.state === types_1.ProviderState.Active) {
                return registration.provider;
            }
        }
        return undefined;
    }
    updateProviderState(providerId, state) {
        const registration = this.providers.get(providerId);
        if (!registration) {
            throw new types_1.ProviderError('Provider not found', providerId);
        }
        registration.state = state;
        this.emit(types_1.ProviderEvent.StateChanged, {
            providerId,
            state,
            timestamp: Date.now()
        });
    }
    sortPriorityQueue() {
        // Sort by registration time for now, could be enhanced with more sophisticated priority logic
        this.priorityQueue.sort((a, b) => {
            const regA = this.providers.get(a);
            const regB = this.providers.get(b);
            if (!regA || !regB)
                return 0;
            return regA.registeredAt - regB.registeredAt;
        });
    }
    dispose() {
        this.providers.clear();
        this.priorityQueue = [];
        this.removeAllListeners();
    }
}
exports.LLMProviderRegistry = LLMProviderRegistry;
//# sourceMappingURL=LLMProviderRegistry.js.map