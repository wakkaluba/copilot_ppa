import { EventEmitter } from 'events';
import { LLMProvider } from '../../../llm/llm-provider';
import { ProviderDescriptor } from '../types';
export declare class LLMProviderRegistryService extends EventEmitter {
    private providers;
    private descriptors;
    registerProvider(name: string, provider: LLMProvider): void;
    getProvider(name: string): LLMProvider | undefined;
    configureProvider(name: string, options?: Record<string, unknown>): Promise<LLMProvider>;
    getProviders(): Map<string, LLMProvider>;
    registerDescriptor(descriptor: ProviderDescriptor): void;
    getDescriptor(name: string): ProviderDescriptor | undefined;
    getAllDescriptors(): ProviderDescriptor[];
}
