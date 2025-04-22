import { LLMProvider, ProviderConfig } from '../types';
import { OllamaProvider } from './OllamaProvider';
import { ConfigurationError } from '../errors';

export type ProviderType = 'ollama' | 'llamaapi' | 'lmstudio';

export class ProviderFactory {
    private static instance: ProviderFactory;
    private providerConstructors = new Map<ProviderType, (config: ProviderConfig) => LLMProvider>();

    private constructor() {
        this.registerBuiltInProviders();
    }

    public static getInstance(): ProviderFactory {
        if (!ProviderFactory.instance) {
            ProviderFactory.instance = new ProviderFactory();
        }
        return ProviderFactory.instance;
    }

    private registerBuiltInProviders(): void {
        // Register built-in providers
        this.providerConstructors.set('ollama', (config) => new OllamaProvider(config));
    }

    public registerProvider(
        type: ProviderType,
        constructor: (config: ProviderConfig) => LLMProvider
    ): void {
        if (this.providerConstructors.has(type)) {
            throw new Error(`Provider type '${type}' is already registered`);
        }
        this.providerConstructors.set(type, constructor);
    }

    public async createProvider(
        type: ProviderType,
        config: ProviderConfig
    ): Promise<LLMProvider> {
        const constructor = this.providerConstructors.get(type);
        if (!constructor) {
            throw new ConfigurationError(
                `Provider type '${type}' is not registered`,
                type,
                'type'
            );
        }

        // Create and initialize the provider
        const provider = constructor(config);
        
        try {
            // Initialize the provider
            await provider.connect();
            return provider;
        } catch (error) {
            // Clean up on initialization failure
            await provider.dispose();
            throw error;
        }
    }

    public getSupportedProviderTypes(): ProviderType[] {
        return Array.from(this.providerConstructors.keys());
    }

    public isProviderTypeSupported(type: ProviderType): boolean {
        return this.providerConstructors.has(type);
    }
}