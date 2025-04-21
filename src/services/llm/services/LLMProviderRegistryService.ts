import { EventEmitter } from 'events';
import { LLMProvider } from '../../../llm/llm-provider';
import { ProviderDescriptor } from '../types';

export class LLMProviderRegistryService extends EventEmitter {
    private providers = new Map<string, LLMProvider>();
    private descriptors = new Map<string, ProviderDescriptor>();

    public registerProvider(name: string, provider: LLMProvider): void {
        this.providers.set(name, provider);
        provider.on('statusChanged', (status) => {
            this.emit('providerStatusChanged', { name, status });
        });
    }

    public getProvider(name: string): LLMProvider | undefined {
        return this.providers.get(name);
    }

    public async configureProvider(name: string, options?: Record<string, unknown>): Promise<LLMProvider> {
        const provider = this.getProvider(name);
        if (!provider) {
            throw new Error(`Provider ${name} not found`);
        }

        if (options) {
            await provider.configure(options);
        }

        return provider;
    }

    public getProviders(): Map<string, LLMProvider> {
        return this.providers;
    }

    public registerDescriptor(descriptor: ProviderDescriptor): void {
        this.descriptors.set(descriptor.name, descriptor);
    }

    public getDescriptor(name: string): ProviderDescriptor | undefined {
        return this.descriptors.get(name);
    }

    public getAllDescriptors(): ProviderDescriptor[] {
        return Array.from(this.descriptors.values());
    }
}