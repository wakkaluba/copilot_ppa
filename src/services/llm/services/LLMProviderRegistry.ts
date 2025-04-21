import { EventEmitter } from 'events';
import {
    LLMProvider,
    ProviderInfo,
    ProviderConfig,
    ProviderEvent,
    ProviderError
} from '../types';

export class LLMProviderRegistry extends EventEmitter {
    private readonly providers = new Map<string, LLMProvider>();
    private readonly configs = new Map<string, ProviderConfig>();
    private readonly providerInfo = new Map<string, ProviderInfo>();

    /**
     * Register a new provider
     */
    public async registerProvider(
        provider: LLMProvider,
        config: ProviderConfig
    ): Promise<void> {
        if (this.providers.has(provider.id)) {
            throw new ProviderError(
                'Provider already registered',
                provider.id
            );
        }

        try {
            // Get and store provider info
            const capabilities = await provider.getCapabilities();
            const info: ProviderInfo = {
                id: provider.id,
                name: provider.constructor.name,
                version: '1.0.0', // Should come from provider
                capabilities
            };

            // Store provider, config and info
            this.providers.set(provider.id, provider);
            this.configs.set(provider.id, config);
            this.providerInfo.set(provider.id, info);

            this.emit(ProviderEvent.Registered, { providerId: provider.id });

        } catch (error) {
            throw new ProviderError(
                'Failed to register provider',
                provider.id,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Unregister a provider
     */
    public async unregisterProvider(providerId: string): Promise<void> {
        if (!this.providers.has(providerId)) {
            throw new ProviderError('Provider not found', providerId);
        }

        this.providers.delete(providerId);
        this.configs.delete(providerId);
        this.providerInfo.delete(providerId);

        this.emit(ProviderEvent.Unregistered, { providerId });
    }

    /**
     * Get a provider by ID
     */
    public getProvider(providerId: string): LLMProvider | undefined {
        return this.providers.get(providerId);
    }

    /**
     * Get provider configuration
     */
    public getProviderConfig(providerId: string): ProviderConfig | undefined {
        return this.configs.get(providerId);
    }

    /**
     * Get provider information
     */
    public getProviderInfo(providerId: string): ProviderInfo | null {
        return this.providerInfo.get(providerId) || null;
    }

    /**
     * List all registered providers
     */
    public getRegisteredProviders(): string[] {
        return Array.from(this.providers.keys());
    }

    /**
     * Update provider configuration
     */
    public async updateProviderConfig(
        providerId: string,
        config: Partial<ProviderConfig>
    ): Promise<void> {
        const existingConfig = this.configs.get(providerId);
        if (!existingConfig) {
            throw new ProviderError('Provider not found', providerId);
        }

        // Merge configs
        this.configs.set(providerId, {
            ...existingConfig,
            ...config
        });
    }

    /**
     * Check if a provider is registered
     */
    public hasProvider(providerId: string): boolean {
        return this.providers.has(providerId);
    }

    public dispose(): void {
        this.providers.clear();
        this.configs.clear();
        this.providerInfo.clear();
        this.removeAllListeners();
    }
}