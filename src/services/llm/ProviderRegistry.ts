import { EventEmitter } from 'events';
import { ProviderStatus, ProviderCapabilities } from './interfaces';
import { LLMConnectionError } from './errors';

/**
 * Provider registration information
 */
interface ProviderInfo {
    id: string;
    name: string;
    version: string;
    capabilities: ProviderCapabilities;
    status: ProviderStatus;
    priority: number;
    metadata: Record<string, unknown>;
}

/**
 * Provider registration options
 */
interface ProviderRegistrationOptions {
    name: string;
    version: string;
    capabilities: ProviderCapabilities;
    priority?: number;
    metadata?: Record<string, unknown>;
}

/**
 * Manages LLM provider registration and discovery
 */
export class ProviderRegistry extends EventEmitter {
    private static instance: ProviderRegistry;
    private providers: Map<string, ProviderInfo> = new Map();
    private priorityQueue: string[] = [];

    private constructor() {
        super();
    }

    public static getInstance(): ProviderRegistry {
        if (!this.instance) {
            this.instance = new ProviderRegistry();
        }
        return this.instance;
    }

    /**
     * Register a new provider
     */
    public registerProvider(
        providerId: string,
        options: ProviderRegistrationOptions
    ): void {
        if (this.providers.has(providerId)) {
            throw new LLMConnectionError(
                'PROVIDER_ERROR',
                `Provider ${providerId} is already registered`
            );
        }

        const providerInfo: ProviderInfo = {
            id: providerId,
            name: options.name,
            version: options.version,
            capabilities: options.capabilities,
            status: ProviderStatus.UNKNOWN,
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
    public updateProviderStatus(providerId: string, status: ProviderStatus): void {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new LLMConnectionError(
                'PROVIDER_ERROR',
                `Provider ${providerId} is not registered`
            );
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
    public getProviderInfo(providerId: string): ProviderInfo | undefined {
        const provider = this.providers.get(providerId);
        return provider ? { ...provider } : undefined;
    }

    /**
     * Get all registered providers
     */
    public getAllProviders(): ProviderInfo[] {
        return Array.from(this.providers.values()).map(p => ({ ...p }));
    }

    /**
     * Get providers with specific capabilities
     */
    public getProvidersWithCapability(capability: keyof ProviderCapabilities): ProviderInfo[] {
        return Array.from(this.providers.values())
            .filter(p => p.capabilities[capability])
            .map(p => ({ ...p }));
    }

    /**
     * Get next available provider by priority
     */
    public getNextAvailableProvider(): ProviderInfo | undefined {
        for (const providerId of this.priorityQueue) {
            const provider = this.providers.get(providerId);
            if (provider && provider.status === ProviderStatus.HEALTHY) {
                return { ...provider };
            }
        }
        return undefined;
    }

    /**
     * Update provider priority
     */
    public updateProviderPriority(providerId: string, priority: number): void {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new LLMConnectionError(
                'PROVIDER_ERROR',
                `Provider ${providerId} is not registered`
            );
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
    public updateProviderMetadata(
        providerId: string,
        metadata: Record<string, unknown>
    ): void {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new LLMConnectionError(
                'PROVIDER_ERROR',
                `Provider ${providerId} is not registered`
            );
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
    public updateProviderCapabilities(
        providerId: string,
        capabilities: Partial<ProviderCapabilities>
    ): void {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new LLMConnectionError(
                'PROVIDER_ERROR',
                `Provider ${providerId} is not registered`
            );
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
    public unregisterProvider(providerId: string): void {
        if (!this.providers.has(providerId)) {
            throw new LLMConnectionError(
                'PROVIDER_ERROR',
                `Provider ${providerId} is not registered`
            );
        }

        const provider = this.providers.get(providerId)!;
        this.providers.delete(providerId);
        this.updatePriorityQueue();

        this.emit('providerUnregistered', {
            providerId,
            info: { ...provider }
        });
    }

    private updatePriorityQueue(): void {
        this.priorityQueue = Array.from(this.providers.keys())
            .sort((a, b) => {
                const providerA = this.providers.get(a)!;
                const providerB = this.providers.get(b)!;
                return providerB.priority - providerA.priority;
            });
    }

    public dispose(): void {
        this.providers.clear();
        this.priorityQueue = [];
        this.removeAllListeners();
    }
}