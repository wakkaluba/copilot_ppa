import { EventEmitter } from 'events';
import {
    LLMProvider,
    ProviderConfig,
    ProviderEvent,
    ProviderError,
    ProviderState
} from '../types';

interface RegisteredProvider {
    provider: LLMProvider;
    config: ProviderConfig;
    state: ProviderState;
    registeredAt: number;
}

export class LLMProviderRegistry extends EventEmitter {
    private providers = new Map<string, RegisteredProvider>();
    private priorityQueue: string[] = [];
    private static instance: LLMProviderRegistry;

    private constructor() {
        super();
    }

    public static getInstance(): LLMProviderRegistry {
        if (!LLMProviderRegistry.instance) {
            LLMProviderRegistry.instance = new LLMProviderRegistry();
        }
        return LLMProviderRegistry.instance;
    }

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

        // Register the provider
        this.providers.set(provider.id, {
            provider,
            config,
            state: ProviderState.Registered,
            registeredAt: Date.now()
        });

        // Add to priority queue
        this.priorityQueue.push(provider.id);
        this.sortPriorityQueue();

        this.emit(ProviderEvent.Registered, {
            providerId: provider.id,
            timestamp: Date.now()
        });
    }

    public async unregisterProvider(providerId: string): Promise<void> {
        const registration = this.providers.get(providerId);
        if (!registration) {
            throw new ProviderError('Provider not found', providerId);
        }

        // Remove from collections
        this.providers.delete(providerId);
        this.priorityQueue = this.priorityQueue.filter(id => id !== providerId);

        this.emit(ProviderEvent.Unregistered, {
            providerId,
            timestamp: Date.now()
        });
    }

    public getProvider(providerId: string): LLMProvider | undefined {
        return this.providers.get(providerId)?.provider;
    }

    public getProviderConfig(providerId: string): ProviderConfig | undefined {
        return this.providers.get(providerId)?.config;
    }

    public getAllProviders(): Array<{ id: string; provider: LLMProvider }> {
        return Array.from(this.providers.entries()).map(([id, reg]) => ({
            id,
            provider: reg.provider
        }));
    }

    public getNextAvailableProvider(): LLMProvider | undefined {
        for (const providerId of this.priorityQueue) {
            const registration = this.providers.get(providerId);
            if (registration?.state === ProviderState.Active) {
                return registration.provider;
            }
        }
        return undefined;
    }

    public updateProviderState(providerId: string, state: ProviderState): void {
        const registration = this.providers.get(providerId);
        if (!registration) {
            throw new ProviderError('Provider not found', providerId);
        }

        registration.state = state;
        this.emit(ProviderEvent.StateChanged, {
            providerId,
            state,
            timestamp: Date.now()
        });
    }

    private sortPriorityQueue(): void {
        // Sort by registration time for now, could be enhanced with more sophisticated priority logic
        this.priorityQueue.sort((a, b) => {
            const regA = this.providers.get(a);
            const regB = this.providers.get(b);
            if (!regA || !regB) {return 0;}
            return regA.registeredAt - regB.registeredAt;
        });
    }

    public dispose(): void {
        this.providers.clear();
        this.priorityQueue = [];
        this.removeAllListeners();
    }
}