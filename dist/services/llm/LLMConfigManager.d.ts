import { EventEmitter } from 'events';
import { ProviderConfig } from './interfaces';
export declare class LLMConfigManager extends EventEmitter {
    private static instance;
    private readonly storageService;
    private readonly validationService;
    private readonly changeTracker;
    private constructor();
    static getInstance(): LLMConfigManager;
    getProviderConfig(providerName: string): ProviderConfig | undefined;
    getAllConfigs(): Map<string, ProviderConfig>;
    updateProviderConfig(providerName: string, config: Partial<ProviderConfig>): Promise<void>;
    isProviderEnabled(providerName: string): boolean;
    enableProvider(providerName: string): Promise<void>;
    disableProvider(providerName: string): Promise<void>;
    getProviderOptions(providerName: string): Record<string, unknown>;
    private setupEventListeners;
    dispose(): void;
}
