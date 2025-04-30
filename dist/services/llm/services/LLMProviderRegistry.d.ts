import { EventEmitter } from 'events';
import { LLMProvider, ProviderConfig, ProviderState } from '../types';
export declare class LLMProviderRegistry extends EventEmitter {
    private providers;
    private priorityQueue;
    private static instance;
    private constructor();
    static getInstance(): LLMProviderRegistry;
    registerProvider(provider: LLMProvider, config: ProviderConfig): Promise<void>;
    unregisterProvider(providerId: string): Promise<void>;
    getProvider(providerId: string): LLMProvider | undefined;
    getProviderConfig(providerId: string): ProviderConfig | undefined;
    getAllProviders(): Array<{
        id: string;
        provider: LLMProvider;
    }>;
    getNextAvailableProvider(): LLMProvider | undefined;
    updateProviderState(providerId: string, state: ProviderState): void;
    private sortPriorityQueue;
    dispose(): void;
}
