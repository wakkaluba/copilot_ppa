"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRegistry = void 0;
const events_1 = require("events");
const interfaces_1 = require("./interfaces");
const errors_1 = require("./errors");
/**
 * Manages LLM provider registration and discovery
 */
class ProviderRegistry extends events_1.EventEmitter {
    constructor() {
        super();
        this.providers = new Map();
        this.priorityQueue = [];
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProviderRegistry();
        }
        return this.instance;
    }
    /**
     * Register a new provider
     */
    registerProvider(providerId, options) {
        if (this.providers.has(providerId)) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', `Provider ${providerId} is already registered`);
        }
        const providerInfo = {
            id: providerId,
            name: options.name,
            version: options.version,
            capabilities: options.capabilities,
            status: interfaces_1.ProviderStatus.UNKNOWN,
            priority: options.priority || 0,
            metadata: options.metadata || {}
        };
        this.providers.set(providerId, providerInfo);
        this.updatePriorityQueue();
        this.emit('providerRegistered', { providerId, info: { ...providerInfo } });
    }
    /**
     * Update provider status
     */
    updateProviderStatus(providerId, status) {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', `Provider ${providerId} is not registered`);
        }
        provider.status = status;
        this.emit('providerStatusUpdated', {
            providerId,
            status,
            info: { ...provider }
        });
    }
    /**
     * Get provider information
     */
    getProviderInfo(providerId) {
        const provider = this.providers.get(providerId);
        return provider ? { ...provider } : undefined;
    }
    /**
     * Get all registered providers
     */
    getAllProviders() {
        return Array.from(this.providers.values()).map(p => ({ ...p }));
    }
    /**
     * Get providers with specific capabilities
     */
    getProvidersWithCapability(capability) {
        return Array.from(this.providers.values())
            .filter(p => p.capabilities[capability])
            .map(p => ({ ...p }));
    }
    /**
     * Get next available provider by priority
     */
    getNextAvailableProvider() {
        for (const providerId of this.priorityQueue) {
            const provider = this.providers.get(providerId);
            if (provider && provider.status === interfaces_1.ProviderStatus.HEALTHY) {
                return { ...provider };
            }
        }
        return undefined;
    }
    /**
     * Update provider priority
     */
    updateProviderPriority(providerId, priority) {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', `Provider ${providerId} is not registered`);
        }
        provider.priority = priority;
        this.updatePriorityQueue();
        this.emit('providerPriorityUpdated', {
            providerId,
            priority,
            info: { ...provider }
        });
    }
    /**
     * Update provider metadata
     */
    updateProviderMetadata(providerId, metadata) {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', `Provider ${providerId} is not registered`);
        }
        provider.metadata = {
            ...provider.metadata,
            ...metadata
        };
        this.emit('providerMetadataUpdated', {
            providerId,
            metadata: { ...provider.metadata },
            info: { ...provider }
        });
    }
    /**
     * Update provider capabilities
     */
    updateProviderCapabilities(providerId, capabilities) {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', `Provider ${providerId} is not registered`);
        }
        provider.capabilities = {
            ...provider.capabilities,
            ...capabilities
        };
        this.emit('providerCapabilitiesUpdated', {
            providerId,
            capabilities: { ...provider.capabilities },
            info: { ...provider }
        });
    }
    /**
     * Unregister a provider
     */
    unregisterProvider(providerId) {
        if (!this.providers.has(providerId)) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', `Provider ${providerId} is not registered`);
        }
        const provider = this.providers.get(providerId);
        this.providers.delete(providerId);
        this.updatePriorityQueue();
        this.emit('providerUnregistered', {
            providerId,
            info: { ...provider }
        });
    }
    updatePriorityQueue() {
        this.priorityQueue = Array.from(this.providers.keys())
            .sort((a, b) => {
            const providerA = this.providers.get(a);
            const providerB = this.providers.get(b);
            return providerB.priority - providerA.priority;
        });
    }
    dispose() {
        this.providers.clear();
        this.priorityQueue = [];
        this.removeAllListeners();
    }
}
exports.ProviderRegistry = ProviderRegistry;
//# sourceMappingURL=ProviderRegistry.js.map